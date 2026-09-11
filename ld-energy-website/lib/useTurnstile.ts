'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string
          callback?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: (errorCode: string) => boolean | void
          'timeout-callback'?: () => void
          'unsupported-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact' | 'flexible'
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
      getResponse: (widgetId: string) => string | undefined
    }
  }
}

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script'
const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const TURNSTILE_LOAD_TIMEOUT_MS = 10_000

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

let turnstileScriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (turnstileScriptPromise) return turnstileScriptPromise

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    let script = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null
    let checkReady: number | null = null

    const cleanup = () => {
      if (checkReady !== null) window.clearInterval(checkReady)
      window.clearTimeout(loadTimeout)
      script?.removeEventListener('error', handleError)
    }

    const handleError = () => {
      cleanup()
      script?.remove()
      reject(new Error('Cloudflare Turnstile script failed to load'))
    }

    const loadTimeout = window.setTimeout(() => {
      cleanup()
      script?.remove()
      reject(new Error('Cloudflare Turnstile script timed out'))
    }, TURNSTILE_LOAD_TIMEOUT_MS)

    checkReady = window.setInterval(() => {
      if (!window.turnstile) return
      cleanup()
      resolve()
    }, 100)

    if (!script) {
      script = document.createElement('script')
      script.id = TURNSTILE_SCRIPT_ID
      script.src = TURNSTILE_SCRIPT_URL
      script.async = true
      script.defer = true
      script.addEventListener('error', handleError, { once: true })
      document.head.appendChild(script)
    } else {
      script.addEventListener('error', handleError, { once: true })
    }
  }).catch((error) => {
    turnstileScriptPromise = null
    throw error
  })

  return turnstileScriptPromise
}

interface UseTurnstileOptions {
  enabled?: boolean
  onVerify?: (token: string) => void
  onExpire?: () => void
  onError?: (errorCode?: string) => void
}

export function useTurnstile({
  enabled = true,
  onVerify,
  onExpire,
  onError,
}: UseTurnstileOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  const callbacksRef = useRef({ onVerify, onExpire, onError })
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [renderAttempt, setRenderAttempt] = useState(0)

  // Callers commonly pass inline handlers. Keep the latest versions available
  // without making the widget effect depend on their changing identities.
  callbacksRef.current = { onVerify, onExpire, onError }

  const clearToken = useCallback((notify = true) => {
    const hadToken = tokenRef.current !== null
    tokenRef.current = null
    setToken(null)
    if (hadToken && notify) callbacksRef.current.onExpire?.()
  }, [])

  const removeWidget = useCallback(() => {
    if (widgetIdRef.current !== null && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch {
        // The widget may already have removed itself after a failed challenge.
      }
    }
    widgetIdRef.current = null
  }, [])

  const reset = useCallback(() => {
    clearToken()
    setError(null)

    if (widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
      return
    }

    // If the script or initial render failed, create a fresh widget attempt.
    removeWidget()
    setIsLoading(true)
    setRenderAttempt((attempt) => attempt + 1)
  }, [clearToken, removeWidget])

  useEffect(() => {
    if (!enabled) {
      clearToken()
      setError(null)
      setIsLoading(false)
      return
    }

    let cancelled = false

    const renderWidget = async () => {
      if (!containerRef.current || widgetIdRef.current !== null) return

      setIsLoading(true)
      setError(null)

      if (!TURNSTILE_SITE_KEY) {
        const message = 'Missing NEXT_PUBLIC_TURNSTILE_SITE_KEY environment variable'
        console.error(message)
        setError('configuration-error')
        setIsLoading(false)
        callbacksRef.current.onError?.('configuration-error')
        return
      }

      try {
        await loadTurnstileScript()

        if (cancelled || !window.turnstile || !containerRef.current) return

        containerRef.current.innerHTML = ''
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (newToken: string) => {
            if (cancelled) return
            tokenRef.current = newToken
            setToken(newToken)
            setError(null)
            callbacksRef.current.onVerify?.(newToken)
          },
          'expired-callback': () => {
            if (cancelled) return
            clearToken()
          },
          'error-callback': (errorCode: string) => {
            if (cancelled) return true
            clearToken()
            setError(errorCode || 'unknown-error')
            callbacksRef.current.onError?.(errorCode)
            return true
          },
          'timeout-callback': () => {
            if (cancelled) return
            clearToken()
            setError('interaction-timeout')
            callbacksRef.current.onError?.('interaction-timeout')
          },
          'unsupported-callback': () => {
            if (cancelled) return
            clearToken()
            setError('unsupported-browser')
            callbacksRef.current.onError?.('unsupported-browser')
          },
          theme: 'light',
          size: containerRef.current.clientWidth < 300 ? 'compact' : 'flexible',
        })
        setIsLoading(false)
      } catch (renderError) {
        if (cancelled) return
        console.error('Failed to render Turnstile widget:', renderError)
        setError('load-error')
        setIsLoading(false)
        callbacksRef.current.onError?.('load-error')
      }
    }

    void renderWidget()

    return () => {
      cancelled = true
      removeWidget()
    }
  }, [clearToken, enabled, removeWidget, renderAttempt])

  return { containerRef, token, isLoading, error, reset }
}
