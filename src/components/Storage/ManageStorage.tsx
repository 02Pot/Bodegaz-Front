import { deleteStorage, getStorageByWarehouseId } from '@/lib/api/storage'
import { qk } from '@/lib/queryKeys'
import type { SellerWarehouseResponse, StorageResponse } from '@/types'
import {
    Box,
    Button,
    Card,
    CloseButton,
    Drawer,
    HStack,
    IconButton,
    Portal,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LuPencil, LuPlus, LuTrash } from 'react-icons/lu'

type ManageStorageDrawerProps = {
    warehouse: SellerWarehouseResponse
    onClose: () => void
    onAdd: () => void
    onEdit: (storage: StorageResponse) => void
}

const ManageStorageDrawer = ({
    warehouse,
    onClose,
    onAdd,
    onEdit,
}: ManageStorageDrawerProps) => {
    const queryClient = useQueryClient()

    const { data: storages = [], isLoading } = useQuery({
        queryKey: qk.storages(warehouse!.warehouseId),
        queryFn: () => getStorageByWarehouseId(warehouse!.warehouseId),
        enabled: !!warehouse,
        retry: false,
    })

    const remove = useMutation({
        mutationFn: (storageId: string) =>
            deleteStorage(warehouse.warehouseId, storageId),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: qk.storages(warehouse.warehouseId),
            }),
    })

    return (
        <Drawer.Root
            open={!!warehouse}
            onOpenChange={(e) => !e.open && onClose()}
            size="md"
        >
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content>
                        <Drawer.Header>
                            <Drawer.Title>
                                Storage in {warehouse?.name}
                            </Drawer.Title>
                        </Drawer.Header>

                        <Drawer.Body>
                            <VStack align="stretch" gap="3">
                                <Button size="sm" onClick={onAdd}>
                                    <LuPlus /> Add storage
                                </Button>

                                {isLoading && <Spinner />}
                                {!isLoading && storages.length === 0 && (
                                    <Text color="fg.muted">
                                        No storage yet.
                                    </Text>
                                )}

                                {storages.map((storage: StorageResponse) => (
                                    <Card.Root
                                        key={storage.storageTypeId}
                                        size="sm"
                                    >
                                        <Card.Body>
                                            <HStack justify="space-between">
                                                <Box>
                                                    <Text fontWeight="medium">
                                                        {storage.blockName}
                                                    </Text>
                                                    <Text
                                                        fontSize="sm"
                                                        color="fg.muted"
                                                    >
                                                        {storage.maxWeight} kg
                                                    </Text>
                                                </Box>
                                                <HStack>
                                                    <IconButton
                                                        size="xs"
                                                        variant="outline"
                                                        onClick={() =>
                                                            onEdit(storage)
                                                        }
                                                    >
                                                        <LuPencil />
                                                    </IconButton>
                                                    <IconButton
                                                        size="xs"
                                                        variant="outline"
                                                        colorPalette="red"
                                                        loading={
                                                            remove.isPending
                                                        }
                                                        onClick={() =>
                                                            remove.mutate(
                                                                storage.storageId
                                                            )
                                                        }
                                                    >
                                                        <LuTrash />
                                                    </IconButton>
                                                </HStack>
                                            </HStack>
                                        </Card.Body>
                                    </Card.Root>
                                ))}
                            </VStack>
                        </Drawer.Body>

                        <Drawer.CloseTrigger asChild>
                            <CloseButton />
                        </Drawer.CloseTrigger>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    )
}

export default ManageStorageDrawer
