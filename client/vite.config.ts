// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // BU HİSSƏNİ ƏLAVƏ EDİRİK:
      // Paketlər öz içindəki react-ı yox, məhz sənin node_modules-undakı react-ı işlətsin
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },
  server: {
    port: 8080,
    open: true,
    proxy: {
      '/api': {
        target: 'https://herocodebackend-ym9g.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Optimallaşdırma zamanı React-in dublikat olmaması üçün bunu da əlavə edə bilərsən
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-select', '@monaco-editor/react'],
  }
})