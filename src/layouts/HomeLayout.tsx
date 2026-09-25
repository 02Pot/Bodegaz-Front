import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Box, Flex } from '@chakra-ui/react';

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Flex h="100vh" overflow="hidden">
            <Sidebar />
            <Flex direction="column" flex="1" overflow="hidden">
                <Navbar />
                <Box flex="1" overflowY="auto" p={{ base: 4, md: 8 }} bg="gray.50">
                    {children}
                </Box>
            </Flex>
        </Flex>
    );
};

export default HomeLayout;