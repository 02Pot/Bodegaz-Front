import { BASE_URL, MATERIAL_TYPES } from "@/constant";
import { addStorage, listType, updateStorage } from "@/lib/api/storage";
import { deleteWarehouse, updateWarehouse } from "@/lib/api/warehouse";
import { qk, refreshWarehouseData } from "@/lib/queryKeys";
import type { SellerWarehouseResponse, StorageResponse } from "@/types";
import {
    Badge,
    Box,
    Button,
    Card,
    Carousel,
    Center,
    Flex,
    Heading,
    HStack,
    IconButton,
    Image,
    Input,
    InputGroup,
    Progress,
    SimpleGrid,
    Stat,
    Text,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LuChevronRight, LuPencil, LuPlus, LuSearch, LuTrash } from "react-icons/lu";
import { DeleteConfirmationDialog } from "../DeleteComponent";
import AddStorageDialog from "../Storage/AddStorageDialog";
import EditStorageDialog from "../Storage/EditStorageDialog";
import ManageStorageDrawer from "../Storage/ManageStorage";
import CreateWarehouse from "./CreateWarehouse";
import EditWarehouseDialog from "./EditWarehouse";

type Props = {
    warehouses: SellerWarehouseResponse[];
};

const WarehousesPanel = ({ warehouses = [] }: Props) => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [warehouseToDelete, setWarehouseToDelete] = useState<SellerWarehouseResponse | null>(null);
    
    const [editForId, setEditForId] = useState<string | null>(null);
    const [addForId, setAddForId] = useState<string | null>(null);
    const [manageForId, setManageForId] = useState<string | null>(null);
    const [editStorage,setEditStorage] = useState<StorageResponse | null>(null);

    const addFor = warehouses.find((w) => w.warehouseId === addForId) ?? null
    const manageFor = warehouses.find((w) => w.warehouseId === manageForId) ?? null
    const editFor = warehouses.find((w) => w.warehouseId === editForId) ?? null;

    const { data: storageTypes = [] } = useQuery({
        queryKey: ["storage-types"],
        queryFn: listType,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    const deleteMutation = useMutation({
        mutationFn: (warehouseId: string) => deleteWarehouse(warehouseId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: qk.warehousesAll });
            setWarehouseToDelete(null)
        }
    })

    const q = search.toLowerCase();
    const items = warehouses.filter(
        (w) => w.name.toLowerCase().includes(q) || w.address.city.toLowerCase().includes(q),
    );

    return (
        <Box spaceY={3} pt={3}>
            <Flex
                justify="space-between"
                align={{ base: "stretch", md: "center" }}
                direction={{ base: "column", md: "row" }}
                gap={3}
            >
                <InputGroup maxW={{ base: "100%", md: "320px" }} startElement={<LuSearch />}>
                    <Input
                        placeholder="Search warehouses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </InputGroup>
                <Button onClick={() => setCreateOpen(true)}>
                    <LuPlus /> Add warehouse
                </Button>
            </Flex>

            {items.length === 0 ? (
                <Box borderWidth="1px" borderRadius="lg" p={10} textAlign="center">
                    <Text fontWeight="medium">No warehouses found</Text>
                    <Text fontSize="sm" color="fg.muted" mt={1}>
                        Create a warehouse to start receiving rentals.
                    </Text>
                </Box>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={3}>
                    {items.map((w) => {
                        const pct =
                            w.warehouseCapacityKg > 0
                                ? Math.min(100, Math.round((w.allocatedKg / w.warehouseCapacityKg) * 100))
                                : 0;

                        return (
                            <Card.Root key={w.warehouseId} variant="outline" overflow="hidden">
                                <Box position="relative" h="160px" bg="bg.muted" overflow="hidden">
                                    {w.images.length ? (
                                        <Carousel.Root
                                            autoplay={w.images.length > 1}
                                            slideCount={w.images.length}
                                            loop
                                            w="100%"
                                            h="100%"
                                        >
                                            <Carousel.ItemGroup w="100%" h="100%">
                                                {w.images.map((img, index) => (
                                                    <Carousel.Item key={img.imageId} index={index} h="100%">
                                                        <Image
                                                            src={`${BASE_URL}${img.url}`}
                                                            alt={w.name}
                                                            w="100%"
                                                            h="100%"
                                                            objectFit="cover"
                                                        />
                                                    </Carousel.Item>
                                                ))}
                                            </Carousel.ItemGroup>
                                            {w.images.length > 1 && (
                                                <Carousel.Control
                                                    top={2}
                                                    right={2}
                                                    position="absolute"
                                                    flexDirection="column"
                                                    justifyContent="flex-end"
                                                    alignItems="flex-end"
                                                    zIndex={2}
                                                >
                                                    <Carousel.NextTrigger asChild>
                                                        <IconButton
                                                            aria-label="Next photo"
                                                            size="xs"
                                                            rounded="full"
                                                            bg="white"
                                                            color="gray.800"
                                                            boxShadow="sm"
                                                            _hover={{ bg: "gray.50" }}
                                                        >
                                                            <LuChevronRight />
                                                        </IconButton>
                                                    </Carousel.NextTrigger>
                                                </Carousel.Control>
                                            )}
                                        </Carousel.Root>
                                    ) : (
                                        <Center h="100%" color="fg.muted">
                                            No photo
                                        </Center>
                                    )}
                                </Box>

                                <Card.Body gap={3}>
                                    <Flex justify="space-between" align="start" gap={2}>
                                        <Box minW={0}>
                                            <Heading size="md" truncate>
                                                {w.name}
                                            </Heading>
                                            <Text fontSize="sm" color="fg.muted" truncate>
                                                {w.address.addressLine1}, {w.address.city}
                                            </Text>
                                        </Box>
                                        <Badge colorPalette={w.draft ? "orange" : "green"}>
                                            {w.draft ? "Draft" : "Active"}
                                        </Badge>
                                    </Flex>

                                    <Box>
                                        <Flex justify="space-between" fontSize="xs" mb={1}>
                                            <Text color="fg.muted">Capacity allocated</Text>
                                            <Text>
                                                {w.allocatedKg} / {w.warehouseCapacityKg} kg
                                            </Text>
                                        </Flex>
                                        <Progress.Root value={pct} size="sm">
                                            <Progress.Track>
                                                <Progress.Range />
                                            </Progress.Track>
                                        </Progress.Root>
                                    </Box>

                                    <SimpleGrid columns={3} gap={2}>
                                        <Stat.Root alignItems="center">
                                            <Stat.ValueText fontSize="lg">{w.storageCount}</Stat.ValueText>
                                            <Stat.Label>Storages</Stat.Label>
                                        </Stat.Root>
                                        <Stat.Root alignItems="center">
                                            <Stat.ValueText fontSize="lg">{w.bookedCount}</Stat.ValueText>
                                            <Stat.Label>Booked</Stat.Label>
                                        </Stat.Root>
                                        <Stat.Root alignItems="center">
                                            <Stat.ValueText fontSize="lg">{w.viewCount}</Stat.ValueText>
                                            <Stat.Label>Views</Stat.Label>
                                        </Stat.Root>
                                    </SimpleGrid>

                                    {w.draft && (
                                        <Text fontSize="xs" color="orange.fg">
                                            Hidden from customers until you add storage.
                                        </Text>
                                    )}
                                </Card.Body>

                                <Card.Footer>
                                    <HStack w="full">
                                        <Button flex="1" size="sm" 
                                            onClick={() => (w.draft ? setAddForId(w.warehouseId) : setManageForId(w.warehouseId))}
                                        >
                                            {w.draft ? "Add storage" : "Manage storage"}
                                        </Button>
                                        <Button size="sm" variant="outline" 
                                            onClick={() => setEditForId(w.warehouseId)}>
                                            <LuPencil/>
                                        </Button>
                                        <Button size="sm" variant="outline" colorPalette="red"
                                            onClick={() => setWarehouseToDelete(w)}
                                        >
                                            <LuTrash/>
                                        </Button>
                                    </HStack>
                                </Card.Footer>
                            </Card.Root>
                        );
                    })}
                </SimpleGrid>
            )}

            <CreateWarehouse open={createOpen} onClose={() => setCreateOpen(false)} />
            <DeleteConfirmationDialog 
                open={!!warehouseToDelete} 
                onClose={() => !deleteMutation.isPending && setWarehouseToDelete(null)}
                onConfirm={() => warehouseToDelete && deleteMutation.mutate(warehouseToDelete.warehouseId)}
            />
            {addFor && (
                <AddStorageDialog
                    open
                    onClose={() => setAddForId(null)}
                    warehouseName={addFor.name}
                    remainingCapacityKg={addFor.warehouseCapacityKg - addFor.allocatedKg}
                    storageTypes={storageTypes}
                    materialTypes={[...MATERIAL_TYPES]}
                    onSubmit={async (values) => {
                        await addStorage(addFor.warehouseId, values);
                        await refreshWarehouseData(queryClient,addFor.warehouseId);
                    }}
                />
            )}

            {editFor && (
                <EditWarehouseDialog
                key={editFor.warehouseId}
                open
                onClose={() => setEditForId(null)}
                warehouse={editFor}
                onSubmit={async (values, newFiles, removeImageIds) => {
                    await updateWarehouse(
                        editFor.warehouseId,
                        values,
                        newFiles,
                        removeImageIds
                    );
                    await refreshWarehouseData(queryClient, editFor.warehouseId)
                }}
            />
            )}

            {editStorage && manageFor && (
                <EditStorageDialog 
                    storage={editStorage}
                    onClose={() => setEditStorage(null)}
                    onSubmit={async (values) => {
                        await updateStorage(editStorage.warehouseId, editStorage.storageId, values);
                        await refreshWarehouseData(queryClient, editStorage.warehouseId)
                    }}
                />
            )}

            {manageFor && (
                <ManageStorageDrawer 
                    warehouse={manageFor}
                    onClose={() => setManageForId(null)}
                    onAdd={() => setAddForId(manageFor.warehouseId)}
                    onEdit={setEditStorage}
                />
            )}


        </Box>
    );
};

export default WarehousesPanel;