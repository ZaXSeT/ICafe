import type { CapacitorConfig } from '@capacitor/cli';

/**
 * ICafe POS App
 * - App ID: com.icafe.pos
 * - Loads the POS (Point of Sale) interface for staff
 *
 * Usage:
 *   1. Copy this file to capacitor.config.ts
 *   2. Run: npx cap sync
 *   3. Run: npx cap open android (or ios)
 *   4. Build & upload to Play Store / App Store
 *   5. Restore the customer config when done
 *
 * Or use the build script: npm run build:pos
 */
const config: CapacitorConfig = {
  appId: 'com.icafe.pos',
  appName: 'ICafe POS',
  webDir: 'public',
  server: {
    // IMPORTANT: Ganti URL ini dengan domain live POS Anda
    // Jika POS ada di subdomain: https://pos.icafe-app.com
    // Jika POS ada di path: https://icafe-demo.vercel.app/pos
    url: 'https://icafe-demo.vercel.app/pos',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1a1a2e',
    },
  },
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
