import useInfiniteScroll from '@/lib/hooks/useInfiniteScroll'
import { Box } from '@chakra-ui/react'

interface InfiniteScrollProps {
    onLoadMore: VoidFunction
    hasMore: boolean
    isLoading: boolean
    enable?: boolean
    rootMargin?: string
}
const InfiniteScroll = ({ onLoadMore, hasMore, isLoading, enable, rootMargin }: InfiniteScrollProps) => {
    const ref = useInfiniteScroll({
        onLoadMore,
        hasMore,
        isLoading,
        enable,
        rootMargin,
    })

    return <Box ref={ref} h="1px" />
}

export default InfiniteScroll
