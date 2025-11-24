/**
 * VITEST CONFIGURATION FILE
 * 
 * This file configures Vitest (our test runner) for the project.
 * It tells Vitest how to run tests, what environment to use, and how to resolve imports.
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react' // Enables React support in tests
import path from 'path'

export default defineConfig({
  // Plugins: Add React support so we can test React components
  plugins: [react()],
  
  // Test configuration
  test: {
    // globals: true makes Vitest functions (describe, it, expect) available globally
    // Without this, you'd need to import them in every test file
    globals: true,
    
    // environment: 'jsdom' provides a browser-like environment (DOM, window, document)
    // This is needed to test React components that interact with the DOM
    environment: 'jsdom',
    env: {
      NEXT_PUBLIC_URL: 'https://publicurl.com',
      NEXT_PUBLIC_SUPABASE_URL: 'https://supabaseurl.com',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    },
    
    // setupFiles: Runs this file before all tests
    // We use it to set up mocks and global test configuration
    setupFiles: ['./vitest.setup.ts'],
    
    // css: true allows importing CSS files in tests (needed for styled components)
    css: true,
  },
  
  // Resolve configuration: Maps import paths
  resolve: {
    alias: {
      // This allows us to use '@/' imports in tests (same as in the main app)
      // Example: import SigninForm from '@/components/forms/signin-form'
      '@': path.resolve(__dirname, './'),
    },
  },
})

