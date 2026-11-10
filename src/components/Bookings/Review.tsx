import { BASE_URL, BookingStatus } from '@/constant'
import { approveBooking, rejectBooking } from '@/lib/api/booking'
import type { OwnerBooking } from '@/types'
import { fmtDate } from '@/utils/helpers'
import {
    Avatar,
    Badge,
    Box,
    Button,
    Dialog,
    Flex,
    Portal,
    SimpleGrid,
    Text,
} from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

const Field = ({ label, value }: { label: string; value: string }) => (
    <Box>
        <Text fontSize="xs" color="fg.muted">
            {label}
        </Text>
        <Text fontSize="sm" fontWeight="medium">
            {value}
        </Text>
    </Box>
)

const ReviewDialog = ({
    booking,
    onClose,
}: {
    booking: OwnerBooking | null
    onClose: () => void
}) => {
    const queryClient = useQueryClient()
    const [reason, setReason] = useState('')

    const done = () => {
        queryClient.invalidateQueries({ queryKey: ['rentals'] })
        setReason('')
        onClose()
    }

    const approve = useMutation({
        mutationFn: () => approveBooking(booking!.orderId),
        onError: () => console.log(reason),
        onSuccess: done,
    })
    const reject = useMutation({
        mutationFn: () => rejectBooking(booking!.orderId),
        onSuccess: done,
    })

    if (!booking) return null

    const isReview = booking.status === 'PENDING_OWNER'
    const tenantName = booking.tenant?.name ?? booking.tenant?.name
    const tenantEmail = booking.tenant?.email ?? booking.tenant?.email
    const pic = booking.tenant?.profilePicUrl
    const busy = approve.isPending || reject.isPending
    const error = approve.error || reject.error

    return (
        <Dialog.Root
            open
            onOpenChange={(e) => !e.open && onClose()}
            placement="center"
            scrollBehavior="inside"
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content mx={4}>
                        <Dialog.Header>
                            <Dialog.Title>
                                {isReview
                                    ? 'Review booking'
                                    : 'Booking details'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Flex direction="column" gap={4}>
                                <Flex align="center" gap={3}>
                                    <Avatar.Root size="lg">
                                        <Avatar.Fallback name={tenantName} />
                                        {pic && (
                                            <Avatar.Image
                                                src={`${BASE_URL}${pic}`}
                                            />
                                        )}
                                    </Avatar.Root>
                                    <Box minW={0}>
                                        <Text fontWeight="semibold">
                                            {tenantName}
                                        </Text>
                                        <Text
                                            fontSize="sm"
                                            color="fg.muted"
                                            truncate
                                        >
                                            {tenantEmail}
                                        </Text>
                                        {booking.tenant?.contactNumber && (
                                            <Text
                                                fontSize="sm"
                                                color="fg.muted"
                                            >
                                                {booking.tenant.contactNumber}
                                            </Text>
                                        )}
                                    </Box>
                                    <Badge
                                        ml="auto"
                                        colorPalette={
                                            BookingStatus[
                                                booking.status as keyof typeof BookingStatus
                                            ]?.color
                                        }
                                    >
                                        {booking.status.replace(/_/g, ' ')}
                                    </Badge>
                                </Flex>

                                <SimpleGrid
                                    columns={2}
                                    gap={3}
                                    borderTopWidth="1px"
                                    pt={4}
                                >
                                    <Field
                                        label="Warehouse"
                                        value={booking.warehouseName}
                                    />
                                    <Field
                                        label="Unit"
                                        value={`${booking.unitNumber} · ${booking.blockName} / ${booking.section}`}
                                    />
                                    <Field
                                        label="Period"
                                        value={`${fmtDate(booking.startDate)} - ${fmtDate(booking.endDate)}`}
                                    />
                                    <Field
                                        label="Amount"
                                        value={`P ${booking.totalPrice.toLocaleString()}`}
                                    />
                                    <Field
                                        label="Volume"
                                        value={`${booking.rentedVolumeCubicMeter} m³`}
                                    />
                                    <Field
                                        label="Weight"
                                        value={`${booking.rentedWeightKg} kg`}
                                    />
                                </SimpleGrid>

                                {/* {isReview && (
                                    <Textarea
                                        placeholder="Reason for rejecting (optional)"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows={2}
                                    />
                                )} */}

                                {error && (
                                    <Text color="red.500" fontSize="sm">
                                        Something went wrong. Try again.
                                    </Text>
                                )}
                            </Flex>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={busy}
                            >
                                {isReview ? 'Cancel' : 'Close'}
                            </Button>
                            {isReview && (
                                <>
                                    <Button
                                        colorPalette="red"
                                        variant="subtle"
                                        loading={reject.isPending}
                                        disabled={busy}
                                        onClick={() => reject.mutate()}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        loading={approve.isPending}
                                        disabled={busy}
                                        onClick={() => approve.mutate()}
                                    >
                                        Approve
                                    </Button>
                                </>
                            )}
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default ReviewDialog
