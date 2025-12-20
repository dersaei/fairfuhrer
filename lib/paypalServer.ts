import "server-only";

import { paypalConfig } from "./paypal";
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  CheckoutPaymentIntent,
} from "@paypal/paypal-server-sdk";

let _paypalClient: Client | null = null;
let _ordersController: OrdersController | null = null;

function getPayPalClient(): Client {
  if (!_paypalClient) {
    _paypalClient = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: paypalConfig.client_id,
        oAuthClientSecret: paypalConfig.client_secret,
      },
      environment:
        paypalConfig.mode === "sandbox"
          ? Environment.Sandbox
          : Environment.Production,
      logging: {
        logLevel: LogLevel.Info,
        logRequest: { logBody: true },
        logResponse: { logHeaders: true },
      },
    });
  }
  return _paypalClient;
}

function getOrdersController(): OrdersController {
  if (!_ordersController) {
    const client = getPayPalClient();
    _ordersController = new OrdersController(client);
  }
  return _ordersController;
}

export async function createPayPalOrder(
  amountInCents: number,
  currency = "EUR"
) {
  const orders = getOrdersController();
  const amountValue = (amountInCents / 100).toFixed(2);

  const response = await orders.createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: currency,
            value: amountValue,
          },
        },
      ],
    },
    prefer: "return=representation",
  });

  return response;
}

export async function capturePayPalOrder(orderId: string) {
  const orders = getOrdersController();

  const response = await orders.captureOrder({
    id: orderId,
    prefer: "return=representation",
  });

  return response;
}

export async function getPayPalOrder(orderId: string) {
  const orders = getOrdersController();

  const response = await orders.getOrder({
    id: orderId,
  });

  return response;
}
