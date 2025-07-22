import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f94142913bec4608b3b03446f22be4e3',
  appName: 'board-game-buddy-up',
  webDir: 'dist',
  server: {
    url: 'https://f9414291-3bec-4608-b3b0-3446f22be4e3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false
    }
  }
};

export default config;