// utils/paypalTypeGuards.ts - POPRAWIONA KONWERSJA KWOT

import type {
  PayPalDonation,
  PayPalDonationStatus,
  PayPalWebhookEvent,
  PayPalWebhookEventType,
  PayPalOrderRequest,
  PayPalCaptureResponse,
  AmountInCents,
} from "../types";

/**
 * Sprawdza czy kwota jest prawidłowa dla PayPal (w centach)
 * Minimalna kwota: 1 EUR (100 centów)
 * Maksymalna kwota: 10,000 EUR (1,000,000 centów)
 */
export function isValidPayPalAmount(amount: unknown): amount is AmountInCents {
  return (
    typeof amount === "number" &&
    Number.isInteger(amount) &&
    amount >= 100 && // Minimum 1 EUR
    amount <= 1000000 && // Maximum 10,000 EUR
    amount > 0
  );
}

/**
 * ✅ POPRAWKA: Sprawdza czy kwota w EUR jest prawidłowa
 * Akceptuje kwoty z dokładnością do 2 miejsc po przecinku
 */
export function isValidEURAmount(amount: unknown): amount is number {
  if (typeof amount !== "number" || isNaN(amount)) return false;

  return (
    amount >= 1 && // Minimum 1 EUR
    amount <= 10000 && // Maximum 10,000 EUR
    amount > 0 &&
    // Sprawdź czy ma maksymalnie 2 miejsca po przecinku
    Math.round(amount * 100) === amount * 100
  );
}

/**
 * Sprawdza czy waluta jest obsługiwana
 */
export function isValidPayPalCurrency(currency: unknown): currency is string {
  const supportedCurrencies = ["EUR", "USD", "GBP", "PLN", "CHF"];
  return typeof currency === "string" && supportedCurrencies.includes(currency);
}

/**
 * Sprawdza czy status donacji jest prawidłowy
 */
export function isValidDonationStatus(
  status: unknown
): status is PayPalDonationStatus {
  const validStatuses: PayPalDonationStatus[] = [
    "pending",
    "processing",
    "completed",
    "failed",
    "cancelled",
    "refunded",
    "disputed",
  ];
  return (
    typeof status === "string" &&
    validStatuses.includes(status as PayPalDonationStatus)
  );
}

/**
 * Sprawdza czy typ webhook event jest obsługiwany
 */
export function isValidPayPalWebhookEventType(
  eventType: unknown
): eventType is PayPalWebhookEventType {
  const supportedEventTypes: PayPalWebhookEventType[] = [
    "CHECKOUT.ORDER.APPROVED",
    "PAYMENT.CAPTURE.COMPLETED",
    "PAYMENT.CAPTURE.DENIED",
    "PAYMENT.CAPTURE.PENDING",
    "PAYMENT.CAPTURE.REFUNDED",
    "PAYMENT.CAPTURE.REVERSED",
    "CHECKOUT.ORDER.COMPLETED",
    "CHECKOUT.ORDER.CANCELLED",
    "PAYMENT.AUTHORIZATION.CREATED",
    "PAYMENT.AUTHORIZATION.VOIDED",
  ];
  return (
    typeof eventType === "string" &&
    supportedEventTypes.includes(eventType as PayPalWebhookEventType)
  );
}

/**
 * Sprawdza czy obiekt jest prawidłowym PayPal webhook event
 */
export function isValidPayPalWebhookEvent(
  event: unknown
): event is PayPalWebhookEvent {
  if (typeof event !== "object" || event === null) {
    return false;
  }

  const e = event as Record<string, unknown>;

  return (
    typeof e.id === "string" &&
    typeof e.event_version === "string" &&
    typeof e.create_time === "string" &&
    typeof e.resource_type === "string" &&
    isValidPayPalWebhookEventType(e.event_type) &&
    typeof e.summary === "string" &&
    typeof e.resource === "object" &&
    e.resource !== null &&
    Array.isArray(e.links)
  );
}

/**
 * ✅ POPRAWKA: Sprawdza czy obiekt jest prawidłowym PayPalOrderRequest
 * WAŻNE: amount już powinno być w centach!
 */
export function isValidPayPalOrderRequest(
  request: unknown
): request is PayPalOrderRequest {
  if (typeof request !== "object" || request === null) {
    return false;
  }

  const r = request as Record<string, unknown>;

  return (
    isValidPayPalAmount(r.amount) && // amount już w centach
    isValidPayPalCurrency(r.currency) &&
    // Opcjonalne pola
    (r.donor_email === undefined || isValidEmail(r.donor_email)) &&
    (r.donor_name === undefined || isNonEmptyString(r.donor_name)) &&
    (r.donor_message === undefined || isValidMessage(r.donor_message)) &&
    (r.return_url === undefined || isValidUrl(r.return_url)) &&
    (r.cancel_url === undefined || isValidUrl(r.cancel_url))
  );
}

