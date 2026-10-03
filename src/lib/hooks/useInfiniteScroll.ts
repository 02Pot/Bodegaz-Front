import { useEffect, useRef } from 'react'

interface InfiniteScrollProps {
    onLoadMore: VoidFunction
    hasMore: boolean
    isLoading: boolean
    rootMargin?: string
    enable?: boolean
}

const useInfiniteScroll = ({ onLoadMore, hasMore, isLoading, rootMargin = '200px', enable = true }: InfiniteScrollProps) => {
    const ref = useRef<HTMLDivElement | null>(null)
    const lockRef = useRef(false)

    useEffect(() => {
        if (!enable) return
        if (!hasMore) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return
                if (!hasMore || isLoading) return
                if (lockRef.current) return

                lockRef.current = true
                onLoadMore()
            },
            { rootMargin },
        )

        const el = ref.current
        if (el) observer.observe(el)

        return () => {
            if (el) observer.unobserve(el)
        }
    }, [enable, onLoadMore, hasMore, isLoading, rootMargin])

    useEffect(() => {
        if (!isLoading) {
            lockRef.current = false
        }
    }, [isLoading])

    return ref
}

export default useInfiniteScroll
