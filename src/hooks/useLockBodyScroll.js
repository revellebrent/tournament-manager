import { useEffect } from 'react';

export default function useLockBodyScroll(active) {
  useEffect(() => {
    if (!active) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = overflow }
  }, [active])
}