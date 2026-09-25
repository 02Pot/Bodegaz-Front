import { pageTitles } from '@/constant';
import {
    Avatar,
    Box,
    Flex,
    IconButton,
    Menu,
    Portal,
    Text
} from '@chakra-ui/react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { FaBell } from 'react-icons/fa';

const Navbar = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const current = pageTitles[location.pathname] ?? {
        title: 'Warehouse Marketplace',
        subtitle: 'Browse verified industrial spaces, check real-time availability, and book leases',
    };

    return(
        <Flex 
            as="header"
            w='100%' 
            pl={{ base: 16, md: 8 }}
            pr={{ base: 4, md: 8 }}
            py={4}
            bg='white'
            borderBottom='1px solid'
            borderColor='gray.200'
            justifyContent='space-between' 
            alignItems='center'
            boxShadow='sm'
            position='sticky'
            top='0'
            zIndex='1000'
        >
            <Flex alignItems='center' gap={3} minW={0} flex={1}>
                <Box minW={0}>
                    <Text 
                        fontSize={{ base: 'sm', md: 'lg' }} 
                        fontWeight='bold' 
                        color='gray.900' 
                        lineHeight='1.2'
                        truncate
                    >
                        {current.title}
                    </Text>
                    <Text fontSize='xs' color='gray.500' display={{ base: 'none', md: 'block' }}>
                        {current.subtitle}
                    </Text>
                </Box>
            </Flex>

            <Flex alignItems='center' gap={{ base: 2, md: 6 }} flexShrink={0}>
                <Box 
                    display={{base:'none',md:'block'}}
                    cursor='pointer' 
                    px={{ base: 2, md: 3 }}
                    py={1.5} 
                    borderRadius='xl' 
                    bg='green.200'
                    transition='background 0.2s'
                >
                    <Text fontSize='sm' fontWeight='medium' color='gray.700'>
                        <Box as='span' display={{ base: 'none', sm: 'inline' }}>Active Rentals </Box>
                        2
                    </Text>
                </Box>

                <IconButton
                        position="relative"
                        colorPalette="gray"
                        variant="ghost"
                        aria-label="Notifications"
                        size={{ base: 'md', md: 'lg' }}
                    >
                        <FaBell color={'gray.750'} />
                        <Box as="span"
                            position="absolute"
                            top="6px"
                            right="4px"
                            fontSize="0.65rem"
                            color="white"
                            bg="red.500"
                            borderRadius="full"
                            minW="16px"
                            h="16px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            px="1">
                            2
                        </Box>
                </IconButton>

                <Menu.Root positioning={{placement: "bottom"}}>
                    <Menu.Trigger rounded={'full'} focusRing={'outside'}>
                            <Avatar.Root size="sm">
                                <Avatar.Fallback name="Segun Adebayo" />
                                <Avatar.Image src="https://bit.ly/sage-adebayo" />
                            </Avatar.Root>
                    </Menu.Trigger>
                    <Portal>
                        <Menu.Positioner>
                            <Menu.Content>
                                <Menu.Item value="account">Account</Menu.Item>
                                <Menu.Item value="settings" onClick={() => navigate({to: "/settings"})}>Settings</Menu.Item>
                                <Menu.Item value="logout">Logout</Menu.Item>
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root>
            </Flex>
        </Flex>
    );
};

export default Navbar;