import { Drawer, Flex, IconButton, Portal, Text, VStack } from '@chakra-ui/react';
import { useNavigate, type LinkProps } from '@tanstack/react-router';
import { useState } from 'react';
import type { IconType } from 'react-icons';
import { LuFileText, LuHeadset, LuHeart, LuHouse, LuMenu, LuSearch, LuSettings, LuSparkles } from 'react-icons/lu';
import { MdLeaderboard } from 'react-icons/md';
import CollapsableNav from './CollapsableNav';

const navItems: { label: string; link: LinkProps['to']; icon: IconType }[] = [
    { label: 'Find Rentals', link: '/', icon: LuSearch },
    { label: 'My Rentals', link: '/my-rental', icon: LuHouse },
    { label: 'Saved Warehouses', link: '/saved-rental', icon: LuHeart },
    { label: 'Lease Agreements', link: '/lease-agree', icon: LuFileText },
    { label: 'Support & Inquiries', link: '/supp-inq', icon: LuHeadset },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const [active, setActive] = useState('Find Rentals');
    const [isOpen, setIsOpen] = useState(false);

    const handleNav = (path: LinkProps['to']) => {
        navigate({ to: path });
        setIsOpen(false);
    };

    const sidebarContent = (
        <Flex flexDir="column" h="100%" px={3} py={6} bg='#002b32' w='100%'>
            <Flex alignItems="center" gap={2.5} px={3} pb={6} borderBottom="1px solid" borderColor="gray.200">
                {/* <Flex bg="blue.600" color="white" p={2} borderRadius="lg" alignItems="center" justifyContent="center">
                    <LuBuilding2 size={18} />
                </Flex> */}
                <Text fontSize="md" fontWeight="bold" color='#f7fbfb'>
                    Bodegaz
                </Text>
            </Flex>

            <VStack align="stretch" gap={1} py="3" borderBottom="1px solid" borderColor="gray.200" >
                {navItems.map(({ label,link, icon: Icon }) => {
                    const isActive = active === label;
                    return (
                        <Flex
                            key={label}
                            as="button"
                            onClick={() => {
                                setActive(label)
                                handleNav(link)
                            }}
                            alignItems="center"
                            gap={3}
                            px={3}
                            py={2.5}
                            borderRadius="md"
                            cursor="pointer"
                            bg={isActive ? '#212135' : 'transparent'}
                            color={isActive ? '#02c9e0' : '#f7fbfb'}
                            fontWeight={isActive ? 'semibold' : 'medium'}
                            borderLeft="3px solid"
                            borderLeftColor={isActive ? '#02c9e0' : 'transparent'}
                            _hover={{ bg: isActive ? '#0f0708' : '#264aa7' }}
                            transition="background 0.15s, color 0.15s"
                            textAlign="left"
                            w="full"
                        >
                            <Icon size={18} />
                            <Text fontSize="sm">{label}</Text>
                        </Flex>
                    );
                })}
            </VStack>

            <VStack align="stretch" gap={1} py={3}>
                <CollapsableNav
                    title="Top by Views"
                    icon={<MdLeaderboard />}
                    items={[
                        { isActive: true, label: 'Warehouse A', onClick: () => handleNav('/') },
                        { isActive: true, label: 'Warehouse A', onClick: () => handleNav('/') },
                        { isActive: true, label: 'Warehouse A', onClick: () => handleNav('/') },
                    ]}
                />
                <CollapsableNav
                    title="Newly Added"
                    icon={<LuSparkles />}
                    items={[
                        { isActive: true, label: 'Warehouse A', onClick: () => handleNav('/') },
                        { isActive: true, label: 'Warehouse A', onClick: () => handleNav('/') },
                        { isActive: true, label: 'Warehouse A', onClick: () => handleNav('/') },
                    ]}
                />
            </VStack>

            <Flex
                as="button"
                borderTop="1px solid"
                borderColor="gray.200"
                onClick={() => {
                    setActive('Settings');
                    handleNav('/settings');
                }}
                alignItems="center"
                gap={3}
                px={3}
                py={2.5}
                mt="auto"
                borderRadius="md"
                cursor="pointer"
                bg={active === 'Settings' ? '#212135' : 'transparent'}
                color={active === 'Settings' ? '#02c9e0' : 'gray.700'}
                fontWeight={active === 'Settings' ? 'semibold' : 'medium'}
                _hover={{ bg: active === 'Settings' ? '#0f0708' : '#264aa7' }}
                transition="background 0.15s, color 0.15s"
                textAlign="left"
                w="full"
            >
                <LuSettings size={18} color='#f7fbfb' />
                <Text fontSize="sm" color='#f7fbfb'> Settings</Text>
            </Flex>
        </Flex>
    );

    return (
        <>
            <IconButton
                aria-label="Open menu"
                onClick={() => setIsOpen(true)}
                position="fixed"
                top="4"
                left="4"
                zIndex="1100"
                display={{ base: 'flex', md: 'none' }}
                size="md"
                variant="outline"
                bg="white"
            >
                <LuMenu />
            </IconButton>

            <Flex
                as="nav"
                display={{ base: 'none', md: 'flex' }}
                w="240px"
                bg="white"
                borderRight="1px solid"
                borderColor="gray.200"
                h="100%"
            >
                {sidebarContent}
            </Flex>

            <Drawer.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} placement="start">
                <Portal>
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content maxW="280px">
                            {sidebarContent}
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>
        </>
    );
};

export default Sidebar;