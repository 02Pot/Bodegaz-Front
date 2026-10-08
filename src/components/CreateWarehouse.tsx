import { addWarehouse } from '@/lib/api/warehouse'
import { Button, CloseButton, Dialog, Field, Input, Portal, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useState } from 'react'

type FormState = {
    name: string
    warehouseCapacityKg: string 
    addressLine1: string
    addressLine2: string
    city: string
    stateProvince: string
    country: string
    postalCode: string
}
type Errors = Partial<Record<keyof FormState, string>>

const emptyForm: FormState = {
    name: '',
    warehouseCapacityKg: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    country: '',
    postalCode: '',
}

const validate = (f: FormState): Errors => {
    const e: Errors = {}
    if (!f.name.trim()) e.name = 'Name is required'
    const cap = Number(f.warehouseCapacityKg)
    if (!f.warehouseCapacityKg.trim()) e.warehouseCapacityKg = 'Capacity is required'
    else if (!Number.isFinite(cap) || cap <= 0) e.warehouseCapacityKg = 'Capacity must be greater than 0'
    if (!f.addressLine1.trim()) e.addressLine1 = 'Address 1 is required'
    if (!f.addressLine2.trim()) e.addressLine2 = 'Address 2 is required'
    if (!f.city.trim()) e.city = 'City is required'
    if (!f.stateProvince.trim()) e.stateProvince = 'State / Province is required'
    if (!f.country.trim()) e.country = 'Country is required'
    if (!f.postalCode.trim()) e.postalCode = 'Postal code is required'
    return e
}

const CreateWarehouse = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const queryClient = useQueryClient()
    const [form, setForm] = useState<FormState>(emptyForm)
    const [errors, setErrors] = useState<Errors>({})
    const [serverError, setServerError] = useState<string | null>(null)

    const { mutate, isPending } = useMutation({
        mutationFn: addWarehouse,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['warehouses'] })
            handleClose()
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            setServerError(error.response?.data?.message ?? 'Failed to create warehouse')
        },
    })

    const handleClose = () => {
        setForm(emptyForm)
        setErrors({})
        setServerError(null)
        onClose()
    }

    const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }))
        if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined })) // clear error as user fixes it
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setServerError(null)
        const found = validate(form)
        setErrors(found)
        if (Object.keys(found).length > 0) return

        mutate({
            name: form.name.trim(),
            warehouseCapacityKg: Number(form.warehouseCapacityKg),
            addressLine1: form.addressLine1.trim(),
            addressLine2: form.addressLine2.trim(),
            city: form.city.trim(),
            stateProvince: form.stateProvince.trim(),
            country: form.country.trim(),
            postalCode: form.postalCode.trim(),
        })
    }

    const field = (key: keyof FormState, label: string, props: React.ComponentProps<typeof Input> = {}) => (
        <Field.Root required invalid={!!errors[key]}>
            <Field.Label>
                {label} <Field.RequiredIndicator />
            </Field.Label>
            <Input value={form[key]} onChange={update(key)} {...props} />
            <Field.ErrorText>{errors[key]}</Field.ErrorText>
        </Field.Root>
    )

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(e) => !e.open && handleClose()}
            placement="center"
            scrollBehavior="inside"
            size="lg"
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content as="form" onSubmit={handleSubmit}>
                        <Dialog.Header>
                            <Dialog.Title>Create Warehouse</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Stack gap="4">
                                {field('name', 'Warehouse name', { placeholder: 'e.g. Central Storage' })}
                                {field('warehouseCapacityKg', 'Capacity (kg)', { type: 'number', min: 0, step: 'any' })}
                                {field('addressLine1', 'Address line 1')}
                                {field('addressLine2', 'Address line 2')}
                                <SimpleGrid columns={2} gap="4">
                                    {field('city', 'City')}
                                    {field('stateProvince', 'State / Province')}
                                    {field('country', 'Country')}
                                    {field('postalCode', 'Postal code')}
                                </SimpleGrid>
                                {serverError && <Text color="fg.error" fontSize="sm">{serverError}</Text>}
                            </Stack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Button variant="outline" onClick={handleClose} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={isPending}>
                                Create
                            </Button>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default CreateWarehouse