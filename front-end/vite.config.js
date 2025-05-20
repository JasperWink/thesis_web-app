import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   // https: true,
  //   proxy: {
  //     '/api': {
  //       target: 'http://145.100.134.14:8094',
  //       // changeOrigin: true,
  //       // secure: false
  //     }
  //   }
  // }
})