/**
 * Sprawdza czy obiekt jest prawidłowym PayPalDonation
 */
export function isValidPayPalDonation(
  donation: unknown
): donation is PayPalDonation {
  if (typeof donation !== "object" || donation === null) {
    return false;
  }

  const d = donation as Record<string, unknown>;

  return (
    typeof d.id === "string" &&
    isValidPayPalAmount(d.amount) &&
    isValidPayPalCurrency(d.currency) &&
    typeof d.paypal_order_id === "string" &&
    isValidDonationStatus(d.status) &&
    typeof d.created_at === "string" &&
    typeof d.webhook_verified === "boolean" &&
    // Opcjonalne pola
    (d.paypal_payment_id === undefined ||
      typeof d.paypal_payment_id === "string") &&
    (d.donor_email === undefined || isValidEmail(d.donor_email)) &&
    (d.donor_name === undefined || isNonEmptyString(d.donor_name)) &&
    (d.donor_message === undefined || isValidMessage(d.donor_message)) &&
    (d.completed_at === undefined || typeof d.completed_at === "string") &&
    (d.failed_at === undefined || typeof d.failed_at === "string") &&
    (d.refunded_amount === undefined ||
      isValidPayPalAmount(d.refunded_amount)) &&
    (d.fees_amount === undefined || typeof d.fees_amount === "number") &&
    (d.net_amount === undefined || typeof d.net_amount === "number")
  );
}

/**
 * Sprawdza czy obiekt ma strukturę PayPal capture response
 */
export function isValidPayPalCaptureResponse(
  response: unknown
): response is PayPalCaptureResponse {
  if (typeof response !== "object" || response === null) {
    return false;
  }

  const r = response as Record<string, unknown>;

  return (
    typeof r.payment_id === "string" &&
    typeof r.status === "string" &&
    typeof r.amount === "object" &&
    r.amount !== null &&
    hasValidAmountStructure(r.amount)
  );
}

/**
 * Sprawdza czy email jest prawidłowy
 */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Sprawdza czy wiadomość jest prawidłowa (nie za długa)
 */
export function isValidMessage(message: unknown): message is string {
  return (
    typeof message === "string" &&
    message.trim().length > 0 &&
    message.length <= 500 // Maksymalnie 500 znaków
  );
}

/**
 * Sprawdza czy URL jest prawidłowy
 */
export function isValidUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sprawdza czy string nie jest pusty
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Sprawdza strukturę amount z PayPal API
 */
function hasValidAmountStructure(amount: unknown): boolean {
  if (typeof amount !== "object" || amount === null) return false;

  const a = amount as Record<string, unknown>;
  return (
    typeof a.value === "string" &&
    typeof a.currency_code === "string" &&
    isValidPayPalCurrency(a.currency_code)
  );
}

/**
 * Sprawdza czy ID jest prawidłowe (PayPal order/payment ID)
 */
export function isValidPayPalId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    id.length > 0 &&
    id.length <= 255 &&
    // PayPal IDs zazwyczaj są alfanumeryczne z możliwymi myślnikami
    /^[A-Za-z0-9\-_]+$/.test(id)
  );
}

/**
 * Sprawdza czy timestamp jest prawidłowy
 */
export function isValidTimestamp(timestamp: unknown): timestamp is string {
  if (typeof timestamp !== "string") return false;

  try {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Waliduje cały obiekt donation przed zapisem do Directus
 */
export function validateDonationForDirectus(
  donation: unknown
): donation is Omit<PayPalDonation, "id"> {
  if (typeof donation !== "object" || donation === null) {
    return false;
  }

  const d = donation as Record<string, unknown>;

  return (
    isValidPayPalAmount(d.amount) &&
    isValidPayPalCurrency(d.currency) &&
    isValidPayPalId(d.paypal_order_id) &&
    isValidDonationStatus(d.status) &&
    isValidTimestamp(d.created_at) &&
    typeof d.webhook_verified === "boolean"
  );
}

/**
 * ✅ POPRAWKA: Konwertuje EUR na centy z dokładnym zaokrągleniem
 */
export function convertEURToCents(eurAmount: number): AmountInCents | null {
  if (!isValidEURAmount(eurAmount)) {
    return null;
  }

  // Użyj Math.round dla dokładnej konwersji
  const cents = Math.round(eurAmount * 100);
  return isValidPayPalAmount(cents) ? cents : null;
}

/**
 * ✅ POPRAWKA: Konwertuje centy na EUR z walidacją
 */
export function convertCentsToEUR(cents: AmountInCents): number | null {
  if (!isValidPayPalAmount(cents)) {
    return null;
  }

  return cents / 100;
}
