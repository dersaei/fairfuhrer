// lib/directus.ts - Next.js 16.0.7 + React 19.2.1 compatible
// ✅ Server-only protection - prevents accidental client-side imports
import "server-only";

import { createDirectus, rest } from "@directus/sdk";
import type {
  Place,
  Category,
  ContactMessage,
  HomePageContent,
  FeaturedPin,
  ImpressumContent,
  DatenschutzContent,
  ContactFormContent,
  ContactInfoContent,
  SupportSectionContent,
  PayPalDonation,
  DirectusPayPalDonation,
  WebhookLog,
} from "@/types";

// ========================================
// Environment Variable Validation
// ========================================

const DIRECTUS_URL = process.env.DIRECTUS_URL;
if (!DIRECTUS_URL) {
  throw new Error("❌ Missing required environment variable: DIRECTUS_URL");
}

export const directus = createDirectus(DIRECTUS_URL).with(
  rest({
    onRequest: (opts) => ({
      ...opts,
      // Cache GET requesty (miejsca, kategorie) - oszczędność kosztów
      // Nie cache'uj POST/PUT/DELETE - zawsze świeże dane
      cache: opts.method === "GET" ? "default" : "no-store",
    }),
  })
);

// Typ dla Directus Schema z moimi kolekcjami + PayPal
export interface DirectusSchema {
  Orte: Place[]; // Niemiecka nazwa
  Kategorie: Category[]; // Niemiecka nazwa
  contact_messages: ContactMessage[];
  home_page_content: HomePageContent[];
  featured_pins: FeaturedPin[];
  impressum_content: ImpressumContent[];
  datenschutz_content: DatenschutzContent[];
  contact_info_content: ContactInfoContent[];
  // NOWE kolekcje PayPal:
  paypal_donations: DirectusPayPalDonation[];
  webhook_logs: WebhookLog[];
}

export async function getHomePageContent(): Promise<HomePageContent | null> {
  const isDev = process.env.NODE_ENV === "development";
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/home_page_content?filter[page_slug][_eq]=home&fields=*&limit=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        ...(isDev
          ? { cache: "no-store" as const }
          : { next: { revalidate: 3600, tags: ["home-page"] } }),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "(unreadable)");
      throw new Error(`Failed to fetch home page content: ${response.status} ${response.statusText} — ${body}`);
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      return data.data[0] as HomePageContent;
    }

    return null;
  } catch (error) {
    console.error("Error fetching home page content:", error);
    return null;
  }
}

export async function getFeaturedPins(): Promise<FeaturedPin[]> {
  try {
    const isDev = process.env.NODE_ENV === "development";
    const response = await fetch(
      `${DIRECTUS_URL}/items/featured_pins?filter[status][_eq]=published&sort=sort&fields=*,ort.*,ort.Kategorie.Kategorie_id.*`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        ...(isDev
          ? { cache: "no-store" as const }
          : { next: { revalidate: 3600, tags: ["featured-pins"] } }),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "(unreadable)");
      throw new Error(`Failed to fetch featured pins: ${response.status} ${response.statusText} — ${body}`);
    }

    const data = await response.json();
    return (data.data as FeaturedPin[]) || [];
  } catch (error) {
    console.error("Error fetching featured pins:", error);
    return [];
  }
}

export async function getImpressumContent(): Promise<ImpressumContent | null> {
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/impressum_content?filter[page_slug][_eq]=impressum&fields=id,page_slug,title,address,email,business_info_top,business_info_bottom,legal_content,webseitenerstellung`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 86400, tags: ["impressum"] },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch impressum content");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      return data.data[0] as ImpressumContent;
    }

    return null;
  } catch (error) {
    console.error("Error fetching impressum content:", error);
    return null;
  }
}

export async function getDatenschutzContent(): Promise<DatenschutzContent | null> {
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/datenschutz_content?filter[page_slug][_eq]=datenschutz`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 86400, tags: ["datenschutz"] },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch datenschutz content");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      return data.data[0] as DatenschutzContent;
    }

    return null;
  } catch (error) {
    console.error("Error fetching datenschutz content:", error);
    return null;
  }
}

export async function getSupportSectionContent(): Promise<SupportSectionContent | null> {
  const isDev = process.env.NODE_ENV === "development";
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/support_section_content?filter[page_slug][_eq]=kontakt&fields=*&limit=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        ...(isDev
          ? { cache: "no-store" as const }
          : { next: { revalidate: 3600, tags: ["support-section"] } }),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "(unreadable)");
      throw new Error(`Failed to fetch support section content: ${response.status} ${response.statusText} — ${body}`);
    }

    const data = await response.json();
    return data.data?.[0] ?? null;
  } catch (error) {
    console.error("Error fetching support section content:", error);
    return null;
  }
}

export async function getContactFormContent(): Promise<ContactFormContent | null> {
  const isDev = process.env.NODE_ENV === "development";
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/contact_form_content?filter[page_slug][_eq]=kontakt&fields=*&limit=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        ...(isDev
          ? { cache: "no-store" as const }
          : { next: { revalidate: 3600, tags: ["contact-form"] } }),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "(unreadable)");
      throw new Error(`Failed to fetch contact form content: ${response.status} ${response.statusText} — ${body}`);
    }

    const data = await response.json();
    return data.data?.[0] ?? null;
  } catch (error) {
    console.error("Error fetching contact form content:", error);
    return null;
  }
}

