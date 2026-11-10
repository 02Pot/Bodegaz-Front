import { previewLease } from '@/lib/api/lease'
import type { BookingRequest } from '@/types'
import {
    Button,
    Checkbox,
    CloseButton,
    Dialog,
    Portal,
    Stack,
    Text,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

type Props = {
    open: boolean
    request: BookingRequest
    loading?: boolean
    onClose: () => void
    onSubmit: (termsHash: string) => void
    children?: ReactNode
}

const LeaseView = ({
    open,
    request,
    loading = false,
    onClose,
    onSubmit,
    children,
}: Props) => {
    const [agreedHash, setAgreedHash] = useState<string | null>(null)

    const {
        data: lease,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['lease-preview', request],
        queryFn: () => previewLease(request!),
        enabled: open && !!request,
        retry: false,
    })

    const agreed = !!lease?.termsHash && agreedHash === lease.termsHash

    const renderBold = (text: string) =>
        text
            .split(/\*\*(.+?)\*\*/g)
            .map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))

    const handleClose = () => {
        if (loading) return
        setAgreedHash(lease?.termsHash ?? null)
        onClose()
    }

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(d) => !d.open && handleClose()}
            closeOnInteractOutside={!loading}
            size="lg"
            scrollBehavior="inside"
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>
                                Warehouse Lease Agreement
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Stack gap={4}>
                                {children}

                                {isLoading && (
                                    <Text color="fg.muted">
                                        Loading lease terms…
                                    </Text>
                                )}
                                {isError && (
                                    <Text color="fg.error">
                                        Couldn’t load the lease terms. Please
                                        try again.
                                    </Text>
                                )}

                                {lease && (
                                    <Text fontSize="sm" whiteSpace="pre-wrap">
                                        {renderBold(lease.termsConditions)}
                                    </Text>
                                )}

                                <Checkbox.Root
                                    checked={agreed}
                                    disabled={!lease}
                                    onCheckedChange={(e) =>
                                        setAgreedHash(
                                            e.checked
                                                ? (lease?.termsHash ?? null)
                                                : null
                                        )
                                    }
                                >
                                    <Checkbox.HiddenInput />
                                    <Checkbox.Control />
                                    <Checkbox.Label>
                                        I have read and agree to the lease terms
                                        and conditions.
                                    </Checkbox.Label>
                                </Checkbox.Root>
                            </Stack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() => onSubmit(lease!.termsHash)}
                                disabled={!agreed || !lease?.termsHash}
                                loading={loading}
                            >
                                Confirm & Send Request
                            </Button>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" disabled={loading} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default LeaseView
