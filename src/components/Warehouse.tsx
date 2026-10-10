import { BASE_URL } from "@/constant";
import type { WarehouseInterface } from "@/types";
import {
    Box,
    Button,
    Carousel,
    Center,
    Flex,
    IconButton,
    Image,
    Skeleton,
    SkeletonText,
    Text
} from "@chakra-ui/react";
import { LuChevronDown, LuHeart } from "react-icons/lu";

interface WarehouseProps {
    loading?: boolean;
    warehouse?: WarehouseInterface
    isSaved?: boolean;
    toggleSave?: (warehouse: WarehouseInterface) => void | Promise<void>;
}


const Warehouse = ({
    loading = false,
    warehouse,
    isSaved = false,
    toggleSave,
}: WarehouseProps) => {

    if (loading) {
        return (
            <Box
                w="100%"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="sm"
            >
                <Skeleton h={{ base: "150px", md: "180px" }} />

                <Flex flexDir="column" p={{ base: 4, md: 5 }} gap={5}>
                    <Box>
                        <Skeleton
                            height="24px"
                            width="65%"
                            mb={3}
                            borderRadius="md"
                        />

                        <SkeletonText
                            noOfLines={2}
                            height="3"
                            width="90%"
                        />
                    </Box>

                    <Flex
                        justify="space-between"
                        gap={4}
                        flexWrap="wrap"
                    >
                        <Box flex="1" minW="120px">
                            <Skeleton
                                height="12px"
                                width="70px"
                                mb={2}
                            />
                            <Skeleton
                                height="20px"
                                width="100px"
                            />
                        </Box>

                        <Box flex="1" minW="120px">
                            <Skeleton
                                height="12px"
                                width="110px"
                                mb={2}
                            />
                            <Skeleton
                                height="20px"
                                width="60px"
                            />
                        </Box>
                    </Flex>

                    <Flex
                        gap={3}
                        pt={4}
                        borderTop="1px solid"
                        borderColor="gray.100"
                        flexDir={{ base: "column", sm: "row" }}
                    >
                        <Skeleton
                            height="40px"
                            flex={1}
                            borderRadius="md"
                        />

                        <Skeleton
                            height="40px"
                            flex={1}
                            borderRadius="md"
                        />
                    </Flex>
                </Flex>
            </Box>
        );
    }

    return (
        <Flex
            w="100%"
            flexDir="column"
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="sm"
            transition="all 0.2s"
            _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
        >
    
            <Box
                position="relative"
                h={{ base: "150px", sm: "170px", md: "180px" }}
                bg="gray.100"
                overflow="hidden"
            >
                {warehouse?.imageUrls?.length ? (
                    <Carousel.Root
                        autoplay
                        orientation="vertical"
                        slideCount={warehouse.imageUrls.length}
                        loop
                        w="100%"
                        h="100%"
                    >
                        <Carousel.ItemGroup w="100%" h="100%">
                            {warehouse.imageUrls.map((url, index) => (
                                <Carousel.Item key={url} index={index} h="100%">
                                    <Image
                                        src={`${BASE_URL}${url}`}
                                        alt={`${warehouse.name}`}
                                        w="100%"
                                        h="100%"
                                        objectFit="cover"
                                    />
                                </Carousel.Item>
                            ))}
                        </Carousel.ItemGroup>
                        {warehouse.imageUrls.length > 1 &&
                        <Carousel.Control
                            position="absolute"
                            right={{ base: 2, md: 3 }}
                            top={{ base: 10, md: 14 }}
                            bottom={{ base: 2, md: 3 }}
                            flexDirection="column"
                            justifyContent="space-between"
                            alignItems="center"
                            zIndex={2}
                        >
                            <Carousel.NextTrigger asChild>
                                <IconButton
                                    size={{ base: "xs", md: "sm" }}
                                    rounded="full"
                                    bg="white"
                                    color="gray.800"
                                    boxShadow="sm"
                                    _hover={{ bg: "gray.50", transform: "scale(1.1)" }}
                                    transition="all 0.15s"
                                >
                                    <LuChevronDown />
                                </IconButton>
                            </Carousel.NextTrigger>
                        </Carousel.Control>}
                    </Carousel.Root>
                ) : (
                    <Center h="100%" color="gray.400">No image</Center>
                )}

                <IconButton
                    aria-label={isSaved ? "Remove from saved" : "Save warehouse"}
                    position="absolute"
                    top={{ base: 2, md: 3 }}
                    right={{ base: 2, md: 3 }}
                    zIndex={2}
                    size={{ base: "xs", md: "sm" }}
                    rounded="full"
                    bg="white"
                    boxShadow="sm"
                    _hover={{ bg: "gray.50", transform: "scale(1.1)" }}
                    transition="all 0.15s"
                    onClick={() => warehouse && toggleSave?.(warehouse)}
                >
                    <LuHeart
                        size={18}
                        color={isSaved ? "#E53E3E" : "#718096"}
                        fill={isSaved ? "#E53E3E" : "none"}
                    />
                </IconButton>
            </Box>

            <Flex
                flexDir="column"
                flex='1'
                p={{ base: 4, md: 5 }}
                gap={5}
            >
                <Box>
                    <Text
                        fontSize={{ base: "lg", md: "xl" }}
                        fontWeight="700"
                    >
                        {warehouse?.name}
                    </Text>

                    <Text
                        mt={1}
                        fontSize="sm"
                        color="gray.600"
                    >
                        {warehouse?.address?.addressLine1} {warehouse?.address?.addressLine2}
                    </Text>
                </Box>

                <Flex
                    gap={{ base: 4, sm: 8 }}
                    flexWrap="wrap"
                    flexDir='column'
                >
                    <Box flex="1" minW="120px">
                        <Text
                            mt={1}
                            fontSize={{ base: "sm", md: "md" }}
                            fontWeight="500"
                        >
                            {warehouse?.address?.country}, {warehouse?.address?.stateProvince}, {warehouse?.address?.city}
                        </Text>
                    </Box>

                    <Box flex="1" minW="120px">
                        <Text
                            fontSize="xs"
                            fontWeight="600"
                            textTransform="uppercase"
                            color="gray.500"
                        >
                            Capacity
                        </Text>

                        <Text
                            mt={1}
                            fontSize={{ base: "sm", md: "md" }}
                            fontWeight="600"
                        >
                            {warehouse?.warehouseCapacityKg} KG
                        </Text>
                    </Box>
                </Flex>

                <Flex
                    mt="auto"
                    gap={3}
                    pt={4}
                    borderTop="1px solid"
                    borderColor="gray.100"
                    flexDir={{ base: "column", md: "row" }}
                >
                    <Button
                        flex={1}
                        variant="outline"
                        size={{ base: "sm", md: "md" }}
                    >
                        Inspect Details
                    </Button>

                    <Button
                        flex={1}
                        size={{ base: "sm", md: "md" }}
                    >
                        Contact
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default Warehouse;

