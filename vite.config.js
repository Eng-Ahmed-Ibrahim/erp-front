import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// const path = require('path')
// https://vitejs.dev/config/
export default defineConfig({
  // root: path.resolve(__dirname, 'src'),
  // resolve: {
  //   alias: {
  //     '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
  //   }
  // },
  plugins: [react()],
  // base: '/warehouse/home',
    server: {
     host: '192.168.0.88',
     port: '50000'
    }

})

