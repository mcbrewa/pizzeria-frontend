import { useEffect } from 'react'

export const useResizeTransitionBlock = () => {
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    const handleResize = () => {
      document.documentElement.classList.add('no-transitions')
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        document.documentElement.classList.remove('no-transitions')
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeout)
    }
  }, [])
}
