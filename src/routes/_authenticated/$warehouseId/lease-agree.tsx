import LeaseView from "@/components/Lease"
import { createBooking } from "@/lib/api/booking"
import { acceptTerms, getLease } from "@/lib/api/lease"
import { qk } from "@/lib/queryKeys"
import type { AcceptTermsResponse, BookingRequest } from "@/types"
import { Badge, Box, Button, Link as ChakraLink, Flex, Heading, HStack, Image, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link as RouterLink, useNavigate } from '@tanstack/react-router'
import { AxiosError } from "axios"
import { useMemo, useRef, useState } from "react"
import { LuChevronLeft, LuInfo } from "react-icons/lu"

export const Route = createFileRoute('/_authenticated/$warehouseId/lease-agree')({
  component: RouteComponent,
})

function RouteComponent() {
  const { warehouseId } = Route.useParams();
  const navigate = useNavigate();
  const [bookingData] = useState(() => {
  const storedData = sessionStorage.getItem("pendingBooking");
    return storedData ? JSON.parse(storedData) : null;
  });
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const bookingIdRef = useRef<string | undefined>(undefined)

  const request = useMemo<BookingRequest>(
    () => bookingData && {
      storageId: bookingData.storageId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      rentedVolumeCubicMeter: bookingData.volume,
      rentedWeightKg: bookingData.weight,
    },
    [bookingData],
  )

  const bookingMutation = useMutation<AcceptTermsResponse, AxiosError<{ message?: string }>, string>({
  mutationFn: async () => {
    bookingIdRef.current ??= (await createBooking(bookingData)).orderId
    const id = bookingIdRef.current
    const lease = await getLease(id!)
    return acceptTerms(id!, { agreed: true, termsHash: lease.termsHash })
  },
  onSuccess: () => {
    sessionStorage.removeItem('pendingBooking')
    queryClient.invalidateQueries({ queryKey: qk.storages(warehouseId) })
    navigate({ to: '/' })
  },
  onError: (e) => {
    if (e.response?.status === 409 && !bookingIdRef.current) {
      queryClient.invalidateQueries({ queryKey: ['lease-preview'] })
    }
  },
})

  const handleDecline = () => {
    navigate({ to: '/$warehouseId', params: { warehouseId } })
  }

  const warehouse = bookingData.warehouse

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
        <Heading as="h1" size="2xl">Lease Agreement Review</Heading>
        <Text color="fg.muted">
          Please review the lease terms and confirm that you agree to the conditions.
        </Text>
      </Box>
 
      <HStack bg="bg.muted" borderWidth="1px" borderRadius="lg" p={3} gap={3}>
        <LuInfo />
        <Text fontSize="sm">
          Your request goes to the warehouse owner once you accept. The lease becomes binding when the owner approves it.
        </Text>
      </HStack>
 
      <Flex
        bg="bg.panel" borderWidth="1px" borderRadius="xl" p={4}
        gap={5} align="center" flexWrap="wrap" justify="space-between"
      >
        <HStack gap={4}>
          <Image
            src={warehouse.imageUrls?.[0]}
            alt={warehouse.name}
            w="96px" h="72px" objectFit="cover" borderRadius="md" bg="bg.muted"
          />
          <Box>
            <Text fontWeight="semibold">{warehouse.name}</Text>
            <Text fontSize="sm" color="fg.muted">
              {warehouse.address.addressLine1} {warehouse.address.addressLine2}
            </Text>
          </Box>
        </HStack>
        <Box>
          <Text fontSize="xs" color="fg.muted">Agreement ID</Text>
          <Text fontWeight="semibold" fontSize="sm">Assigned after you accept</Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="fg.muted">Status</Text>
          <Badge variant="subtle" mt={1}>Pending your acceptance</Badge>
        </Box>
      </Flex>

      <Flex justify="flex-end" gap={3}>
        <Button
          variant="outline"
          onClick={handleDecline}
          disabled={bookingMutation.isPending}
        >
          Decline
        </Button>
        <Button onClick={() => setOpen(true)}>
          Continue
        </Button>
      </Flex>

      <LeaseView
        open={open}
        request={request}
        loading={bookingMutation.isPending}
        onClose={() => setOpen(false)}
        onSubmit={(termsHash) => bookingMutation.mutate(termsHash)}
      >
      </LeaseView>

      <Text fontSize="xs" color="fg.muted" textAlign="center">
        You won’t be charged until the owner approves.
      </Text>

    </Flex>
    
  )
}
