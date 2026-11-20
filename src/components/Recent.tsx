import { BASE_URL } from '@/constant'
import { clearRecent, useRecent } from '@/lib/recent'
import { Avatar, Box, Flex, Image, Text } from '@chakra-ui/react'
import { useNavigate } from '@tanstack/react-router'

const RecentVisited = () => {
    const recent = useRecent()
    const navigate = useNavigate()

    return (
        <Flex
            flexDir="column"
            gap="8px"
            p="12px"
            borderRadius="lg"
            borderWidth="2px"
            borderStyle="solid"
            boxShadow="sm"
            bg="bg.panel"
            w="100%"
        >
            <Flex justifyContent="space-between">
                <Text fontSize="14px">Recent Visited</Text>
                <Text
                    fontSize="14px"
                    color="#5b75c9"
                    cursor="pointer"
                    onClick={clearRecent}
                >
                    Clear
                </Text>
            </Flex>

            {recent.length === 0 && (
                <Text fontSize="12px" color="gray.500">
                    No recent visits
                </Text>
            )}

            {recent.map((r) => (
                <Box
                    key={r.warehouseId}
                    bg="bg.emphasized"
                    borderWidth="2px"
                    borderStyle="solid"
                    boxShadow="sm"
                    borderRadius="md"
                    p="8px"
                    cursor="pointer"
                    transition="all 0.15s"
                    _hover={{ bg: 'gray.100' }}
                    onClick={() =>
                        navigate({
                            to: '/warehouse/$warehouseId',
                            params: { warehouseId: r.warehouseId },
                        })
                    }
                >
                    <Flex gap="8px" mb="6px" align="center" minW={0}>
                        <Avatar.Root size="sm" flexShrink={0}>
                            <Avatar.Fallback name={r.name} />
                            {r.imageUrl && (
                                <Avatar.Image
                                    src={`${BASE_URL}${r.imageUrl}`}
                                />
                            )}
                        </Avatar.Root>
                        <Box minW={0}>
                            <Text fontSize="12px" fontWeight="600" truncate>
                                {r.name}
                            </Text>
                            <Text fontSize="12px" color="fg" truncate>
                                {r.address}
                            </Text>
                        </Box>
                    </Flex>
                    {r.imageUrl && (
                        <Image
                            borderRadius="md"
                            w="100%"
                            h="110px"
                            objectFit="cover"
                            src={`${BASE_URL}${r.imageUrl}`}
                        />
                    )}
                </Box>
            ))}
        </Flex>
    )
}

export default RecentVisited
