import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [vue(), viteSingleFile()],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm.js'
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  build: {
    target: 'es2017',
    outDir: 'dist',
    emptyOutDir: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      input: './ui.html',
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
})
