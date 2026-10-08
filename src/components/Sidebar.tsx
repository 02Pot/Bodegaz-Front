import { newestWarehouses, trendingWarehouses } from '@/lib/api/warehouse';
import { useAuth } from '@/lib/provider';
import type { WarehouseInterface } from '@/types';
import { Drawer, Flex, IconButton, Portal, Text, VStack } from '@chakra-ui/react';
import { useNavigate, type LinkProps } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { LuFileText, LuHeadset, LuHeart, LuHouse, LuMenu, LuSearch, LuSettings, LuSparkles } from 'react-icons/lu';
import { MdLeaderboard, MdTrendingUp } from 'react-icons/md';
import CollapsableNav from './CollapsableNav';
import EmptyState from './EmptyState';

const navItems: {
    label: string;
    link: LinkProps['to'];
    icon: IconType;
    sellerOnly?: boolean;
}[] = [
    { label: 'Find Rentals', link: '/', icon: LuSearch },
    { label: 'My Rentals', link: '/my-rental', icon: LuHouse, sellerOnly: true },
    { label: 'Saved Warehouses', link: '/saved-rental', icon: LuHeart },
    { label: 'Lease Agreements', link: '/lease-agree', icon: LuFileText },
    { label: 'Support & Inquiries', link: '/supp-inq', icon: LuHeadset },
];
const Sidebar = () => {
    const navigate = useNavigate();
    const {currentUser} = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [trending,setTrending] = useState<WarehouseInterface[]>();
    const [newest,setNewest] = useState<WarehouseInterface[]>();

    const [active, setActive] = useState('Find Rentals');
    const [isOpen, setIsOpen] = useState(false);

    const isSeller = currentUser?.userType === 'SELLER_ROLE';
    const visibleItems = navItems.filter((item) => !item.sellerOnly || isSeller);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const trending = await trendingWarehouses(3)
                const newest = await newestWarehouses(3)
                setNewest(newest?.content || [])
                setTrending(trending?.content || [])
            } catch (err) {
                console.error('Failed to fetch board', err)
            }
        }
        fetchTrending()
    },[])

    const handleNav = (path: LinkProps['to']) => {
        navigate({ to: path });
        setIsOpen(false);
    };

    const sidebarContent = (
        <Flex flexDir="column" h="100%" px={3} py={6} bg='#f3f3f3' w='100%'>
            <Flex alignItems="center" gap={2.5} px={3} pb={6} borderBottom="1px solid" borderColor="gray.200">
                {/* <Flex bg="blue.600" color="white" p={2} borderRadius="lg" alignItems="center" justifyContent="center">
                    <LuBuilding2 size={18} />
                </Flex> */}
                <Text fontSize="md" fontWeight="bold" color='#111111'>
                    Bodegaz
                </Text>
            </Flex>

            <VStack align="stretch" gap={1} py="3" borderBottom="1px solid" borderColor="gray.200" >
                {visibleItems.map(({ label,link, icon: Icon }) => {
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
                            color={isActive ? '#02c9e0' : '#111111'}
                            fontWeight={isActive ? 'semibold' : 'medium'}
                            borderLeft="3px solid"
                            borderLeftColor={isActive ? '#02c9e0' : 'transparent'}
                            _hover={{ bg: isActive ? '#0f0708' : '#aabde4' }}
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
                    items={
                    newest?.length ? (
                        trending?.map((t) => ({
                            isActive: false,
                            label: t.name,
                            onClick: () => handleNav('/')
                        }))
                    ) : (
                        <EmptyState icon={<MdTrendingUp color="C6D2FF" size='48'/>} title={'No popular warehouse'}/>
                    )
                }
                />

                <CollapsableNav
                    title="Newly Added"
                    icon={<LuSparkles />}
                    items={
                        newest?.length ? (
                            newest?.map((n) => ({
                                isActive: false,
                                label: n.name,
                                onClick: () => handleNav('/')
                            }))
                        ) : (
                            <EmptyState icon={<LuSparkles color="C6D2FF" size='48'/>} title={'No new additions'}/>
                        )
                    }
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
                color={active === 'Settings' ? '#02c9e0' : '#111111'}
                fontWeight={active === 'Settings' ? 'semibold' : 'medium'}
                _hover={{ bg: active === 'Settings' ? '#0f0708' : '#aabde4' }}
                transition="background 0.15s, color 0.15s"
                textAlign="left"
                w="full"
            >
                <LuSettings size={18}  />
                <Text fontSize="sm" > Settings</Text>
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