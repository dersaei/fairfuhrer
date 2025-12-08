// components/GlobalLoadingIndicator.tsx - Next.js 16.0.7 + React 19.2.1
// ✅ Global loading indicator using useLinkStatus for slow networks
'use client'

import { useLinkStatus } from 'next/link'
import styles from './GlobalLoadingIndicator.module.css'

/**
 * Global loading indicator for navigation transitions.
 * Shows a subtle progress bar at the top of the page for ALL navigation.
 *
 * Uses Next.js 16's useLinkStatus hook to detect pending navigation.
 * Includes a 100ms delay to avoid showing for fast navigations.
 */
export default function GlobalLoadingIndicator() {
  const { pending } = useLinkStatus()

  return (
    <div
      className={`${styles.loadingBar} ${pending ? styles.active : ''}`}
      role="progressbar"
      aria-busy={pending}
      aria-live="polite"
      aria-label={pending ? 'Navigating' : ''}
    />
  )
}
