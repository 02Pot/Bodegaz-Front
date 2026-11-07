import { createLeaseTemplate } from "@/lib/api/lease";
import { defaultClauses, defaultConfig, type LeaseClause, type LeaseTemplateConfig } from "@/types";
import { Box, Button, Checkbox, Dialog, Field, Grid, Heading, HStack, Input, NativeSelect, Portal, Stack, Text, Textarea } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";



const CreateLeaseTemplate = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [config, setConfig] = useState(defaultConfig)
  const [clauses, setClauses] = useState(defaultClauses)

  const set = <K extends keyof LeaseTemplateConfig>(k: K, v: LeaseTemplateConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v }))

  const { mutate, isPending, error } = useMutation({
    mutationFn: createLeaseTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lease-templates'] })
      onClose()
    },
  })

  const num = (label: string, k: keyof LeaseTemplateConfig) => (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Input type="number" min={0} value={config[k] as number}
        onChange={(e) => set(k, Number(e.target.value) as never)} />
    </Field.Root>
  )

  const updateClause = (i: number, patch: Partial<LeaseClause>) =>
    setClauses((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate({
      name: name.trim(),
      config,
      clauses: clauses.map((c) => ({ ...c, key: c.key || c.title.toLowerCase().replace(/\W+/g, '-') })),
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()} size="xl" scrollBehavior="inside">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content as="form" onSubmit={handleSubmit}>
            <Dialog.Header><Dialog.Title>Create Lease Template</Dialog.Title></Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Field.Root required>
                  <Field.Label>Template name</Field.Label>
                  <Input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
                </Field.Root>

                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                  {num('Term (months)', 'termMonths')}
                  {num('Billing day (1–28)', 'billingDay')}
                  {num('Grace period (days)', 'gracePeriodDays')}
                  {num('Deposit refund (days)', 'depositRefundDays')}
                  {num('Termination notice (days)', 'noticeDaysToTerminate')}
                  {num('Default after (days)', 'defaultDays')}
                </Grid>

                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Field.Root>
                    <Field.Label>Billing cycle</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field value={config.billingCycle}
                        onChange={(e) => set('billingCycle', e.target.value as LeaseTemplateConfig['billingCycle'])}>
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="ANNUAL">Annual</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Access hours</Field.Label>
                    <Input value={config.accessHours} onChange={(e) => set('accessHours', e.target.value)} />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Deposit</Field.Label>
                    <HStack>
                      <NativeSelect.Root>
                        <NativeSelect.Field value={config.deposit.type}
                          onChange={(e) => set('deposit', { ...config.deposit, type: e.target.value as 'FIXED' | 'MONTHS_OF_RENT' })}>
                          <option value="MONTHS_OF_RENT">Months of rent</option>
                          <option value="FIXED">Fixed (₱)</option>
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                      <Input type="number" min={0} value={config.deposit.value}
                        onChange={(e) => set('deposit', { ...config.deposit, value: Number(e.target.value) })} />
                    </HStack>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Late fee</Field.Label>
                    <HStack>
                      <NativeSelect.Root>
                        <NativeSelect.Field value={config.lateFee.type}
                          onChange={(e) => set('lateFee', { ...config.lateFee, type: e.target.value as 'FIXED' | 'PERCENT' })}>
                          <option value="PERCENT">Percent</option>
                          <option value="FIXED">Fixed (₱)</option>
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                      <Input type="number" min={0} value={config.lateFee.value}
                        onChange={(e) => set('lateFee', { ...config.lateFee, value: Number(e.target.value) })} />
                    </HStack>
                  </Field.Root>
                </Grid>

                <Field.Root required>
                  <Field.Label>Permitted items (comma separated)</Field.Label>
                  <Input value={config.permittedItems.join(', ')}
                    onChange={(e) => set('permittedItems', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
                </Field.Root>

                <Checkbox.Root checked={config.autoRenew} onCheckedChange={(e) => set('autoRenew', !!e.checked)}>
                  <Checkbox.HiddenInput /><Checkbox.Control /><Checkbox.Label>Auto-renew</Checkbox.Label>
                </Checkbox.Root>
                <Checkbox.Root checked={config.insuranceRequired} onCheckedChange={(e) => set('insuranceRequired', !!e.checked)}>
                  <Checkbox.HiddenInput /><Checkbox.Control /><Checkbox.Label>Insurance required</Checkbox.Label>
                </Checkbox.Root>

                <Heading size="sm">Clauses</Heading>
                {clauses.map((c, i) => (
                  <Box key={i} borderWidth="1px" borderRadius="md" p={3}>
                    <HStack mb={2}>
                      <Input placeholder="Title" value={c.title} onChange={(e) => updateClause(i, { title: e.target.value })} />
                      <Button variant="ghost" size="sm" disabled={clauses.length === 1}
                        onClick={() => setClauses((cs) => cs.filter((_, j) => j !== i))}>Remove</Button>
                    </HStack>
                    <Textarea rows={3} placeholder="Clause text" value={c.body}
                      onChange={(e) => updateClause(i, { body: e.target.value })} />
                  </Box>
                ))}
                <Button variant="outline" onClick={() => setClauses((cs) => [...cs, { key: '', title: '', body: '' }])}>
                  Add clause
                </Button>

                {error && <Text color="fg.error" fontSize="sm">Couldn’t save the template. Check the fields and try again.</Text>}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button type="submit" loading={isPending}>Save template</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

