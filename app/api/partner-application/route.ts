// app/api/partner-application/route.ts - ZAKTUALIZOWANA WERSJA z nowymi polami
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { PartnerSubmissionData } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const directusUrl = process.env.DIRECTUS_URL!;

// Używamy service role key dla server-side operacji
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface FileUploadResult {
  url: string;
  error?: string;
}

async function uploadFileToSupabase(
  file: File,
  bucket: string,
  folder: string
): Promise<FileUploadResult> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return { url: "", error: error.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (error) {
    console.error("File upload error:", error);
    return { url: "", error: "Błąd podczas przesyłania pliku" };
  }
}

async function saveToDirectus(
  data: Partial<PartnerSubmissionData> & { main_image_url: string }
) {
  try {
    const response = await fetch(`${directusUrl}/items/partner_applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Directus może zwracać 204 (sukces bez treści) lub 200/201
    if (response.ok) {
      // Próbuj sparsować JSON, ale nie rzucaj błędem jeśli nie ma treści
      try {
        const result = await response.json();
        return result;
      } catch {
        // 204 No Content - to też sukces
        return { success: true, id: "created" };
      }
    } else {
      const errorData = await response.text();
      console.error("Directus save error:", errorData);
      throw new Error(`Błąd zapisu do bazy danych: ${response.status}`);
    }
  } catch (error) {
    console.error("Error saving to Directus:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Wyciągnij dane tekstowe z formularza
    const submissionData: Partial<PartnerSubmissionData> = {
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      place_name: formData.get("placeName") as string,
      address: formData.get("address") as string,
      latitude: parseFloat(formData.get("latitude") as string),
      longitude: parseFloat(formData.get("longitude") as string),
      text_content: formData.get("textContent") as string,
      website_url: (formData.get("websiteUrl") as string) || undefined,
      message: (formData.get("message") as string) || undefined,

      // NOWE POLA
      certificate: formData.get("certificate") as string,
      sustainability_goals: JSON.parse(
        (formData.get("sustainabilityGoals") as string) || "[]"
      ),

      status: "new" as const,
      created_at: new Date().toISOString(),
    };

    // Walidacja podstawowych danych (w tym nowe pola)
    if (
      !submissionData.first_name ||
      !submissionData.last_name ||
      !submissionData.email ||
      !submissionData.place_name ||
      !submissionData.text_content ||
      !submissionData.certificate ||
      !submissionData.sustainability_goals ||
      submissionData.sustainability_goals.length === 0
    ) {
      return NextResponse.json(
        { error: "Brakuje wymaganych pól" },
        { status: 400 }
      );
    }

    // Przesyłanie plików do Supabase

    // Główne zdjęcie (wymagane)
    const mainImage = formData.get("mainImage") as File;
    if (mainImage && mainImage.size > 0) {
      const uploadResult = await uploadFileToSupabase(
        mainImage,
        "media-files",
        "partner-applications/main-images"
      );
      if (uploadResult.error) {
        return NextResponse.json(
          { error: `Błąd przesyłania głównego zdjęcia: ${uploadResult.error}` },
          { status: 500 }
        );
      }
      submissionData.main_image_url = uploadResult.url;
    } else {
      return NextResponse.json(
        { error: "Główne zdjęcie jest wymagane" },
        { status: 400 }
      );
    }

    // Dodatkowe zdjęcia
    const additionalImages: string[] = [];
    for (let i = 0; i < 6; i++) {
      const additionalImage = formData.get(`additionalImage${i}`) as File;
      if (additionalImage && additionalImage.size > 0) {
        const uploadResult = await uploadFileToSupabase(
          additionalImage,
          "media-files",
          "partner-applications/additional-images"
        );
        if (uploadResult.error) {
          console.warn(
            `Błąd przesyłania dodatkowego zdjęcia ${i}:`,
            uploadResult.error
          );
        } else {
          additionalImages.push(uploadResult.url);
        }
      }
    }
    if (additionalImages.length > 0) {
      submissionData.additional_images_urls = additionalImages;
    }

    // Plik audio (opcjonalny)
    const audioFile = formData.get("audioFile") as File;
    if (audioFile && audioFile.size > 0) {
      const uploadResult = await uploadFileToSupabase(
        audioFile,
        "media-files",
        "partner-applications/audio-files"
      );
      if (uploadResult.error) {
        console.warn("Błąd przesyłania pliku audio:", uploadResult.error);
      } else {
        submissionData.audio_file_url = uploadResult.url;
      }
    }

    // Zapisz do Directus (teraz submissionData ma wszystkie wymagane pola)
    const savedData = await saveToDirectus(
      submissionData as PartnerSubmissionData
    );

    // POPRAWIONA ODPOWIEDŹ - zawsze zwracaj sukces jeśli dotarło tutaj
    return NextResponse.json(
      {
        success: true,
        message: "Die Bewerbung wurde erfolgreich gesendet", // NIEMIECKA WIADOMOŚĆ
        data: savedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Ein Fehler ist beim Verarbeiten der Bewerbung aufgetreten", // NIEMIECKA WIADOMOŚĆ
        details: error instanceof Error ? error.message : "Unbekannter Fehler",
      },
      { status: 500 }
    );
  }
}
