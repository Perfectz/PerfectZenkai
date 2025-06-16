// src/shared/utils/killRootServiceWorker.ts
// Utility to remove any old Service Worker that was registered with the
// root scope ("/"). Older builds of Perfect Zenkai may have registered a
// worker at scope `/`, which causes the installed PWA to launch at the
// repo root instead of the correct "/PerfectZenkai/" path.
//
// This helper is safe to call repeatedly. If no such registration exists
// nothing happens. We only run it in production so it never affects local
// development where the scope is "/" intentionally.

export async function killRootServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()

    await Promise.all(
      registrations
        .filter((reg) => reg.scope === `${location.origin}/`)
        .map((reg) => reg.unregister())
    )
  } catch (err) {
    // Non-fatal: just log – we don't want to break app startup.
    console.warn('Failed to unregister legacy root-scoped Service Worker', err)
  }
} 