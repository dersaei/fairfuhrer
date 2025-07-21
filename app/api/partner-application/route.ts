// app/api/partner-application/route.ts - POPRAWIONA WERSJA z nowymi polami
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
    // DODAJ LOGOWANIE dla debugowania
    console.log("Sending to Directus:", JSON.stringify(data, null, 2));

    const response = await fetch(`${directusUrl}/items/partner_applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Directus response status:", response.status);

    // Directus może zwracać 204 (sukces bez treści) lub 200/201
    if (response.ok) {
      try {
        const result = await response.json();
        console.log("Directus response data:", result);
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

    // POPRAWIONE PARSOWANIE sustainability_goals
    let sustainabilityGoals: number[] = [];
    const sustainabilityGoalsRaw = formData.get("sustainabilityGoals");

    console.log("Raw sustainabilityGoals from form:", sustainabilityGoalsRaw);

    if (sustainabilityGoalsRaw) {
      try {
        const parsed = JSON.parse(sustainabilityGoalsRaw as string);
        if (Array.isArray(parsed)) {
          sustainabilityGoals = parsed.filter(
            (id) => typeof id === "number" && id > 0
          );
        }
      } catch (error) {
        console.error("Error parsing sustainabilityGoals:", error);
        return NextResponse.json(
          { error: "Błąd parsowania celów zrównoważonego rozwoju" },
          { status: 400 }
        );
      }
    }

    console.log("Parsed sustainabilityGoals:", sustainabilityGoals);

    // NOWE POLA - walidacja
    const certificationStatus = formData.get("certificationStatus") as string;
    const companySize = formData.get("companySize") as string;

    console.log("New fields:", {
      certificationStatus,
      companySize,
    });

    // Walidacja nowych pól
    if (
      !certificationStatus ||
      !["A", "B", "C"].includes(certificationStatus)
    ) {
      return NextResponse.json(
        { error: "Nieprawidłowy status certyfikacji" },
        { status: 400 }
      );
    }

    if (
      !companySize ||
      !["micro", "small", "medium", "ngo"].includes(companySize)
    ) {
      return NextResponse.json(
        { error: "Nieprawidłowa wielkość firmy" },
        { status: 400 }
      );
    }

    // Wyciągnij dane tekstowe z formularza
    const submissionData: Partial<PartnerSubmissionData> = {
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      place_name: formData.get("placeName") as string,
      address: formData.get("address") as string,
      text_content: formData.get("textContent") as string,
      website_url: (formData.get("websiteUrl") as string) || undefined,
      message: (formData.get("message") as string) || undefined,

      // ISTNIEJĄCE POLA
      certificate: formData.get("certificate") as string,
      sustainability_goals: sustainabilityGoals,

      // NOWE POLA
      certification_status: certificationStatus as "A" | "B" | "C",
      company_size: companySize as "micro" | "small" | "medium" | "ngo",

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
      !sustainabilityGoals.length ||
      !submissionData.certification_status ||
      !submissionData.company_size
    ) {
      console.error("Validation failed:", {
        first_name: !!submissionData.first_name,
        last_name: !!submissionData.last_name,
        email: !!submissionData.email,
        place_name: !!submissionData.place_name,
        text_content: !!submissionData.text_content,
        certificate: !!submissionData.certificate,
        sustainabilityGoals: sustainabilityGoals.length,
        certification_status: !!submissionData.certification_status,
        company_size: !!submissionData.company_size,
      });

      return NextResponse.json(
        {
          error:
            "Brakuje wymaganych pól lub nie wybrano celów zrównoważonego rozwoju, lub nie wybrano opcji certyfikacji/wielkości firmy",
        },
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

    // Zapisz do Directus
    const savedData = await saveToDirectus(
      submissionData as PartnerSubmissionData
    );

    return NextResponse.json(
      {
        success: true,
        message: "Die Bewerbung wurde erfolgreich gesendet",
        data: savedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Ein Fehler ist beim Verarbeiten der Bewerbung aufgetreten",
        details: error instanceof Error ? error.message : "Unbekannter Fehler",
      },
      { status: 500 }
    );
  }
}
