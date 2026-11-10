import EmptyState from '@/components/EmptyState'
import RentalPanel from '@/components/RentalPanel'
import WarehousesPanel from '@/components/Warehouse/WarehousePanel'
import { BASE_URL, BookingStatus } from '@/constant'
import { getBookings } from '@/lib/api/booking'
import { getMyWarehouse } from '@/lib/api/warehouse'
import { useAuth } from '@/lib/hooks/useAuth'
import useInfiniteScroll from '@/lib/hooks/useInfiniteScroll'
import { qk } from '@/lib/queryKeys'
import type { BookingDetailResponse, ScrollResponse } from '@/types'
import { fmtDate, peso } from '@/utils/helpers'
import {
    Badge,
    Box,
    Carousel,
    Center,
    Flex,
    IconButton,
    Image,
    SimpleGrid,
    Stack,
    Tabs,
    Text,
} from '@chakra-ui/react'
import {
    infiniteQueryOptions,
    queryOptions,
    useInfiniteQuery,
    useQuery,
} from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FaMapMarkerAlt } from 'react-icons/fa'
import {
    LuCalendar,
    LuChevronDown,
    LuClipboardList,
    LuSparkles,
    LuWarehouse,
} from 'react-icons/lu'

export const Route = createFileRoute('/_authenticated/my-rental')({
    component: RouteComponent,
})

const sellerWarehouseOptions = queryOptions({
    queryKey: qk.warehousesAll,
    queryFn: () => getMyWarehouse(),
    staleTime: 1000 * 60 * 5,
    retry: false,
})

