import LeaseView from '@/components/Lease'
import { BASE_URL, BookingStatus } from '@/constant'
import { createBooking } from '@/lib/api/booking'
import { acceptTerms, getLease } from '@/lib/api/lease'
import { qk } from '@/lib/queryKeys'
import type { AcceptTermsResponse, BookingRequest } from '@/types'
import { fmtDate, peso } from '@/utils/helpers'
import {
    Badge,
    Box,
    Button,
    Link as ChakraLink,
    Flex,
    Heading,
    HStack,
    Image,
    SimpleGrid,
    Text,
} from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    createFileRoute,
    Navigate,
    Link as RouterLink,
    useNavigate,
} from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { useMemo, useRef, useState } from 'react'
import { LuChevronLeft, LuInfo } from 'react-icons/lu'

export const Route = createFileRoute(
    '/_authenticated/$warehouseId/lease-agree'
)({
    component: RouteComponent,
})

const Info = ({ label, value }: { label: string; value: string }) => (
    <Box>
        <Text fontSize="xs" color="fg.muted">
            {label}
        </Text>
        <Text fontSize="sm" fontWeight="medium">
            {value}
        </Text>
    </Box>
)

function RouteComponent() {
    const { warehouseId } = Route.useParams()
    const navigate = useNavigate()
    const [bookingData] = useState(() => {
        const storedData = sessionStorage.getItem('pendingBooking')
        return storedData ? JSON.parse(storedData) : null
    })
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()
    const bookingIdRef = useRef<string | undefined>(bookingData?.orderId)

    const request = useMemo<BookingRequest>(
        () =>
            bookingData && {
                storageId:
                    bookingData.storageId ?? bookingData.storage?.storageId,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                rentedVolumeCubicMeter: bookingData.rentedVolumeCubicMeter,
                rentedWeightKg: bookingData.rentedWeightKg,
            },
        [bookingData]
    )

    const bookingMutation = useMutation<
        AcceptTermsResponse,
        AxiosError<{ message?: string }>,
        string
    >({
        mutationFn: async () => {
            bookingIdRef.current ??= (await createBooking(bookingData)).orderId
            const id = bookingIdRef.current
            const lease = await getLease(id!)
            return acceptTerms(id!, {
                agreed: true,
                termsHash: lease.termsHash,
            })
        },
        onSuccess: () => {
            sessionStorage.removeItem('pendingBooking')
            queryClient.invalidateQueries({
                queryKey: qk.storages(warehouseId),
            })
            navigate({ to: '/' })
        },
        onError: (e) => {
            if (e.response?.status === 409 && !bookingIdRef.current) {
                queryClient.invalidateQueries({ queryKey: ['lease-preview'] })
            }
        },
    })

    if (!bookingData)
        return <Navigate to="/$warehouseId" params={{ warehouseId }} />

    const { warehouse, storage } = bookingData
    const canAccept =
        !bookingData.status || bookingData.status === 'PENDING_TERMS'
    const rate = bookingData.unitPrice ?? storage.pricePerCubicMeter
    const img = warehouse.imageUrls?.[0]
    const status = bookingData.status as keyof typeof BookingStatus | undefined

    return (
        <Flex flexDir="column" gap={5} w="100%" maxW="900" mx="auto">
            <ChakraLink
                asChild
                variant="plain"
                display="flex"
                alignItems="center"
                gap={2}
                color="fg.muted"
                _hover={{ textDecoration: 'none', color: 'fg' }}
            >
                <RouterLink to="/$warehouseId" params={{ warehouseId }}>
                    <LuChevronLeft />
                    Back to warehouse
                </RouterLink>
            </ChakraLink>

            <Box>
                <Heading as="h1" size="2xl">
                    Lease Agreement Review
                </Heading>
                <Text color="fg.muted">
                    {canAccept
                        ? 'Please review the lease terms and confirm that you agree to the conditions.'
                        : 'Details of your booking.'}
                </Text>
            </Box>

            {canAccept && (
                <HStack
                    bg="bg.muted"
                    borderWidth="1px"
                    borderRadius="lg"
                    p={3}
                    gap={3}
                >
                    <LuInfo />
                    <Text fontSize="sm">
                        Your request goes to the warehouse owner once you
                        accept. The lease becomes binding when the owner
                        approves it.
                    </Text>
                </HStack>
            )}

            <Flex
                bg="bg.panel"
                borderWidth="1px"
                borderRadius="xl"
                p={4}
                gap={5}
                align="center"
                flexWrap="wrap"
                justify="space-between"
            >
                <HStack gap={4}>
                    <Image
                        src={img ? `${BASE_URL}${img}` : undefined}
                        alt={warehouse.name}
                        w="96px"
                        h="72px"
                        objectFit="cover"
                        borderRadius="md"
                        bg="bg.muted"
                    />
                    <Box>
                        <Text fontWeight="semibold">{warehouse.name}</Text>
                        <Text fontSize="sm" color="fg.muted">
                            {warehouse.address.addressLine1}{' '}
                            {warehouse.address.addressLine2}
                        </Text>
                    </Box>
                </HStack>
                <Box>
                    <Text fontSize="xs" color="fg.muted">
                        Agreement ID
                    </Text>
                    <Text fontWeight="semibold" fontSize="sm">
                        {bookingData.orderId
                            ? bookingData.orderId.slice(0, 10)
                            : 'Assigned after you accept'}
                    </Text>
                </Box>
                <Box>
                    <Text fontSize="xs" color="fg.muted">
                        Status
                    </Text>
                    <Badge
                        variant="subtle"
                        mt={1}
                        colorPalette={
                            status ? BookingStatus[status]?.color : undefined
                        }
                    >
                        {status
                            ? status.replace(/_/g, ' ')
                            : 'Pending your acceptance'}
                    </Badge>
                </Box>
            </Flex>

            <SimpleGrid
                columns={{ base: 2, md: 3 }}
                gap={4}
                bg="bg.panel"
                borderWidth="1px"
                borderRadius="xl"
                p={4}
            >
                <Info
                    label="Unit"
                    value={[storage.blockName, storage.section]
                        .filter(Boolean)
                        .join(' · ')}
                />
                <Info
                    label="Material"
                    value={storage.materialType.replace(/_/g, ' ')}
                />
                <Info label="Price per m³" value={peso(rate)} />
                <Info
                    label="Period"
                    value={`${fmtDate(bookingData.startDate)} - ${fmtDate(bookingData.endDate)}`}
                />
                <Info
                    label="Volume"
                    value={`${bookingData.rentedVolumeCubicMeter} m³`}
                />
                <Info
                    label="Weight"
                    value={`${bookingData.rentedWeightKg} kg`}
                />
                <Text></Text>
                <Text></Text>
            </SimpleGrid>

            {canAccept && (
                <>
                    <Flex justify="flex-end" gap={3}>
                        <Button
                            variant="outline"
                            onClick={() =>
                                navigate({
                                    to: '/$warehouseId',
                                    params: { warehouseId },
                                })
                            }
                            disabled={bookingMutation.isPending}
                        >
                            Decline
                        </Button>
                        <Button onClick={() => setOpen(true)}>Continue</Button>
                    </Flex>

                    <LeaseView
                        open={open}
                        request={request}
                        loading={bookingMutation.isPending}
                        onClose={() => setOpen(false)}
                        onSubmit={(termsHash) =>
                            bookingMutation.mutate(termsHash)
                        }
                    />

                    <Text fontSize="xs" color="fg.muted" textAlign="center">
                        You won’t be charged until the owner approves.
                    </Text>
                </>
            )}
        </Flex>
    )
}