export async function getContactInfoContent(): Promise<ContactInfoContent | null> {
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/contact_info_content?filter[page_slug][_eq]=kontakt&fields=*&limit=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600, tags: ["contact-info"] },
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "(unreadable)");
      throw new Error(`Failed to fetch contact info content: ${response.status} ${response.statusText} — ${body}`);
    }

    const data = await response.json();
    return data.data?.[0] ?? null;
  } catch (error) {
    console.error("Error fetching contact info content:", error);
    return null;
  }
}

// ========================================
// NOWE FUNKCJE DLA PAYPAL DONACJI
// ========================================

/**
 * Tworzy nową donację PayPal w Directus
 */
export async function createPayPalDonation(
  donation: Omit<PayPalDonation, "id">
): Promise<PayPalDonation | null> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/paypal_donations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(donation),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create PayPal donation: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data as PayPalDonation;
  } catch (error) {
    console.error("Error creating PayPal donation:", error);
    return null;
  }
}

/**
 * Aktualizuje status donacji PayPal
 */
export async function updatePayPalDonationStatus(
  donationId: string,
  updates: Partial<PayPalDonation>
): Promise<PayPalDonation | null> {
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/paypal_donations/${donationId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update PayPal donation: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data as PayPalDonation;
  } catch (error) {
    console.error("Error updating PayPal donation:", error);
    return null;
  }
}

/**
 * Pobiera donację PayPal po ID
 */
export async function getPayPalDonation(
  donationId: string
): Promise<PayPalDonation | null> {
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/paypal_donations/${donationId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Donation not found
      }
      throw new Error(
        `Failed to fetch PayPal donation: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data as PayPalDonation;
  } catch (error) {
    console.error("Error fetching PayPal donation:", error);
    return null;
  }
}

/**
 * Pobiera donację PayPal po PayPal Order ID
 */
export async function getPayPalDonationByOrderId(
  paypalOrderId: string
): Promise<PayPalDonation | null> {
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/paypal_donations?filter[paypal_order_id][_eq]=${paypalOrderId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch PayPal donation by order ID: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      return data.data[0] as PayPalDonation;
    }

    return null;
  } catch (error) {
    console.error("Error fetching PayPal donation by order ID:", error);
    return null;
  }
}

/**
 * Loguje webhook event
 */
export async function logWebhookEvent(
  webhookLog: Omit<WebhookLog, "id">
): Promise<WebhookLog | null> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/webhook_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookLog),
    });

    if (!response.ok) {
      throw new Error(`Failed to log webhook event: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data as WebhookLog;
  } catch (error) {
    console.error("Error logging webhook event:", error);
    return null;
  }
}

/**
 * Pobiera statystyki donacji
 */
export async function getDonationStats(
  startDate?: string,
  endDate?: string
): Promise<{
  total_amount: number;
  total_count: number;
  successful_count: number;
  failed_count: number;
  average_amount: number;
} | null> {
  try {
    let url = `${DIRECTUS_URL}/items/paypal_donations?aggregate[sum]=amount&aggregate[count]=*`;

    if (startDate) {
      url += `&filter[created_at][_gte]=${startDate}`;
    }
    if (endDate) {
      url += `&filter[created_at][_lte]=${endDate}`;
    }

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch donation stats: ${response.statusText}`);
    }

    const data = await response.json();

    // Zapytanie o successful donations
    let successUrl = `${DIRECTUS_URL}/items/paypal_donations?filter[status][_eq]=completed&aggregate[count]=*`;
    if (startDate) successUrl += `&filter[created_at][_gte]=${startDate}`;
    if (endDate) successUrl += `&filter[created_at][_lte]=${endDate}`;

    const successResponse = await fetch(successUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const successData = await successResponse.json();

    // Zapytanie o failed donations
    let failedUrl = `${DIRECTUS_URL}/items/paypal_donations?filter[status][_in]=failed,cancelled&aggregate[count]=*`;
    if (startDate) failedUrl += `&filter[created_at][_gte]=${startDate}`;
    if (endDate) failedUrl += `&filter[created_at][_lte]=${endDate}`;

    const failedResponse = await fetch(failedUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const failedData = await failedResponse.json();

    const totalAmount = data.data?.[0]?.sum?.amount || 0;
    const totalCount = data.data?.[0]?.count || 0;
    const successfulCount = successData.data?.[0]?.count || 0;
    const failedCount = failedData.data?.[0]?.count || 0;

    return {
      total_amount: totalAmount,
      total_count: totalCount,
      successful_count: successfulCount,
      failed_count: failedCount,
      average_amount: totalCount > 0 ? Math.round(totalAmount / totalCount) : 0,
    };
  } catch (error) {
    console.error("Error fetching donation stats:", error);
    return null;
  }
}

/**
 * Pobiera ostatnie donacje (dla admina)
 */
export async function getRecentDonations(
  limit: number = 10
): Promise<PayPalDonation[]> {
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/paypal_donations?sort=-created_at&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch recent donations: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data as PayPalDonation[];
  } catch (error) {
    console.error("Error fetching recent donations:", error);
    return [];
  }
}
