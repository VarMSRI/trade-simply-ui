
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { componentTagger } from "lovable-tagger"
import { sockJsPolyfill } from './src/utils/vite-plugins/sockjs-polyfill'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    sockJsPolyfill(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    allowedHosts: true
  },
  define: {
    // Add global polyfill for sockjs-client
    global: 'window'
  }
}))
