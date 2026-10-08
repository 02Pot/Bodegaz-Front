import { Avatar, Box, Flex, Image, Text } from "@chakra-ui/react"

const RecentVisited = () => {
    return(
        <Flex overflowY='auto' scrollbarWidth='thin' flexDir='column' gap='8px' p='12px' borderRadius='md' minW='20%'>
            <Flex justifyContent='space-between'>
                <Text fontSize='14px'>Recent Visited</Text>
                <Text fontSize='14px' color="#5b75c9">Clear</Text>
            </Flex>
            <Box bg='#c5c5c5' borderRadius='md' p='8px'>
                <Flex gap='8px' mb='6px'>
                    <Avatar.Root size="sm">
                        <Avatar.Fallback name="Segun Adebayo" />
                        <Avatar.Image src="https://bit.ly/sage-adebayo" />
                    </Avatar.Root>
                    <Box>
                        <Text fontSize='12px'>Warehouse Name</Text>
                        <Text fontSize='12px'>Warehouse Address</Text>
                    </Box>
                </Flex>
                <Image 
                    borderRadius='md' 
                    w='100%' h='110px'
                    src='https://picsum.photos/id/237/200/300'
                />
            </Box>
            <Box bg='#c5c5c5' borderRadius='md' p='8px'>
                <Flex gap='8px' mb='6px'>
                    <Avatar.Root size="sm">
                        <Avatar.Fallback name="Segun Adebayo" />
                        <Avatar.Image src="https://bit.ly/sage-adebayo" />
                    </Avatar.Root>
                    <Box>
                        <Text fontSize='12px'>Warehouse Name</Text>
                        <Text fontSize='12px'>Warehouse Address</Text>
                    </Box>
                </Flex>
                <Image 
                    borderRadius='md' 
                    w='100%' h='110px'
                    src='https://picsum.photos/200/300?grayscale'
                />
            </Box>

            <Box bg='#c5c5c5' borderRadius='md' p='8px'>
                <Flex gap='8px' mb='6px'>
                    <Avatar.Root size="sm">
                        <Avatar.Fallback name="Segun Adebayo" />
                        <Avatar.Image src="https://picsum.photos/200/300/?blur=5" />
                    </Avatar.Root>
                    <Box>
                        <Text fontSize='12px'>Warehouse Name</Text>
                        <Text fontSize='12px'>Warehouse Address</Text>
                    </Box>
                </Flex>
                <Image 
                    borderRadius='md' 
                    w='100%' h='110px'
                    src='https://picsum.photos/seed/picsum/200/300'
                />
            </Box>
        <Box bg='#c5c5c5' borderRadius='md' p='8px'>
                <Flex gap='8px' mb='6px'>
                    <Avatar.Root size="sm">
                        <Avatar.Fallback name="Segun Adebayo" />
                        <Avatar.Image src="https://picsum.photos/200/300/?blur=5" />
                    </Avatar.Root>
                    <Box>
                        <Text fontSize='12px'>Warehouse Name</Text>
                        <Text fontSize='12px'>Warehouse Address</Text>
                    </Box>
                </Flex>
                <Image
                    borderRadius='md'
                    w='100%' h='110px'
                    src='https://picsum.photos/seed/picsum/200/300'
                />
            </Box>
        </Flex>
    )
}

export default RecentVisited