export interface PayPalDonation {
  id: string;
  amount: number;
  currency: string;
  paypal_order_id: string;
  paypal_payment_id?: string;
  donor_email?: string;
  donor_name?: string;
  donor_message?: string;
  status: PayPalDonationStatus;
  created_at: string;
  completed_at?: string;
  failed_at?: string;
  webhook_verified: boolean;
  refunded_amount?: number;
  fees_amount?: number;
  net_amount?: number;
}

export type PayPalDonationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"
  | "disputed";

export interface PayPalOrderRequest {
  amount: number;
  currency: string;
  donor_email?: string;
  donor_name?: string;
  donor_message?: string;
}

export interface PayPalOrderResponse {
  order_id: string;
  status: string;
  approval_url?: string;
  donation_id: string;
}

export interface PayPalCaptureRequest {
  order_id: string;
  donation_id: string;
}

export interface PayPalCaptureResponse {
  payment_id: string;
  status: string;
  amount: {
    value: string;
    currency_code: string;
  };
  fees?: {
    value: string;
    currency_code: string;
  };
  net_amount?: {
    value: string;
    currency_code: string;
  };
}

export interface PayPalWebhookEvent {
  id: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  event_type: PayPalWebhookEventType;
  summary: string;
  resource: PayPalWebhookResource;
  links: PayPalLink[];
}

export type PayPalWebhookEventType =
  | "CHECKOUT.ORDER.APPROVED"
  | "PAYMENT.CAPTURE.COMPLETED"
  | "PAYMENT.CAPTURE.DENIED"
  | "PAYMENT.CAPTURE.PENDING"
  | "PAYMENT.CAPTURE.REFUNDED"
  | "PAYMENT.CAPTURE.REVERSED"
  | "CHECKOUT.ORDER.COMPLETED"
  | "CHECKOUT.ORDER.CANCELLED"
  | "PAYMENT.AUTHORIZATION.CREATED"
  | "PAYMENT.AUTHORIZATION.VOIDED";

export interface PayPalWebhookResource {
  id: string;
  status: string;
  amount?: {
    currency_code: string;
    value: string;
  };
  seller_protection?: {
    status: string;
    dispute_categories: string[];
  };
  final_capture?: boolean;
  disbursement_mode?: string;
  links: PayPalLink[];
  create_time?: string;
  update_time?: string;
  [key: string]: unknown;
}

export interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

export interface PayPalWebhookVerificationRequest {
  auth_algo: string;
  cert_id: string;
  transmission_id: string;
  transmission_sig: string;
  transmission_time: string;
  webhook_id: string;
  webhook_event: PayPalWebhookEvent;
}

export interface PayPalWebhookVerificationResponse {
  verification_status: "SUCCESS" | "FAILURE";
}

export interface WebhookProcessingResult {
  success: boolean;
  donation_id?: string;
  action_taken: WebhookAction;
  error_message?: string;
  processed_at: string;
}

export type WebhookAction =
  | "donation_completed"
  | "donation_failed"
  | "donation_refunded"
  | "donation_cancelled"
  | "status_updated"
  | "no_action_needed"
  | "error_processing";

export interface PayPalDonationFormData {
  amount: number;
  donor_email?: string;
  donor_name?: string;
  donor_message?: string;
}

export interface PayPalDonationFormErrors {
  amount?: string;
  donor_email?: string;
  donor_name?: string;
  donor_message?: string;
  general?: string;
}

export interface PayPalButtonsProps {
  amount: number;
  donorData?: {
    email?: string;
    name?: string;
    message?: string;
  };
  onSuccess?: (donation: PayPalDonation) => void;
  onError?: (error: PayPalError) => void;
  onCancel?: () => void;
  onApprove?: () => boolean;
  disabled?: boolean;
  style?: PayPalButtonStyle;
}

export interface PayPalButtonStyle {
  layout?: "vertical" | "horizontal";
  color?: "gold" | "blue" | "silver" | "white" | "black";
  shape?: "rect" | "pill";
  label?: "paypal" | "checkout" | "buynow" | "pay" | "donate";
  tagline?: boolean;
  height?: number;
}

export interface PayPalError {
  code: PayPalErrorCode;
  message: string;
  details?: string;
  donation_id?: string;
  original_error?: unknown;
}

export type PayPalErrorCode =
  | "INVALID_AMOUNT"
  | "ORDER_CREATION_FAILED"
  | "PAYMENT_CAPTURE_FAILED"
  | "WEBHOOK_VERIFICATION_FAILED"
  | "DONATION_NOT_FOUND"
  | "PAYPAL_API_ERROR"
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR"
  | "CONFIGURATION_ERROR"
  | "RATE_LIMIT_EXCEEDED";

export interface PayPalConfig {
  client_id: string;
  client_secret: string;
  mode: "sandbox" | "production";
  webhook_id: string;
  currency: string;
  min_amount: number;
  max_amount: number;
}

export interface DirectusPayPalDonation {
  id: string;
  amount: number;
  currency: string;
  paypal_order_id: string;
  paypal_payment_id?: string;
  donor_email?: string;
  donor_name?: string;
  donor_message?: string;
  status: PayPalDonationStatus;
  created_at: string;
  completed_at?: string;
  failed_at?: string;
  webhook_verified: boolean;
  refunded_amount?: number;
  fees_amount?: number;
  net_amount?: number;
  user_created?: string;
  date_created: string;
  user_updated?: string;
  date_updated: string;
}

export type AmountInCents = number;
export type AmountInEUR = number;

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: PayPalWebhookEventType;
  resource_id: string;
  verification_status: "SUCCESS" | "FAILURE" | "NOT_VERIFIED";
  processing_result: WebhookProcessingResult;
  raw_payload: string;
  headers: Record<string, string>;
  received_at: string;
  processed_at?: string;
}

export interface DonationStats {
  total_amount: number;
  total_count: number;
  successful_count: number;
  failed_count: number;
  average_amount: number;
  currency: string;
  period_start: string;
  period_end: string;
}

export type PayPalTypeGuard<T> = (value: unknown) => value is T;
