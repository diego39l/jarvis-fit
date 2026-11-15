import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  base: '/',
  plugins: [VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg'],
    manifest: {
      name: 'Jarvis Fit',
      short_name: 'Jarvis Fit',
      description: 'Corrida, CrossFit e alimentação offline',
      theme_color: '#101827',
      background_color: '#101827',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]
    }
  })]
});
