import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { connectChat, disconnectChat } from '@/lib/api/ws/chat'
import { useAuth } from '@/lib/hooks/useAuth'
import { Box, Flex } from '@chakra-ui/react'
import { useEffect } from 'react'

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth()

    useEffect(() => {
        if (!isAuthenticated) return
        connectChat()
        return disconnectChat
    }, [isAuthenticated])

    return (
        <Flex h="100vh" overflow="hidden">
            <Sidebar />
            <Flex direction="column" flex="1" overflow="hidden">
                <Navbar />
                <Box
                    flex="1"
                    overflowY="auto"
                    p={{ base: 4, md: 8 }}
                    bg="bg"
                    color="fg"
                >
                    {children}
                </Box>
            </Flex>
        </Flex>
    )
}

export default HomeLayout
