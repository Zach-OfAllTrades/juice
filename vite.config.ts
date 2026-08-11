import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const rootDir = import.meta.dirname ?? resolve('.')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx'],
      outDir: 'dist',
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      // Multiple entry points map to the exports map in package.json
      entry: {
        index: resolve(rootDir, 'src/index.ts'),
        atoms: resolve(rootDir, 'src/components/atoms/index.ts'),
        molecules: resolve(rootDir, 'src/components/molecules/index.ts'),
        organisms: resolve(rootDir, 'src/components/organisms/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled into the library
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // Preserve module structure for tree-shaking
        preserveModules: false,
        // Named exports for all entry points
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        // CSS assets go into dist/styles/
        assetFileNames: 'styles/[name][extname]',
      },
    },
    // Don't minify for library mode — consumers' bundlers handle this
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src'),
    },
  },
})
