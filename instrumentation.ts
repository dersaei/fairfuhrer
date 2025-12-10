// instrumentation.ts
// Server-side instrumentation file
// This is required by Next.js even if we only use instrumentation-client.ts

/**
 * Server-side instrumentation
 * Currently minimal as we focus on client-side analytics
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("🔧 Server instrumentation initialized");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    console.log("🔧 Edge runtime instrumentation initialized");
  }
}
