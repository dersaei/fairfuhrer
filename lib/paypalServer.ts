// lib/paypalServer.ts - TYLKO dla server-side użycia (API routes)
import { paypalConfig } from "./paypal";

// Typy dla PayPal SDK
interface PayPalSDK {
  core: {
    SandboxEnvironment: new (clientId: string, clientSecret: string) => unknown;
    LiveEnvironment: new (clientId: string, clientSecret: string) => unknown;
    PayPalHttpClient: new (environment: unknown) => {
      execute: (request: unknown) => Promise<unknown>;
    };
  };
  orders: {
    OrdersCreateRequest: new () => {
      prefer: (preference: string) => void;
      requestBody: (body: unknown) => void;
    };
    OrdersCaptureRequest: new (orderId: string) => {
      requestBody: (body: unknown) => void;
    };
    OrdersGetRequest: new (orderId: string) => unknown;
  };
}

// Dynamiczny import PayPal SDK - TYLKO server-side
let paypalSDK: PayPalSDK | null = null;

async function getPayPalSDK(): Promise<PayPalSDK> {
  if (!paypalSDK) {
    // Dynamiczny import żeby nie ładować w browser
    paypalSDK = (await import("@paypal/checkout-server-sdk")) as PayPalSDK;
  }
  return paypalSDK;
}

// PayPal Environment setup
async function createEnvironment() {
  const sdk = await getPayPalSDK();
  const { core } = sdk;

  const clientId = paypalConfig.client_id;
  const clientSecret = paypalConfig.client_secret;

  if (paypalConfig.mode === "sandbox") {
    return new core.SandboxEnvironment(clientId, clientSecret);
  } else {
    return new core.LiveEnvironment(clientId, clientSecret);
  }
}

// PayPal Client
let _paypalClient: { execute: (request: unknown) => Promise<unknown> } | null =
  null;

export async function getPayPalClient(): Promise<{
  execute: (request: unknown) => Promise<unknown>;
}> {
  if (!_paypalClient) {
    const sdk = await getPayPalSDK();
    const environment = await createEnvironment();
    _paypalClient = new sdk.core.PayPalHttpClient(environment);
  }
  return _paypalClient;
}

// Export request classes
export async function getOrdersCreateRequest() {
  const sdk = await getPayPalSDK();
  return sdk.orders.OrdersCreateRequest;
}

export async function getOrdersCaptureRequest() {
  const sdk = await getPayPalSDK();
  return sdk.orders.OrdersCaptureRequest;
}

export async function getOrdersGetRequest() {
  const sdk = await getPayPalSDK();
  return sdk.orders.OrdersGetRequest;
}
