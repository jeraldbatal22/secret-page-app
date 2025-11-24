/**
 * VITEST SETUP FILE
 * 
 * This file runs before every test and sets up:
 * 1. Global test utilities (like jest-dom matchers)
 * 2. Mocks for Next.js components that don't work in test environment
 * 3. Cleanup functions to ensure tests don't interfere with each other
 * 
 * Why we need mocks:
 * - Next.js components like Link and Image use server-side features
 * - Tests run in a browser-like environment (jsdom), not a real Next.js server
 * - We replace them with simple HTML elements that work in tests
 */

// Import jest-dom matchers (adds custom matchers like toBeInTheDocument)
// This gives us better error messages and more readable assertions
import '@testing-library/jest-dom'

// Import Vitest utilities
import { afterEach, vi } from 'vitest'

// Import React Testing Library cleanup utility
import { cleanup } from '@testing-library/react'
import React from 'react'

/**
 * Cleanup after each test
 * 
 * This removes all rendered components from the DOM after each test.
 * This prevents tests from interfering with each other and keeps tests isolated.
 * 
 * Example: If Test A renders a component and Test B also renders a component,
 * without cleanup, both would be in the DOM and Test B might find elements from Test A.
 */
afterEach(() => {
  cleanup()
})

/**
 * Mock Next.js Router
 * 
 * Next.js router hooks (useRouter, usePathname, etc.) don't work in tests
 * because they require a Next.js server context. We replace them with simple mocks.
 * 
 * vi.fn() creates a mock function that we can spy on in tests if needed.
 */
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),      // Mock navigation function
    replace: vi.fn(),   // Mock replace function
    prefetch: vi.fn(),  // Mock prefetch function
  }),
  usePathname: () => '/',  // Mock current pathname
  useSearchParams: () => new URLSearchParams(),  // Mock search params
}))

/**
 * Mock Next.js Link Component
 * 
 * Next.js Link component uses special Next.js routing that doesn't work in tests.
 * We replace it with a regular HTML <a> tag that works in the test environment.
 * 
 * This allows components using <Link> to render in tests without errors.
 */
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => {
    // Return a regular anchor tag instead of Next.js Link
    return React.createElement('a', { href, ...props }, children)
  },
}))

/**
 * Mock Next.js Image Component
 * 
 * Next.js Image component uses image optimization that requires a Next.js server.
 * We replace it with a regular HTML <img> tag for testing.
 * 
 * This allows components using <Image> to render in tests without errors.
 */
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string
    alt: string
    [key: string]: unknown
  }) => {
    // Return a regular img tag instead of Next.js Image
    return React.createElement('img', { src, alt, ...props })
  },
}))

