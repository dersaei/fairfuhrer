// iOS Universal Links for the Fairführer+ app.
// Served at /.well-known/apple-app-site-association (application/json, no
// redirect, no .json extension). Counterpart to assetlinks.json on Android.
//
// appIDs entries are "<AppleTeamID>.<bundleIdentifier>".
// bundleIdentifier comes from fairfuhrer-mobile/app.json -> expo.ios.bundleIdentifier.
// Paths mirror the Android intentFilters (app.json -> expo.android.intentFilters).
//
// Apple Team ID: Seenergien G.m.b.H. (from eas credentials, iOS production).

const APPLE_TEAM_ID = "9KDCST4WJ2";
const BUNDLE_ID = "com.fairfuehrer.app";

const aasa = {
  applinks: {
    details: [
      {
        appIDs: [`${APPLE_TEAM_ID}.${BUNDLE_ID}`],
        components: [
          { "/": "/karte*" },
          { "/": "/impressum*" },
          { "/": "/agb*" },
          { "/": "/datenschutz*" },
        ],
      },
    ],
  },
};

export function GET() {
  return Response.json(aasa);
}
