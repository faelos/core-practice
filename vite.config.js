import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Tell Vite where your index.html is.
  root: 'src',

  // required for the local file build to work.
  base: './',

  // legacy plugin required so test can be viewed via file://
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true, 
  },
  
  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    }
  },
})