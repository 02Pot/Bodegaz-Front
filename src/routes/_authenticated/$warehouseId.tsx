import { WarehouseGallery } from '@/components/WarehouseGallery'
import { MATERIAL_TYPES, type MaterialType } from '@/constant'
import { createBooking } from '@/lib/api/booking'
import { getStorageByWarehouseId } from '@/lib/api/storage'
import { getWarehouseById } from '@/lib/api/warehouse'
import { qk } from '@/lib/queryKeys'
import type { StorageResponse } from '@/types'
import { Badge, Box, Button, Link as ChakraLink, DateInput, DatePicker, Flex, Grid, Heading, HStack, IconButton, NativeSelect, NumberInput, Portal, Stack, Text, useDateInput } from '@chakra-ui/react'
import { getLocalTimeZone, today, type DateValue } from '@internationalized/date'
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { IconType } from 'react-icons'
import { LuCalendar, LuCheck, LuChevronLeft, LuEye, LuMinus, LuMountainSnow, LuPlus, LuWeight } from 'react-icons/lu'

export const Route = createFileRoute('/_authenticated/$warehouseId')({
  component: RouteComponent,
  loader: ({context: {queryClient},params}) => queryClient.query({
    queryKey:qk.warehouses(params.warehouseId),
    queryFn: () => getWarehouseById(params.warehouseId)
  })
})


const MIN_MONTHS = 1
const MAX_MONTHS = 12
const toLabel = (t: string) =>t.toLowerCase().split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
const peso = (n: number) => `₱${n.toLocaleString('en-PH', { maximumFractionDigits: 2 })}`

