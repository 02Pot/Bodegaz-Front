import { addWarehouse } from '@/lib/api/warehouse'
import { Box, Button, CloseButton, Dialog, Field, Fieldset, FileUpload, Flex, Icon, Input, Portal, Span, Stack, useFileUploadContext } from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { LuUpload } from 'react-icons/lu'

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


const MAX_IMAGES = 5
const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

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

const ConditionalDropzone = () => {
    const fileUpload = useFileUploadContext()
    const acceptedFiles = fileUpload.acceptedFiles

    if (acceptedFiles.length >= MAX_IMAGES) {
        return null
    }

    return (
        <FileUpload.Dropzone>
        <Icon size="md" color="fg.muted">
            <LuUpload />
        </Icon>
        <FileUpload.DropzoneContent>
            <Box>Drag and drop files here</Box>
            <Box color="fg.muted">
            {MAX_IMAGES - acceptedFiles.length} more file
            {MAX_IMAGES - acceptedFiles.length !== 1 ? "s" : ""} allowed
            </Box>
        </FileUpload.DropzoneContent>
        </FileUpload.Dropzone>
    )
}

const ImagePreviews = () => (
    <FileUpload.ItemGroup
        display="grid"
        gridTemplateColumns="repeat(4, 1fr)"
        gap="2"
    >
        <FileUpload.Context>
            {({ acceptedFiles }) =>
                acceptedFiles.map((file) => (
                    <FileUpload.Item
                        key={`${file.name}-${file.size}-${file.lastModified}`}
                        file={file}
                        p="0"
                        position="relative"
                        h="70px"
                        overflow="hidden"
                        rounded="md"
                        border="1px solid"
                        borderColor="gray.200"
                    >
                        <FileUpload.ItemPreviewImage
                            w="100%"
                            h="100%"
                            objectFit="cover"
                        />
                        <FileUpload.ItemDeleteTrigger asChild>
                            <CloseButton
                                size="2xs"
                                position="absolute"
                                top="1"
                                right="1"
                                bg="white"
                                rounded="full"
                            />
                        </FileUpload.ItemDeleteTrigger>
                    </FileUpload.Item>
                ))
            }
        </FileUpload.Context>
    </FileUpload.ItemGroup>
)

const CreateWarehouse = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const queryClient = useQueryClient()
    const [form, setForm] = useState<FormState>(emptyForm)
    const [errors, setErrors] = useState<string | null>(null)
    const [images, setImages] = useState<File[]>([])
    const [fieldErrors, setFieldErrors] = useState<Errors>({})

    const { mutate, isPending } = useMutation({
        mutationFn: addWarehouse,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['warehouses'] })
            handleClose()
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            setErrors(error.response?.data?.message ?? 'Failed to create warehouse')
        },
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    const handleClose = () => {
        setForm(emptyForm)
        setImages([])
        setErrors(null)
        onClose()
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('submit fired', form, validate(form))
        const found = validate(form)
        setFieldErrors(found)
        if (Object.keys(found).length > 0) return

        mutate({
            request: {
                name: form.name.trim(),
                warehouseCapacityKg: Number(form.warehouseCapacityKg),
                addressLine1: form.addressLine1.trim(),
                addressLine2: form.addressLine2.trim(),
                city: form.city.trim(),
                stateProvince: form.stateProvince.trim(),
                country: form.country.trim(),
                postalCode: form.postalCode.trim(),
            },
            images,
        })
    }

    const field = (name: keyof FormState, label: string, type = 'text') => (
        <Field.Root invalid={!!fieldErrors[name]}>
            <Field.Label>{label}<Span color="red">*</Span></Field.Label>
            <Input name={name} type={type} value={form[name]} onChange={handleChange} />
            <Field.ErrorText>{fieldErrors[name]}</Field.ErrorText>
        </Field.Root>
    )

    const previews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images])
    useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])

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
                                <Fieldset.Root size="lg">
                                    <Fieldset.Content>
                                        {field('name', 'Warehouse Name')}
                                        {field('warehouseCapacityKg', 'Warehouse Capacity (KG)', 'number')}
                                        {field('addressLine1', 'Address Line 1')}
                                        {field('addressLine2', 'Address Line 2')}
                                        <Flex gap="4">
                                            {field('city', 'City')}
                                            {field('stateProvince', 'State / Province')}
                                        </Flex>
                                        <Flex gap="4">
                                            {field('country', 'Country')}
                                            {field('postalCode', 'Postal Code')}
                                        </Flex>
                                    </Fieldset.Content>
                                </Fieldset.Root>

                                <FileUpload.Root alignItems="stretch" maxFiles={MAX_IMAGES} maxFileSize={MAX_SIZE} accept={ALLOWED} 
                                    onFileChange={(details) => setImages(details.acceptedFiles)}
                                    onFileReject={() => setErrors('Only JPEG, PNG, or WebP images up to 10MB are allowed (max 5)')} allowDrop >
                                    <FileUpload.HiddenInput />
                                    <ConditionalDropzone />
                                    <ImagePreviews/>
                                </FileUpload.Root>
                            </Stack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Flex
                                w='100%'
                                justifyContent="space-between"
                                alignItems="center"
                                px={6}
                                py={4}
                                bg="gray.50"
                                borderTop="1px solid"
                                borderColor="gray.100"
                                borderBottomRadius="md"
                            >
                            <Button 
                                type='button'
                                variant="ghost" 
                                onClick={handleClose} 
                                disabled={isPending}
                                color="gray.600"
                                _hover={{ bg: "gray.200", color: "gray.800" }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                colorScheme="blue" 
                                loading={isPending}
                                loadingText="Creating..."
                                px={6}
                                fontWeight="semibold"
                            >
                                Create
                            </Button>
                            </Flex>
                        </Dialog.Footer>

                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default CreateWarehouse