const buyerWarehouseOptions = infiniteQueryOptions({
    queryKey: ['bookings', 'mine'],
    queryFn: ({ pageParam }): Promise<ScrollResponse<BookingDetailResponse>> =>
        getBookings({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
        last.hasNext && last.nextCursor ? last.nextCursor : undefined,
    staleTime: 1000 * 60 * 5,
    retry: false,
})

function RouteComponent() {
    const { currentUser } = useAuth()
    const isBuyer = currentUser?.userType === 'BUYER_ROLE'
    const isSeller = currentUser?.userType === 'SELLER_ROLE'
    const { data: warehouses = [] } = useQuery({
        ...sellerWarehouseOptions,
        enabled: isSeller,
    })

    if (isBuyer) return <MyBookingsPanel />

    return (
        <Tabs.Root
            defaultValue="warehouses"
            variant="line"
            lazyMount
            unmountOnExit
        >
            <Tabs.List>
                <Tabs.Trigger value="warehouses">
                    <LuWarehouse strokeWidth={3} />
                    <Text fontWeight="bold">Warehouses</Text>
                </Tabs.Trigger>
                <Tabs.Trigger value="rentals">
                    <LuClipboardList strokeWidth={3} />
                    <Text fontWeight="bold">Rentals</Text>
                </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="rentals">
                <RentalPanel />
            </Tabs.Content>
            <Tabs.Content value="warehouses">
                <WarehousesPanel warehouses={warehouses} />
            </Tabs.Content>
        </Tabs.Root>
    )
}

function MyBookingsPanel() {
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery(buyerWarehouseOptions)
    const bookings = data?.pages.flatMap((p) => p.items) ?? []
    const navigate = useNavigate()

    const loadMoreRef = useInfiniteScroll({
        onLoadMore: () => fetchNextPage(),
        hasMore: !!hasNextPage,
        isLoading: isFetchingNextPage,
    })

    if (isLoading) return <Text color="fg.muted">Loading your bookings…</Text>
    if (isError)
        return <Text>Couldn’t load your bookings. Refresh to try again.</Text>
    if (bookings.length === 0) {
        return (
            <EmptyState
                icon={<LuSparkles color="#C6D2FF" size="48" />}
                title={
                    'You haven’t booked any storage yet. Browse the feed to find a unit.'
                }
            />
        )
    }

    return (
        <Stack gap={4} pt={4}>
            {bookings.map((b: BookingDetailResponse) => {
                const warehouse = b.warehouse
                const storage = b.storage
                const address = warehouse.address
                const images = warehouse?.imageUrls ?? []

                const rentedWeight = b.rentedWeightKg
                const rentedVolume = b.rentedVolumeCubicMeter
                const storageId = storage.storageId

                const fullAddress = [
                    address.addressLine1,
                    address.addressLine2,
                    address.city,
                    address.stateProvince,
                    address.country,
                    address.postalCode,
                ]
                    .filter(Boolean)
                    .join(', ')

                return (
                    <Flex
                        key={b.orderId}
                        direction={{ base: 'column', md: 'row' }}
                        borderWidth="1px"
                        rounded="xl"
                        overflow="hidden"
                        bg="bg"
                        _hover={{
                            borderColor: '#c2c2c2',
                            shadow: 'md',
                            transform: 'translateY(-2px)',
                        }}
                        onClick={() => {
                            sessionStorage.setItem(
                                'pendingBooking',
                                JSON.stringify({
                                    ...b,
                                    storageId,
                                    weight: rentedWeight,
                                    volume: rentedVolume,
                                })
                            )
                            navigate({
                                to: `/${warehouse.warehouseId}/lease-agree`,
                            })
                        }}
                    >
                        <Box
                            position="relative"
                            w={{ base: '100%', md: '260px' }}
                            h={{ base: '200px', md: 'auto' }}
                            minH={{ md: '240px' }}
                            flexShrink={0}
                            bg="bg.muted"
                        >
                            {images.length ? (
                                <Carousel.Root
                                    autoplay
                                    loop
                                    orientation="vertical"
                                    slideCount={images.length}
                                    position="absolute"
                                    inset={0}
                                >
                                    <Carousel.ItemGroup w="100%" h="100%">
                                        {images.map(
                                            (url: string, index: number) => (
                                                <Carousel.Item
                                                    key={url}
                                                    index={index}
                                                    h="100%"
                                                >
                                                    <Image
                                                        src={`${BASE_URL}${url}`}
                                                        alt={warehouse.name}
                                                        w="100%"
                                                        h="100%"
                                                        objectFit="cover"
                                                    />
                                                </Carousel.Item>
                                            )
                                        )}
                                    </Carousel.ItemGroup>

                                    {images.length > 1 && (
                                        <Carousel.Control
                                            position="absolute"
                                            right={3}
                                            bottom={3}
                                            zIndex={2}
                                        >
                                            <Carousel.NextTrigger asChild>
                                                <IconButton
                                                    aria-label="Next photo"
                                                    size={{
                                                        base: 'xs',
                                                        md: 'sm',
                                                    }}
                                                    rounded="full"
                                                    bg="white"
                                                    color="gray.800"
                                                    boxShadow="sm"
                                                    _hover={{
                                                        bg: 'gray.50',
                                                        transform: 'scale(1.1)',
                                                    }}
                                                    transition="all 0.15s"
                                                >
                                                    <LuChevronDown />
                                                </IconButton>
                                            </Carousel.NextTrigger>
                                        </Carousel.Control>
                                    )}
                                </Carousel.Root>
                            ) : (
                                <Center h="100%" color="fg.muted" fontSize="sm">
                                    No photos yet
                                </Center>
                            )}
                        </Box>

                        <Flex
                            direction="column"
                            gap={4}
                            p={5}
                            flex="1"
                            minW={0}
                        >
                            <Flex
                                justify="space-between"
                                align="flex-start"
                                gap={3}
                            >
                                <Box minW={0}>
                                    <Text fontSize="lg" fontWeight="semibold">
                                        {warehouse.name}
                                    </Text>
                                    <Flex
                                        align="center"
                                        gap={1.5}
                                        color="fg.muted"
                                        fontSize="sm"
                                    >
                                        <FaMapMarkerAlt />
                                        <Text>{fullAddress}</Text>
                                    </Flex>
                                </Box>
                                <Badge
                                    colorPalette={BookingStatus[b.status].color}
                                    variant="subtle"
                                    size="sm"
                                >
                                    {b.status}
                                </Badge>
                            </Flex>

                            <SimpleGrid
                                columns={{ base: 2, md: 3 }}
                                gap={4}
                                borderTopWidth="1px"
                                pt={4}
                            >
                                <Stat
                                    label="Unit"
                                    value={`${storage.blockName} · ${storage.section}`}
                                />
                                <Stat
                                    label="Material"
                                    value={storage.materialType}
                                />
                                <Stat
                                    label="Price per m³"
                                    value={peso(storage.pricePerCubicMeter)}
                                />
                                <Stat
                                    label="Max volume"
                                    value={`${storage.maxVolumeCubicMeter} m³`}
                                />
                                <Stat
                                    label="Max weight"
                                    value={`${storage.maxWeight} kg`}
                                />
                                <Stat
                                    label="Warehouse capacity"
                                    value={`${warehouse.warehouseCapacityKg} kg`}
                                />
                            </SimpleGrid>

                            <Flex
                                justify="space-between"
                                align="center"
                                wrap="wrap"
                                gap={2}
                                borderTopWidth="1px"
                                pt={3}
                                mt="auto"
                            >
                                <Flex align="center" gap={2} fontSize="sm">
                                    <LuCalendar />
                                    <Text>
                                        {fmtDate(b.startDate)} to{' '}
                                        {fmtDate(b.endDate)}
                                    </Text>
                                </Flex>
                                <Text fontSize="xs" color="fg.muted">
                                    Order {b.orderId.slice(0, 10)}
                                </Text>
                            </Flex>
                        </Flex>
                    </Flex>
                )
            })}
            <Box ref={loadMoreRef} />
            {isFetchingNextPage && (
                <Text color="fg.muted" textAlign="center">
                    Loading more…
                </Text>
            )}
        </Stack>
    )
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <Box>
            <Text fontSize="sm" color="fg.muted">
                {label}
            </Text>
            <Text fontSize="md" fontWeight="medium">
                {value}
            </Text>
        </Box>
    )
}