function RouteComponent() {
  const { warehouseId } = Route.useParams()
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState<MaterialType | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [startDate, setStartDate] = useState<DateInput.DateValue[]>([])
  const [months, setMonths] = useState(MIN_MONTHS)
  const [volume, setVolume] = useState('')
  const [weight, setWeight] = useState('')

  const {data: storages = [],isError: storagesError,isLoading:storagesLoading} = useQuery({
    queryKey: qk.storages(warehouseId),
    queryFn: () => getStorageByWarehouseId(warehouseId),
    staleTime: 1000 * 60 * 5,
    retry:false
  })

  const {data: warehouse} = useSuspenseQuery({
    queryKey: qk.warehouses(warehouseId),
    queryFn: () => getWarehouseById(warehouseId)
  })
  
  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.storages(warehouseId) }),
  })
 
  const dateInput = useDateInput({
    value: startDate,
    onValueChange: (e) => setStartDate(e.value),
  })

  const units = useMemo(
    () => storages.filter((u: StorageResponse) => filter === null || u.materialType === filter),
    [storages, filter],
  )

  const selected = units.find((u: StorageResponse) => u.storageId === selectedId) ?? null

  const minDate: DateValue = today(getLocalTimeZone())
  const start = startDate[0]
  const formattedDate = start
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(start.toDate(getLocalTimeZone()))
    : 'No date selected'

  const volumeNum = Number(volume)
  const weightNum = Number(weight)
  const unitPrice = selected?.pricePerCubicMeter ?? 0

  const invalid =
    !start || !(volumeNum > 0) || !(weightNum > 0) ||
    (!!selected && weightNum > selected.maxWeight) || bookingMutation.isPending

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
  }

  const handleBookAnother = () => {
    bookingMutation.reset()
    setSelectedId(null)
    resetForm()
  }

  const handleSubmit = () => {
    if (!selected || !start || invalid) return
    bookingMutation.mutate({
      storageId: selected.storageId,
      startDate: start.toString(),
      endDate: start.add({ months }).toString(),
      rentedVolumeCubicMeter: volumeNum,
      rentedWeightKg: weightNum,
    })
  }

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
              textDecoration: "none",
              color: "fg",
          }}
      >
          <RouterLink to="/">
              <LuChevronLeft />
              Back to feed
          </RouterLink>
      </ChakraLink>

      <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 400px' }} gap={6} alignItems="start">
        <Stack gap={6} minW={0}>
          <Box bg="bg.panel" borderRadius="2xl" shadow="sm" overflow="hidden">
            <WarehouseGallery urls={warehouse.imageUrls} name={warehouse.name} />

            <Box px={6} pt={6}>
              <Heading as="h1" size="3xl" letterSpacing="-0.01em" mb={1}>
                {warehouse.name}
              </Heading>
              <Text color="fg.muted" mb={3}>{warehouse.address.addressLine1} {warehouse.address.addressLine2}</Text>
              <Text fontWeight="semibold" fontSize="md">
                {warehouse.address.stateProvince} {warehouse.address.country}
              </Text>
            </Box>

            <Flex justifyContent={'space-between'} p={6}>
              <Fact icon={LuWeight} label="Total capacity" value={warehouse.warehouseCapacityKg} />
              <Fact icon={LuMountainSnow} label="Storage units" value={String(storages.length)} />
              <Fact icon={LuEye} label="Views" value={warehouse.viewCount} />
            </Flex>
          </Box>

          <Box bg="bg.panel" borderRadius="2xl" shadow="sm" p={6}>
            <NativeSelect.Root size="sm" w={{ base: '100%', md: '240px' }}>
              <NativeSelect.Field
                value={filter ?? ''}
                onChange={(e) => handleFilterChange((e.target.value || null) as MaterialType | null)}
              >
                <option value="">All material types</option>
                {MATERIAL_TYPES.map((t) => (
                  <option key={t} value={t}>{toLabel(t)}</option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>

            {storagesLoading && <Text color="fg.muted">Loading storage units…</Text>}
            {storagesError && (
              <Text color="fg.error">Couldn’t load storage units. Refresh the page to try again.</Text>
            )}
            {!storagesLoading && !storagesError && units.length === 0 && (
              <Text color="fg.muted">No storage units match this filter.</Text>
            )}
            <Stack gap={2.5} role="radiogroup">
              {units.map((u:StorageResponse) => {
                const isSelected = u.storageId === selectedId
                // const disabled = u.isAvailable
                return (
                  <Flex
                    key={u.storageId}
                    as="button"
                    role="radio"
                    // disabled={disabled}
                    onClick={() => handleSelect(u.storageId)}
                    textAlign="left"
                    align="center"
                    gap={4}
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    borderColor={isSelected ? 'fg' : 'border'}
                    bg={isSelected ? 'bg.muted' : 'transparent'}
                    // opacity={disabled ? 0.5 : 1}
                    // cursor={disabled ? 'not-allowed' : 'pointer'}
                    // _hover={disabled ? undefined : { bg: 'bg.muted' }}
                    flexWrap={{ base: 'wrap', md: 'nowrap' }}
                  >
                    <Box
                      w={5} h={5} rounded="full" borderWidth="1px"
                      borderColor={isSelected ? 'fg' : 'border.emphasized'}
                      display="grid" flexShrink={0}
                    >
                      {isSelected && <Box w={2.5} h={2.5} rounded="full"/>}
                    </Box>

                    <Box flex="1" minW={0}>
                      <Text fontWeight="semibold" fontSize="md">{u.blockName} · {u.section}</Text>
                      <Text color="fg.muted" fontSize="sm">
                        {toLabel(u.materialType)} storage · up to {u.maxWeight} kg
                      </Text>
                    </Box>

                    <Box textAlign={{ base: 'left', md: 'right' }}>
                        <Text fontWeight="bold" fontSize="md">
                        {u.pricePerCubicMeter != null ? peso(u.pricePerCubicMeter) : '0'}
                        <Text as="span" fontWeight="normal" color="fg.muted" fontSize="sm">/ month</Text>
                      </Text>
                    </Box>
                  </Flex>
                )
              })}
            </Stack>

            
          </Box>
        </Stack>

        <Box
          bg="bg.panel"
          borderRadius="2xl"
          shadow="sm"
          p={6}
          position={{ base: 'static', lg: 'sticky' }}
          top={4}
        >
          {bookingMutation.isSuccess && selected ? (
            <Stack align="center" textAlign="center" gap={3} py={2}>
              <Flex w={12} h={12} rounded="full" bg="green.solid" color="white" align="center" justify="center">
                <LuCheck size={24} />
              </Flex>
              <Heading size="lg">Booking requested</Heading>
              <Text color="fg.muted">
                {selected.blockName} is held for you from {formattedDate}. The warehouse owner will confirm within 24 hours.
              </Text>
              <Button variant="outline" w="100%" onClick={handleBookAnother}>
                Book another unit
              </Button>
            </Stack>
          ) : !selected ? (
            <Stack gap={3}>
              <Heading size="lg">Book a unit</Heading>
              <Text color="fg.muted">Select a storage unit to see pricing and choose your dates.</Text>
              <Button size="lg" disabled>Book now</Button>
              <Button variant="outline">Contact warehouse</Button>
            </Stack>
          ) : (
            <Stack gap={4}>
            <Box>
              <HStack justify="space-between" align="flex-start">
                <Text fontWeight="bold" fontSize="lg" color="fg.default">
                  {selected.blockName}
                </Text>
                <Badge colorPalette="blue" variant="subtle" size="sm">
                  {toLabel(selected.materialType)}
                </Badge>
              </HStack>

              <Flex justifyContent={'space-between'}>
                <Text fontSize="xs" color="fg.muted" fontWeight="medium">
                  Max weight: {selected.maxWeight} kg
                </Text>
                <Text fontSize="xs" color="fg.muted" fontWeight="medium">
                  Max volume: {selected.maxVolumeCubicMeter} m³
                </Text>
              </Flex>

              <HStack align="baseline" gap={1} pt={2} borderTopWidth="1px" borderColor="border.subtle">
                <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
                  Price:
                </Text>
                <Text fontSize="2xl" fontWeight="semibold" lineHeight="none">
                  {peso(unitPrice)}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  / m³
                </Text>
              </HStack>
            </Box>

              <Flex alignItems='center' gap='2'>
                <DatePicker.Root
                  borderRadius='lg'
                  min={minDate}
                  value={startDate}
                  onValueChange={(e) => setStartDate(e.value)}
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
                  <Text fontSize="sm" fontWeight="medium" mb={1.5}>Duration</Text>
                  <HStack borderWidth="1px" borderRadius='md' w="fit" gap={0}>
                    <IconButton variant="ghost"
                      disabled={months <= MIN_MONTHS}
                      onClick={() => setMonths((m) => Math.max(MIN_MONTHS, m - 1))}
                    >
                      <LuMinus />
                    </IconButton>
                    <Text minW="80px" textAlign="center">
                      {months} {months > 1 ? 'months' : 'month'}
                    </Text>
                    <IconButton variant="ghost"
                      disabled={months >= MAX_MONTHS}
                      onClick={() => setMonths((m) => Math.min(MAX_MONTHS, m + 1))}                    >
                      <LuPlus />
                    </IconButton>
                  </HStack>
                </Box>
              </Flex>

              <NumberInput.Root min={0} value={volume} onValueChange={(e) => setVolume(e.value)} invalid={volumeNum > selected.maxVolumeCubicMeter}>
                <NumberInput.Label fontSize='sm' fontWeight='medium'>Space wanted (Volume)</NumberInput.Label>
                <NumberInput.Input />
                {volumeNum > selected.maxVolumeCubicMeter && (
                  <Text fontSize="xs" color="fg.error" mt={1}>
                    Max space for this unit is {selected.maxVolumeCubicMeter} m³.
                  </Text>
                )}
              </NumberInput.Root>

              <NumberInput.Root min={0} invalid={weightNum > selected.maxWeight} value={weight} onValueChange={(e) => setWeight(e.value)}>
                <NumberInput.Label fontSize='sm' fontWeight='medium'>Goods weight (Capacity)</NumberInput.Label>
                <NumberInput.Input/>
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
                Book now
              </Button>
              <Button variant="outline">Contact warehouse</Button>
              <Text fontSize="xs" color="fg.muted" textAlign="center">
                You won’t be charged until the warehouse confirms.
              </Text>
            </Stack>
          )}
        </Box>
      </Grid>
    </Flex>
  )
}

function Fact({ label, value,icon: Icon }: { label: string; value: string; icon: IconType }) {
  return (
    <Box>
      <Text fontSize="sm" color="fg.muted">{label}</Text>
      <Flex alignItems={'center'} gap='2' >
        <Icon size={20}/>
        <Text fontSize="lg" fontWeight="semibold">{value}</Text>
      </Flex>
    </Box>
  )
}