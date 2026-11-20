import { WarehouseGallery } from '@/components/WarehouseGallery'
import { MATERIAL_TYPES, type MaterialType } from '@/constant'
import { createBooking } from '@/lib/api/booking'
import { getStorageByWarehouseId } from '@/lib/api/storage'
import { getWarehouseById } from '@/lib/api/warehouse'
import { usePreferences } from '@/lib/hooks/usePreference'
import { qk } from '@/lib/queryKeys'
import type { StorageDetailedResponse } from '@/types'
import { toLabel } from '@/utils/helpers'
import {
    Badge,
    Box,
    Button,
    Link as ChakraLink,
    CloseButton,
    DateInput,
    DatePicker,
    Dialog,
    Flex,
    Grid,
    Heading,
    HStack,
    IconButton,
    NativeSelect,
    NumberInput,
    Portal,
    SimpleGrid,
    Stack,
    Text,
    useBreakpointValue,
    useDateInput,
} from '@chakra-ui/react'
import {
    getLocalTimeZone,
    today,
    type DateValue,
} from '@internationalized/date'
import {
    useMutation,
    useQuery,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query'
import {
    createFileRoute,
    Link as RouterLink,
    useNavigate,
} from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { IconType } from 'react-icons'
import {
    LuCalendar,
    LuCheck,
    LuChevronLeft,
    LuEye,
    LuMinus,
    LuMountainSnow,
    LuPlus,
    LuWeight,
} from 'react-icons/lu'

export const Route = createFileRoute('/_authenticated/warehouse/$warehouseId/')(
    {
        component: RouteComponent,
        loader: ({ context: { queryClient }, params }) =>
            queryClient.query({
                queryKey: qk.warehouses(params.warehouseId),
                queryFn: () => getWarehouseById(params.warehouseId),
            }),
    }
)

const MIN_MONTHS = 1
const MAX_MONTHS = 12

function RouteComponent() {
    const {
        formatPrice,
        formatWeight,
        formatVolume,
        toBaseVolume,
        toBaseWeight,
        formatPricePerVolume,
    } = usePreferences()
    const { warehouseId } = Route.useParams()
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const [filter, setFilter] = useState<MaterialType | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const [startDate, setStartDate] = useState<DateInput.DateValue[]>([])

    const [months, setMonths] = useState(MIN_MONTHS)
    const [volume, setVolume] = useState('')
    const [weight, setWeight] = useState('')

    const [sheetOpen, setSheetOpen] = useState(false)
    const isMobile = useBreakpointValue(
        { base: true, lg: false },
        { ssr: false }
    )

    const {
        data: storages = [],
        isError: storagesError,
        isLoading: storagesLoading,
    } = useQuery({
        queryKey: qk.storages(warehouseId),
        queryFn: () => getStorageByWarehouseId(warehouseId),
        staleTime: 1000 * 60 * 5,
        retry: false,
    })

    const { data: warehouse } = useSuspenseQuery({
        queryKey: qk.warehouses(warehouseId),
        queryFn: () => getWarehouseById(warehouseId),
    })

    const bookingMutation = useMutation({
        mutationFn: createBooking,
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: qk.storages(warehouseId),
            }),
    })

    const dateInput = useDateInput({
        value: startDate,
        onValueChange: (e) => setStartDate(e.value),
    })

    const units = useMemo(
        () =>
            storages.filter(
                (u: StorageDetailedResponse) =>
                    filter === null || u.materialType === filter
            ),
        [storages, filter]
    )

    const selected =
        units.find(
            (u: StorageDetailedResponse) => u.storageId === selectedId
        ) ?? null

    const minDate: DateValue = today(getLocalTimeZone())
    const start = startDate[0]
    const formattedDate = start
        ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(
              start.toDate(getLocalTimeZone())
          )
        : 'No date selected'

    const volumeNum = Number(volume)
    const weightNum = Number(weight)
    const unitPrice = selected?.pricePerCubicMeter ?? 0
    const availWeight = (u: StorageDetailedResponse) =>
        u.availableWeight ?? u.maxWeight
    const availVolume = (u: StorageDetailedResponse) =>
        u.availableVolume ?? u.maxVolumeCubicMeter

    const invalid =
        !start ||
        !(volumeNum > 0) ||
        !(weightNum > 0) ||
        (!!selected && weightNum > availWeight(selected)) ||
        (!!selected && volumeNum > availVolume(selected)) ||
        bookingMutation.isPending

    const resetForm = () => {
        setStartDate([])
        setMonths(MIN_MONTHS)
        setVolume('')
        setWeight('')
    }

    const handleFilterChange = (next: MaterialType | null) => {
        setFilter(next)
        setSelectedId(null)
        resetForm()
        bookingMutation.reset()
    }

    const handleSelect = (id: string) => {
        if (id !== selectedId) {
            setWeight('')
            setVolume('')
        }
        setSelectedId(id)
        bookingMutation.reset()
        if (isMobile) setSheetOpen(true)
    }

    const handleSubmit = () => {
        if (!selected || !start || invalid) return

        const bookingData = {
            storageId: selected.storageId,
            storage: selected,
            warehouse: warehouse,
            startDate: start.toString(),
            endDate: start.add({ months }).toString(),
            months: months,
            weight: weight,
            volume: volume,
            unitPrice: unitPrice,
            rentedVolumeCubicMeter: toBaseVolume(volumeNum),
            rentedWeightKg: toBaseWeight(weightNum),
        }

        sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData))

        navigate({
            to: '/warehouse/$warehouseId/lease-agree',
            params: { warehouseId: warehouseId },
        })
    }

    const handleBookAnother = () => {
        bookingMutation.reset()
        setSelectedId(null)
        resetForm()
        setSheetOpen(false)
    }

    const bookingPanel =
        bookingMutation.isSuccess && selected ? (
            <Stack align="center" textAlign="center" gap={3} py={2}>
                <Flex
                    w={12}
                    h={12}
                    rounded="full"
                    bg="green.solid"
                    align="center"
                    justify="center"
                >
                    <LuCheck size={24} />
                </Flex>
                <Heading size="lg">Booking requested</Heading>
                <Text color="fg.muted">
                    {selected.blockName} is held for you from {formattedDate}.
                    The warehouse owner will confirm within 24 hours.
                </Text>
                <Button variant="outline" w="100%" onClick={handleBookAnother}>
                    Book another unit
                </Button>
            </Stack>
        ) : !selected ? (
            <Stack gap={3}>
                <Heading size="lg">Book a unit</Heading>
                <Text color="fg.muted">
                    Select a storage unit to see pricing and choose your dates.
                </Text>
                <Button size="lg" disabled>
                    Book now
                </Button>
                <Button
                    variant="outline"
                    onClick={() =>
                        navigate({
                            to: '/messages',
                            search: { to: warehouse?.email },
                        })
                    }
                >
                    Contact warehouse
                </Button>
            </Stack>
        ) : (
            <Stack gap={4}>
                <Box>
                    <HStack justify="space-between" align="flex-start">
                        <Text
                            fontWeight="bold"
                            fontSize="lg"
                            color="fg.default"
                        >
                            {selected.blockName}
                        </Text>
                        <Badge colorPalette="blue" variant="subtle" size="sm">
                            {toLabel(selected.materialType)}
                        </Badge>
                    </HStack>

                    <SimpleGrid columns={2} gap={2} mt={2}>
                        <Box>
                            <Text fontSize="xs" color="fg.muted">
                                Available weight
                            </Text>
                            <Text fontSize="sm" fontWeight="semibold">
                                {formatWeight(availWeight(selected))}{' '}
                                <Text
                                    as="span"
                                    color="fg.muted"
                                    fontWeight="normal"
                                >
                                    / {formatWeight(selected.maxWeight)}
                                </Text>
                            </Text>
                        </Box>
                        <Box>
                            <Text fontSize="xs" color="fg.muted">
                                Available volume
                            </Text>
                            <Text fontSize="sm" fontWeight="semibold">
                                {formatVolume(availVolume(selected))}{' '}
                                <Text
                                    as="span"
                                    color="fg.muted"
                                    fontWeight="normal"
                                >
                                    /{' '}
                                    {formatVolume(selected.maxVolumeCubicMeter)}
                                </Text>
                            </Text>
                        </Box>
                    </SimpleGrid>

                    <HStack
                        align="baseline"
                        gap={1}
                        pt={2}
                        borderTopWidth="1px"
                        borderColor="border.subtle"
                    >
                        <Text
                            fontSize="xs"
                            color="fg.muted"
                            textTransform="uppercase"
                            letterSpacing="wider"
                        >
                            Price:
                        </Text>
                        <Text
                            fontSize="2xl"
                            fontWeight="semibold"
                            lineHeight="none"
                        >
                            {formatPrice(unitPrice)}
                        </Text>
                    </HStack>
                </Box>

                <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    align={{ base: 'stretch', sm: 'flex-end' }}
                    gap={3}
                >
                    <DatePicker.Root
                        borderRadius="lg"
                        min={minDate}
                        value={startDate}
                        onValueChange={(e) => setStartDate(e.value)}
                        w={{ base: '100%', sm: 'auto' }}
                        flex={{ sm: '1' }}
                    >
                        <DateInput.RootProvider value={dateInput}>
                            <DateInput.Label>Start Date</DateInput.Label>
                            <DatePicker.Control>
                                <DateInput.Control flex="1">
                                    <DateInput.Segments />
                                </DateInput.Control>
                                <DatePicker.IndicatorGroup>
                                    <DatePicker.Trigger>
                                        <LuCalendar />
                                    </DatePicker.Trigger>
                                </DatePicker.IndicatorGroup>
                            </DatePicker.Control>
                            <DateInput.HiddenInput />
                        </DateInput.RootProvider>

                        <Portal>
                            <DatePicker.Positioner>
                                <DatePicker.Content>
                                    <DatePicker.View view="day">
                                        <DatePicker.Header />
                                        <DatePicker.DayTable />
                                    </DatePicker.View>
                                    <DatePicker.View view="month">
                                        <DatePicker.Header />
                                        <DatePicker.MonthTable />
                                    </DatePicker.View>
                                    <DatePicker.View view="year">
                                        <DatePicker.Header />
                                        <DatePicker.YearTable />
                                    </DatePicker.View>
                                </DatePicker.Content>
                            </DatePicker.Positioner>
                        </Portal>
                    </DatePicker.Root>

                    <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={1.5}>
                            Duration
                        </Text>
                        <HStack
                            borderWidth="1px"
                            borderRadius="md"
                            w={{ base: '100%', sm: 'fit' }}
                            justify="space-between"
                            gap={0}
                        >
                            <IconButton
                                variant="ghost"
                                disabled={months <= MIN_MONTHS}
                                onClick={() =>
                                    setMonths((m) =>
                                        Math.max(MIN_MONTHS, m - 1)
                                    )
                                }
                            >
                                <LuMinus />
                            </IconButton>
                            <Text minW="80px" textAlign="center">
                                {months} {months > 1 ? 'months' : 'month'}
                            </Text>

                            <IconButton
                                variant="ghost"
                                disabled={months >= MAX_MONTHS}
                                onClick={() =>
                                    setMonths((m) =>
                                        Math.min(MAX_MONTHS, m + 1)
                                    )
                                }
                            >
                                <LuPlus />
                            </IconButton>
                        </HStack>
                    </Box>
                </Flex>

                <NumberInput.Root
                    min={0}
                    value={volume}
                    onValueChange={(e) => setVolume(e.value)}
                    invalid={volumeNum > selected.maxVolumeCubicMeter}
                >
                    <NumberInput.Label fontSize="sm" fontWeight="medium">
                        Space wanted (Volume)
                    </NumberInput.Label>
                    <NumberInput.Input />
                    {volumeNum > selected.maxVolumeCubicMeter && (
                        <Text fontSize="xs" color="fg.error" mt={1}>
                            Max space for this unit is{' '}
                            {selected.maxVolumeCubicMeter} m³.
                        </Text>
                    )}
                </NumberInput.Root>

                <NumberInput.Root
                    min={0}
                    invalid={weightNum > selected.maxWeight}
                    value={weight}
                    onValueChange={(e) => setWeight(e.value)}
                >
                    <NumberInput.Label fontSize="sm" fontWeight="medium">
                        Goods weight (Capacity)
                    </NumberInput.Label>
                    <NumberInput.Input />
                    {weightNum > selected.maxWeight && (
                        <Text fontSize="xs" color="fg.error" mt={1}>
                            Max weight for this unit is {selected.maxWeight} kg.
                        </Text>
                    )}
                </NumberInput.Root>

                <Button
                    size="lg"
                    disabled={invalid}
                    loading={bookingMutation.isPending}
                    onClick={handleSubmit}
                >
                    Review now
                </Button>
                <Button
                    variant="outline"
                    onClick={() =>
                        navigate({
                            to: '/messages',
                            search: { to: warehouse?.email },
                        })
                    }
                >
                    Contact warehouse
                </Button>
                <Text fontSize="xs" color="fg.muted" textAlign="center">
                    You won’t be charged until the warehouse confirms.
                </Text>
            </Stack>
        )

    return (
        <Flex flexDir="column" gap={4} w="100%">
            <ChakraLink
                asChild
                variant="plain"
                display="flex"
                alignItems="center"
                gap={2}
                color="fg.muted"
                _hover={{
                    textDecoration: 'none',
                    color: 'fg',
                }}
            >
                <RouterLink to="/">
                    <LuChevronLeft />
                    Back to feed
                </RouterLink>
            </ChakraLink>

            <Grid
                templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 400px' }}
                gap={6}
                alignItems="start"
            >
                <Stack gap={6} minW={0}>
                    <Box
                        bg="bg.panel"
                        borderRadius="2xl"
                        shadow="sm"
                        p={{ base: 4, md: 6 }}
                        top={4}
                    >
                        <WarehouseGallery
                            urls={warehouse.imageUrls}
                            name={warehouse.name}
                        />

                        <Box px={{ base: 4, md: 6 }} pt={{ base: 4, md: 6 }}>
                            <Heading
                                as="h1"
                                size={{ base: '2xl', md: '3xl' }}
                                letterSpacing="-0.01em"
                                mb={1}
                            >
                                {warehouse.name}
                            </Heading>
                            <Text color="fg.muted" mb={3}>
                                {warehouse.address.addressLine1}{' '}
                                {warehouse.address.addressLine2}
                            </Text>
                            <Text fontWeight="semibold" fontSize="md">
                                {warehouse.address.stateProvince}{' '}
                                {warehouse.address.country}
                            </Text>
                        </Box>

                        <SimpleGrid
                            columns={3}
                            gap={{ base: 2, md: 4 }}
                            p={{ base: 4, md: 6 }}
                        >
                            <Fact
                                icon={LuWeight}
                                label="Total capacity"
                                value={formatWeight(
                                    warehouse.warehouseCapacityKg
                                )}
                            />
                            <Fact
                                icon={LuMountainSnow}
                                label="Storage units"
                                value={String(storages.length)}
                            />
                            <Fact
                                icon={LuEye}
                                label="Views"
                                value={warehouse.viewCount ?? 0}
                            />
                        </SimpleGrid>
                    </Box>

                    <Box bg="bg.panel" borderRadius="2xl" shadow="sm" p={6}>
                        <NativeSelect.Root
                            size="sm"
                            mb="10px"
                            w={{ base: '100%', md: '240px' }}
                        >
                            <NativeSelect.Field
                                value={filter ?? ''}
                                onChange={(e) =>
                                    handleFilterChange(
                                        (e.target.value ||
                                            null) as MaterialType | null
                                    )
                                }
                            >
                                <option value="">All material types</option>
                                {MATERIAL_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {toLabel(t)}
                                    </option>
                                ))}
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                        </NativeSelect.Root>

                        {storagesLoading && (
                            <Text color="fg.muted">Loading storage units…</Text>
                        )}
                        {storagesError && (
                            <Text color="fg.error">
                                Couldn’t load storage units. Refresh the page to
                                try again.
                            </Text>
                        )}
                        {!storagesLoading &&
                            !storagesError &&
                            units.length === 0 && (
                                <Text color="fg.muted">
                                    No storage units match this filter.
                                </Text>
                            )}
                        <Stack gap={2.5} role="radiogroup">
                            {units.map((u: StorageDetailedResponse) => {
                                const isSelected = u.storageId === selectedId
                                const full =
                                    availVolume(u) <= 0 || availWeight(u) <= 0
                                return (
                                    <Flex
                                        key={u.storageId}
                                        as="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        aria-disabled={full}
                                        onClick={() =>
                                            handleSelect(u.storageId)
                                        }
                                        w="100%"
                                        textAlign="left"
                                        align="center"
                                        gap={{ base: 3, md: 4 }}
                                        p={{ base: 3, md: 4 }}
                                        borderWidth="1px"
                                        borderRadius="lg"
                                        borderColor={
                                            isSelected ? 'fg' : 'border'
                                        }
                                        bg={
                                            isSelected
                                                ? 'bg.muted'
                                                : 'transparent'
                                        }
                                        opacity={full ? 0.5 : 1}
                                        cursor={
                                            full ? 'not-allowed' : 'pointer'
                                        }
                                        flexWrap={{
                                            base: 'wrap',
                                            md: 'nowrap',
                                        }}
                                    >
                                        <Box flex="1" minW={0}>
                                            <Text
                                                fontWeight="semibold"
                                                fontSize="md"
                                            >
                                                {u.blockName} · {u.section}
                                            </Text>
                                            <Text
                                                color="fg.muted"
                                                fontSize="sm"
                                            >
                                                {toLabel(u.materialType)}{' '}
                                                storage
                                            </Text>
                                            <Text
                                                color="fg.muted"
                                                fontSize="xs"
                                                mt={1}
                                            >
                                                Available:{' '}
                                                {formatWeight(availWeight(u))}/
                                                {formatWeight(u.maxWeight)} kg ·{' '}
                                                {formatVolume(availVolume(u))}/
                                                {formatVolume(
                                                    u.maxVolumeCubicMeter
                                                )}{' '}
                                            </Text>
                                        </Box>

                                        <Box
                                            textAlign={{
                                                base: 'left',
                                                md: 'right',
                                            }}
                                            pl={{ base: 8, md: 0 }}
                                        >
                                            {full ? (
                                                <Badge
                                                    colorPalette="red"
                                                    variant="subtle"
                                                >
                                                    Fully booked
                                                </Badge>
                                            ) : (
                                                <Text
                                                    fontWeight="bold"
                                                    fontSize="md"
                                                >
                                                    {formatPricePerVolume(
                                                        u.pricePerCubicMeter
                                                    )}
                                                </Text>
                                            )}
                                        </Box>
                                    </Flex>
                                )
                            })}
                        </Stack>
                    </Box>
                </Stack>

                {!isMobile && (
                    <Box
                        bg="bg.panel"
                        borderRadius="2xl"
                        shadow="sm"
                        p={6}
                        position="sticky"
                        top={4}
                    >
                        {bookingPanel}
                    </Box>
                )}
            </Grid>
            {isMobile && (
                <Dialog.Root
                    open={sheetOpen}
                    onOpenChange={(e) => setSheetOpen(e.open)}
                    placement="bottom"
                    scrollBehavior="inside"
                    motionPreset="slide-in-bottom"
                >
                    <Portal>
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                            <Dialog.Content borderTopRadius="2xl" maxH="90dvh">
                                <Dialog.CloseTrigger
                                    asChild
                                    position="absolute"
                                    top={1}
                                    right={3}
                                >
                                    <CloseButton size="sm" />
                                </Dialog.CloseTrigger>
                                <Dialog.Body pt={10} pb={6} px={4}>
                                    {bookingPanel}
                                </Dialog.Body>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            )}
        </Flex>
    )
}

function Fact({
    label,
    value,
    icon: Icon,
}: {
    label: string
    value: string
    icon: IconType
}) {
    return (
        <Box>
            <Text fontSize={{ base: 'xs', md: 'sm' }} color="fg.muted">
                {label}
            </Text>
            <Flex alignItems="center" gap="2">
                <Icon size={18} />
                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold">
                    {value}
                </Text>
            </Flex>
        </Box>
    )
}
