// types/paypal-sdk.d.ts - Deklaracje typów dla PayPal SDK

declare module "@paypal/checkout-server-sdk" {
  export namespace core {
    interface PayPalEnvironment {
      baseUrl: string;
      authorizationString(): string;
    }

    class PayPalHttpClient {
      constructor(environment: PayPalEnvironment);
      execute(request: PayPalRequest): Promise<PayPalResponse>;
    }

    class SandboxEnvironment implements PayPalEnvironment {
      constructor(clientId: string, clientSecret: string);
      baseUrl: string;
      authorizationString(): string;
    }

    class LiveEnvironment implements PayPalEnvironment {
      constructor(clientId: string, clientSecret: string);
      baseUrl: string;
      authorizationString(): string;
    }
  }

  export namespace orders {
    interface PayPalRequest {
      path: string;
      verb: string;
      body?: unknown;
      headers?: Record<string, string>;
    }

    interface PayPalOrderRequestBody {
      intent: string;
      purchase_units: Array<{
        amount: {
          currency_code: string;
          value: string;
        };
        description?: string;
      }>;
      application_context?: Record<string, unknown>;
    }

    class OrdersCreateRequest implements PayPalRequest {
      constructor();
      path: string;
      verb: string;
      body?: unknown;
      headers?: Record<string, string>;
      prefer(preference: string): this;
      requestBody(body: PayPalOrderRequestBody): this;
    }

    class OrdersCaptureRequest implements PayPalRequest {
      constructor(orderId: string);
      path: string;
      verb: string;
      body?: unknown;
      headers?: Record<string, string>;
      requestBody(body: Record<string, unknown>): this;
    }

    class OrdersGetRequest implements PayPalRequest {
      constructor(orderId: string);
      path: string;
      verb: string;
      body?: unknown;
      headers?: Record<string, string>;
    }
  }

  interface PayPalResponse {
    result: Record<string, unknown>;
    statusCode: number;
  }
}
