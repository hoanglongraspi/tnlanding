import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    // Enable HMR for better development experience
    hmr: {
      port: 8080,
    },
    // Add caching headers for development
    headers: {
      'Cache-Control': 'public, max-age=3600', // 1 hour cache for dev assets
    },
  },
  plugins: [
    react({
      // Use SWC for faster compilation
      plugins: [
        // Enable React Fast Refresh
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Build optimizations
  build: {
    // Increase chunk size limit to 1MB
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging in production
    sourcemap: false,
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
            'lucide-react'
          ],
          // Data fetching and state management
          'data-vendor': ['@tanstack/react-query', '@supabase/supabase-js'],
          // Form and validation
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Utilities
          'utils-vendor': ['clsx', 'tailwind-merge', 'date-fns', 'crypto-js'],
        },
        // Optimize chunk file names with cache-busting hashes
        chunkFileNames: (chunkInfo) => {
          return `assets/chunks/[name]-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'assets/images/[name]-[hash].[ext]';
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return 'assets/fonts/[name]-[hash].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: true,
        drop_debugger: true,
        // Optimize conditionals
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        // Preserve function names for better debugging
        keep_fnames: false,
      },
      format: {
        // Remove comments
        comments: false,
      },
    },
    // Target modern browsers for better optimization
    target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize asset inclusion
    assetsInlineLimit: 4096, // 4KB limit for inlining assets
  },
  // Development optimizations
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  // CSS optimizations
  css: {
    devSourcemap: true,
  },
  // Dependency optimization
  optimizeDeps: {
    // Pre-bundle these dependencies for faster development
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
    // Exclude these from pre-bundling if they cause issues
    exclude: [
      // Add problematic packages here
    ],
  },
  // Preview server configuration with caching headers
  preview: {
    host: "::",
    port: 8080,
    headers: {
      // Enable aggressive caching for static assets
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year for assets with hash
    },
  },
  // Define environment variables
  define: {
    // Optimize React development mode
    __DEV__: process.env.NODE_ENV === 'development',
  },
});
