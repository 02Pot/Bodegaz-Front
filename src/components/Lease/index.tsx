import { previewLease } from '@/lib/api/lease';
import type { BookingRequest } from '@/types';
import { Button, Checkbox, CloseButton, Dialog, Portal, Stack, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { LuBox, LuCalendar, LuCreditCard, LuPackageCheck, LuPhilippinePeso, LuRepeat, LuShieldCheck, LuWarehouse } from 'react-icons/lu';

type Props = {
  open: boolean
  request: BookingRequest
  loading?: boolean
  onClose: () => void
  onSubmit: (termsHash: string) => void
  children?: ReactNode
}

type SummaryItem = { icon: IconType; label: string; value: string; sub?: string }

const buildSummary = (k: Record<string, string>): SummaryItem[] => {
  const v = (key: string) => k[key] ?? '—'
  return [
    { icon: LuWarehouse, label: 'Storage Section', value: [k.block_name, k.section].filter(Boolean).join(' – ') || '—' },
    { icon: LuBox, label: 'Leased Space', value: `${v('rented_volume')} m³`, sub: `Up to ${v('rented_weight')} kg of goods` },
    { icon: LuCalendar, label: 'Lease Duration', value: `${v('start_date')} – ${v('end_date')}` },
    { icon: LuPhilippinePeso, label: 'Rental Price', value: `${v('rent_amount')} / ${v('billing_cycle')} · ${v('total_price')} total` },
    { icon: LuShieldCheck, label: 'Security Deposit', value: v('deposit_amount') },
    { icon: LuCreditCard, label: 'Payment Schedule', value: `Billed ${v('billing_cycle')}, day ${v('billing_day')}` },
    { icon: LuPackageCheck, label: 'Permitted Goods', value: v('permitted_items') },
    { icon: LuRepeat, label: 'Cancellation', value: `${v('notice_days')} days written notice` },
  ]
}
const LeaseView = ({ open,request, loading = false, onClose, onSubmit, children }: Props) => {
  const [agreed, setAgreed] = useState(false)

  const { data: lease, isLoading, isError } = useQuery({
    queryKey: ['lease-preview', request],
    queryFn: () => previewLease(request!),
    enabled: open && !!request,
    retry: false,
  })

  const renderBold = (text: string) =>
    text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
      i % 2 ? <strong key={i}>{part}</strong> : part,
    )

  useEffect(() => setAgreed(false), [lease?.termsHash])

  const handleClose = () => {
    if (loading) return
    setAgreed(false)
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
              <Dialog.Title>Warehouse Lease Agreement</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap={4}>
                {children}

                {isLoading && <Text color="fg.muted">Loading lease terms…</Text>}
                {isError && <Text color="fg.error">Couldn’t load the lease terms. Please try again.</Text>}
                
                {lease && <Text fontSize="sm" whiteSpace="pre-wrap">{renderBold(lease.termsConditions)}</Text>}

                <Checkbox.Root checked={agreed} disabled={!lease} onCheckedChange={(e) => setAgreed(!!e.checked)}>
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>I have read and agree to the lease terms and conditions.</Checkbox.Label>
                </Checkbox.Root>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button variant="outline" onClick={handleClose} disabled={loading}>Back</Button>
              <Button onClick={() => onSubmit(lease?.termsHash!)} disabled={!agreed || !lease} loading={loading}>
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