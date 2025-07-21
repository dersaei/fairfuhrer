// app/api/partner-application/route.ts - KOMPLETNY PLIK z naprawionymi błędami TypeScript
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

// Funkcja saveToDirectus - wszystkie pola opcjonalne oprócz podstawowych
async function saveToDirectus(data: Partial<PartnerSubmissionData>) {
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

    // POPRAWIONE PARSOWANIE sustainability_goals (teraz opcjonalne)
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
        // ZMIANA: Nie zwracaj błędu, po prostu ustaw pustą tablicę
        sustainabilityGoals = [];
      }
    }

    console.log("Parsed sustainabilityGoals:", sustainabilityGoals);

    // POPRAWKA: Pobierz wartości jako string, następnie waliduj i typuj
    const certificationStatusRaw = formData.get(
      "certificationStatus"
    ) as string;
    const companySizeRaw = formData.get("companySize") as string;

    console.log("New fields raw:", {
      certificationStatusRaw,
      companySizeRaw,
    });

    // POPRAWKA: Zadeklaruj zmienne z prawidłowymi typami
    let certificationStatus: "A" | "B" | "C" | undefined = undefined;
    let companySize: "micro" | "small" | "medium" | "ngo" | undefined =
      undefined;

    // Walidacja i przypisanie certificationStatus
    if (certificationStatusRaw) {
      if (["A", "B", "C"].includes(certificationStatusRaw)) {
        certificationStatus = certificationStatusRaw as "A" | "B" | "C";
      } else {
        return NextResponse.json(
          { error: "Nieprawidłowy status certyfikacji" },
          { status: 400 }
        );
      }
    }

    // Walidacja i przypisanie companySize
    if (companySizeRaw) {
      if (["micro", "small", "medium", "ngo"].includes(companySizeRaw)) {
        companySize = companySizeRaw as "micro" | "small" | "medium" | "ngo";
      } else {
        return NextResponse.json(
          { error: "Nieprawidłowa wielkość firmy" },
          { status: 400 }
        );
      }
    }

    console.log("Validated fields:", {
      certificationStatus,
      companySize,
    });

    // ZMIANA: Wyciągnij dane tekstowe z formularza (większość pól opcjonalnych)
    const submissionData: Partial<PartnerSubmissionData> = {
      // WYMAGANE POLA - podstawowe dane
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      place_name: formData.get("placeName") as string,
      address: formData.get("address") as string,

      // OPCJONALNE POLA - zawartość
      text_content: (formData.get("textContent") as string) || "",
      website_url: (formData.get("websiteUrl") as string) || undefined,
      message: (formData.get("message") as string) || undefined,

      // ZMIANA: OPCJONALNE POLA Teilnahmebedingungen
      certificate: (formData.get("certificate") as string) || "",
      sustainability_goals:
        sustainabilityGoals.length > 0 ? sustainabilityGoals : undefined,

      // POPRAWKA: Używaj już walidowanych i prawidłowo otypowanych zmiennych
      certification_status: certificationStatus, // ✅ Teraz prawidłowy typ
      company_size: companySize, // ✅ Teraz prawidłowy typ

      // Status i czas
      status: "new" as const,
      created_at: new Date().toISOString(),
    };

    // ZMIANA: Walidacja tylko podstawowych danych (bez pól Teilnahmebedingungen)
    if (
      !submissionData.first_name ||
      !submissionData.last_name ||
      !submissionData.email ||
      !submissionData.place_name ||
      !submissionData.address
      // USUNIĘTE WSZYSTKIE WALIDACJE Teilnahmebedingungen:
      // !submissionData.certificate ||
      // !sustainabilityGoals.length ||
      // !submissionData.certification_status ||
      // !submissionData.company_size
    ) {
      console.error("Validation failed:", {
        first_name: !!submissionData.first_name,
        last_name: !!submissionData.last_name,
        email: !!submissionData.email,
        place_name: !!submissionData.place_name,
        address: !!submissionData.address,
        // OPCJONALNE - tylko do logowania
        certificate: !!submissionData.certificate,
        sustainabilityGoals: sustainabilityGoals.length,
        certification_status: !!submissionData.certification_status,
        company_size: !!submissionData.company_size,
      });

      return NextResponse.json(
        {
          error:
            "Brakuje wymaganych podstawowych danych (imię, nazwisko, email, nazwa pinu, adres)",
        },
        { status: 400 }
      );
    }

    // Przesyłanie plików do Supabase

    // OPCJONALNE: Główne zdjęcie
    const mainImage = formData.get("mainImage") as File;
    if (mainImage && mainImage.size > 0) {
      // Jeśli zdjęcie zostało przesłane, prześlij je
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
    }

    // OPCJONALNE: Dodatkowe zdjęcia
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

    // OPCJONALNE: Plik audio
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

    // Zapisz do Directus (wszystkie pola mogą być opcjonalne oprócz podstawowych)
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
