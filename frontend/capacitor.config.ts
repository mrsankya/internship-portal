import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.digicampus.internship',
  appName: 'DiGi Internship',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
