export function initSecurityProtection() {
  if (typeof window === 'undefined') return;

  // 1. Disable Right Click Context Menu
  window.addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 2. Disable DevTools & Inspect Keyboard Shortcuts
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const key = e.key ? e.key.toUpperCase() : '';
    const keyCode = e.keyCode || e.which;

    // F12
    if (key === 'F12' || keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Opt+I (Inspect)
    // Ctrl+Shift+J / Cmd+Opt+J (Console)
    // Ctrl+Shift+C / Cmd+Opt+C (Element Inspector)
    // Ctrl+Shift+K / Cmd+Opt+K (Firefox Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      if (key === 'I' || key === 'J' || key === 'C' || key === 'K' || keyCode === 73 || keyCode === 74 || keyCode === 67 || keyCode === 75) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    // Ctrl+U / Cmd+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (key === 'U' || keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && (key === 'S' || keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Clear Console Warnings
  try {
    const noop = () => {};
    // Keep standard error/warn for diagnostics if needed, or suppress inspection
  } catch {}
}
