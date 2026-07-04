// Android App Links verification for the Fairführer+ mobile app.
// Served at /.well-known/assetlinks.json (must be application/json, no redirect).
//
// package_name comes from fairfuhrer-mobile/app.json -> expo.android.package.
// sha256_cert_fingerprints must list the SHA-256 of every signing cert that
// should be trusted. For a Google Play app that is the *Play App Signing* cert
// (Play Console -> Test and release -> App integrity -> App signing key
// certificate), optionally plus the upload key.
//
// Fingerprints:
//  - Google Play App Signing certificate (Play Console -> App integrity)
//  - EAS upload keystore (eas credentials, build profile "production")

const assetlinks = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.fairfuehrer.app",
      sha256_cert_fingerprints: [
        "60:CA:AE:E6:21:4D:E1:51:1B:13:3B:E4:3B:D5:99:46:1B:B4:97:5F:BE:A6:79:D6:AE:F4:DC:51:31:FC:DE:A5",
        "71:0D:68:3E:84:BB:9A:94:67:1F:D9:6A:49:4B:C4:9A:F5:0B:9F:EA:87:34:1C:14:EE:7F:D5:F7:40:3C:42:42",
      ],
    },
  },
];

export function GET() {
  return Response.json(assetlinks);
}
