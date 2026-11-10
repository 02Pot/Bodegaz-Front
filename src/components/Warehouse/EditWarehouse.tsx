import { BASE_URL } from '@/constant'
import type { SellerWarehouseResponse, WarehouseImageResponse } from '@/types'
import {
    Box,
    Button,
    Dialog,
    Field,
    Image,
    Input,
    Portal,
    SimpleGrid,
    Stack,
    Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { LuTrash } from 'react-icons/lu'

export type WarehouseEditValues = {
    name?: string
    warehouseCapacityKg?: number
}

type Props = {
    warehouse: SellerWarehouseResponse
    open: boolean
    onClose: () => void
    onSubmit: (
        values: WarehouseEditValues,
        newFiles: File[],
        removeImageIds: string[]
    ) => Promise<void>
}

const EditWarehouseDialog = ({ warehouse, open, onClose, onSubmit }: Props) => {
    const [name, setName] = useState(warehouse.name)
    const [capacity, setCapacity] = useState(warehouse.warehouseCapacityKg)

    const [currentImages, setCurrentImages] = useState<
        WarehouseImageResponse[]
    >(warehouse.images ?? [])
    const [removeImageIds, setRemoveImageIds] = useState<string[]>([])
    const [newFiles, setNewFiles] = useState<File[]>([])
    const [newPreviews, setNewPreviews] = useState<string[]>([])

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)
    const [serverError, setServerError] = useState('')

    const allocatedKg = warehouse.allocatedKg ?? 0

    useEffect(() => {
        return () => {
            newPreviews.forEach((preview) => URL.revokeObjectURL(preview))
        }
    }, [newPreviews])

    const handleRemoveExisting = (id: string) => {
        setCurrentImages((prev) => prev.filter((img) => img.imageId !== id))
        setRemoveImageIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        if (files.length === 0) return

        setNewFiles((prev) => [...prev, ...files])
        setNewPreviews((prev) => [
            ...prev,
            ...files.map((file) => URL.createObjectURL(file)),
        ])

        e.target.value = ''
    }

    const handleRemoveNewFile = (index: number) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== index))

        setNewPreviews((prev) => {
            const preview = prev[index]

            if (preview) URL.revokeObjectURL(preview)

            return prev.filter((_, i) => i !== index)
        })
    }

    const trimmedName = name.trim()

    const patch: WarehouseEditValues = {}
    if (trimmedName !== warehouse.name) {
        patch.name = trimmedName
    }
    if (capacity !== warehouse.warehouseCapacityKg) {
        patch.warehouseCapacityKg = capacity
    }

    const hasChanges =
        Object.keys(patch).length > 0 ||
        newFiles.length > 0 ||
        removeImageIds.length > 0

    const submit = async () => {
        const validationErrors: Record<string, string> = {}

        if (!trimmedName) {
            validationErrors.name = 'Enter a warehouse name'
        }
        if (!(capacity > 0)) {
            validationErrors.capacity = 'Enter a capacity greater than 0'
        } else if (capacity < allocatedKg) {
            validationErrors.capacity = `${allocatedKg} kg is already assigned to storages`
        }

        setErrors(validationErrors)
        if (Object.keys(validationErrors).length > 0) return

        if (!hasChanges) {
            onClose()
            return
        }

        setSaving(true)
        setServerError('')

        try {
            await onSubmit(patch, newFiles, removeImageIds)
            onClose()
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(details) => !details.open && onClose()}
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content maxW="lg">
                        <Dialog.Header>
                            <Dialog.Title>Edit Warehouse</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Stack gap={4}>
                                <Field.Root invalid={!!errors.name} required>
                                    <Field.Label>Name</Field.Label>
                                    <Input
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                    />
                                    <Field.ErrorText>
                                        {errors.name}
                                    </Field.ErrorText>
                                </Field.Root>

                                <Field.Root
                                    invalid={!!errors.capacity}
                                    required
                                >
                                    <Field.Label>
                                        Total capacity (kg)
                                    </Field.Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={capacity || ''}
                                        onChange={(e) =>
                                            setCapacity(Number(e.target.value))
                                        }
                                    />
                                    <Field.HelperText>
                                        {allocatedKg} kg currently assigned to
                                        storages
                                    </Field.HelperText>
                                    <Field.ErrorText>
                                        {errors.capacity}
                                    </Field.ErrorText>
                                </Field.Root>

                                <Stack gap={2}>
                                    <Text fontSize="sm" fontWeight="medium">
                                        Existing Images
                                    </Text>

                                    {currentImages.length === 0 ? (
                                        <Text fontSize="xs" color="fg.muted">
                                            No images uploaded
                                        </Text>
                                    ) : (
                                        <SimpleGrid columns={4} gap={2}>
                                            {currentImages.map((img) => (
                                                <Box
                                                    key={img.imageId}
                                                    position="relative"
                                                    borderRadius="md"
                                                    overflow="hidden"
                                                    borderWidth="1px"
                                                >
                                                    <Image
                                                        src={`${BASE_URL}${img.url}`}
                                                        alt="Warehouse"
                                                        objectFit="cover"
                                                        h="100px"
                                                        w="full"
                                                    />
                                                    <Button
                                                        size="xs"
                                                        colorPalette="red"
                                                        position="absolute"
                                                        top="1"
                                                        right="1"
                                                        onClick={() =>
                                                            handleRemoveExisting(
                                                                img.imageId
                                                            )
                                                        }
                                                    >
                                                        <LuTrash size={12} />
                                                    </Button>
                                                </Box>
                                            ))}
                                        </SimpleGrid>
                                    )}
                                </Stack>

                                <Stack gap={2}>
                                    <Field.Root>
                                        <Field.Label>
                                            Add New Images
                                        </Field.Label>
                                        <Input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            p={1}
                                        />
                                    </Field.Root>

                                    {newPreviews.length > 0 && (
                                        <SimpleGrid columns={4} gap={2} mt={2}>
                                            {newPreviews.map(
                                                (preview, index) => (
                                                    <Box
                                                        key={preview}
                                                        position="relative"
                                                        borderRadius="md"
                                                        overflow="hidden"
                                                        borderWidth="1px"
                                                    >
                                                        <Image
                                                            src={preview}
                                                            alt="New upload preview"
                                                            objectFit="cover"
                                                            h="100px"
                                                            w="full"
                                                        />
                                                        <Button
                                                            size="xs"
                                                            colorPalette="red"
                                                            position="absolute"
                                                            top="1"
                                                            right="1"
                                                            onClick={() =>
                                                                handleRemoveNewFile(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            <LuTrash
                                                                size={12}
                                                            />
                                                        </Button>
                                                    </Box>
                                                )
                                            )}
                                        </SimpleGrid>
                                    )}
                                </Stack>

                                {serverError && (
                                    <Text fontSize="sm" color="fg.error">
                                        {serverError}
                                    </Text>
                                )}
                            </Stack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                bg="black"
                                color="white"
                                _hover={{ bg: 'gray.800' }}
                                onClick={submit}
                                loading={saving}
                                disabled={!hasChanges}
                            >
                                Save changes
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default EditWarehouseDialog
