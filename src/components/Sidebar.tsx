import { newestWarehouses, trendingWarehouses } from '@/lib/api/warehouse'
import { useAuth } from '@/lib/hooks/useAuth'
import type { WarehouseResponse } from '@/types'
import {
    Drawer,
    Flex,
    IconButton,
    Portal,
    Text,
    VStack,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import {
    useNavigate,
    useRouterState,
    type LinkProps,
} from '@tanstack/react-router'
import { useState } from 'react'
import type { IconType } from 'react-icons'
import {
    LuHeadset,
    LuHeart,
    LuHouse,
    LuMenu,
    LuMessageCircle,
    LuSearch,
    LuSettings,
    LuSparkles,
} from 'react-icons/lu'
import { MdLeaderboard, MdTrendingUp } from 'react-icons/md'
import CollapsableNav from './CollapsableNav'
import EmptyState from './EmptyState'

const navItems: {
    label: string
    link: LinkProps['to']
    icon: IconType
    sellerOnly?: boolean
}[] = [
    { label: 'Find Rentals', link: '/', icon: LuSearch },
    { label: 'My Rentals', link: '/my-rental', icon: LuHouse },
    { label: 'Messages', link: '/messages', icon: LuMessageCircle },
    { label: 'Saved Warehouses', link: '/saved-rental', icon: LuHeart },
    { label: 'Support & Inquiries', link: '/supp-inq', icon: LuHeadset },
]

const listQuery = (
    key: string,
    fn: (size: number) => Promise<{ content?: WarehouseResponse[] }>
) => ({
    queryKey: ['sidebar', key],
    queryFn: () => fn(3),
    select: (r: { content?: WarehouseResponse[] }) => r?.content ?? [],
    staleTime: 1000 * 60 * 5,
    retry: false,
})

const Sidebar = () => {
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const currentPath = useRouterState().location.pathname
    const [isOpen, setIsOpen] = useState(false)

    const activeItem = navItems.find(
        (item) =>
            item.link !== '/' && currentPath.startsWith(item.link as string)
    )
    const active =
        currentPath === '/settings'
            ? 'Settings'
            : (activeItem?.label ?? 'Find Rentals')

    const { data: trending } = useQuery(
        listQuery('trending', trendingWarehouses)
    )
    const { data: newest } = useQuery(listQuery('newest', newestWarehouses))

    const isSeller = currentUser?.userType === 'SELLER_ROLE'
    const visibleItems = navItems.filter((item) => !item.sellerOnly || isSeller)

    const toItems = (list: WarehouseResponse[]) =>
        list.map((w) => ({
            isActive: false,
            label: w.name,
            onClick: () => {
                navigate({
                    to: '/warehouse/$warehouseId',
                    params: { warehouseId: w.warehouseId },
                })
                setIsOpen(false)
            },
        }))

    const sidebarContent = (
        <Flex flexDir="column" h="100%" px={3} py={6} w="100%" bg="bg.panel">
            <Flex
                alignItems="center"
                gap={2.5}
                px={3}
                pb={6}
                borderBottom="1px solid"
                borderColor="border"
            >
                <Text fontSize="md" fontWeight="bold">
                    Bodegaz
                </Text>
            </Flex>

            <VStack
                align="stretch"
                gap={1}
                py="3"
                borderBottom="1px solid"
                borderColor="border"
            >
                {visibleItems.map(({ label, link, icon: Icon }) => {
                    const isActive = active === label
                    return (
                        <Flex
                            key={label}
                            as="button"
                            onClick={() => {
                                navigate({ to: link })
                                setIsOpen(false)
                            }}
                            alignItems="center"
                            gap={3}
                            px={3}
                            py={2.5}
                            borderRadius="md"
                            cursor="pointer"
                            bg={isActive ? 'fg' : 'transparent'}
                            color={isActive ? 'bg' : 'fg'}
                            fontWeight={isActive ? 'semibold' : 'medium'}
                            borderLeft="3px solid"
                            borderLeftColor={
                                isActive ? '#02c9e0' : 'transparent'
                            }
                            _hover={{ bg: isActive ? 'fg.muted' : 'bg.muted' }}
                            transition="background 0.15s, color 0.15s"
                            textAlign="left"
                            w="full"
                        >
                            <Icon size={18} />
                            <Text fontSize="sm">{label}</Text>
                        </Flex>
                    )
                })}
            </VStack>

            <VStack align="stretch" gap={1} py={3}>
                <CollapsableNav
                    title="Top by Views"
                    icon={<MdLeaderboard />}
                    items={
                        trending?.length ? (
                            toItems(trending)
                        ) : (
                            <EmptyState
                                icon={<MdTrendingUp color="fg" size="48" />}
                                title="No popular warehouse"
                            />
                        )
                    }
                />

                <CollapsableNav
                    title="Newly Added"
                    icon={<LuSparkles />}
                    items={
                        newest?.length ? (
                            toItems(newest)
                        ) : (
                            <EmptyState
                                icon={<LuSparkles color="fg" size="48" />}
                                title="No new additions"
                            />
                        )
                    }
                />
            </VStack>

            <Flex
                as="button"
                borderTop="1px solid"
                borderColor="border"
                onClick={() => {
                    navigate({ to: '/settings' })
                    setIsOpen(false)
                }}
                alignItems="center"
                gap={3}
                px={3}
                py={2.5}
                mt="auto"
                borderRadius="md"
                cursor="pointer"
                bg={active === 'Settings' ? 'fg' : 'transparent'}
                color={active === 'Settings' ? 'bg' : 'fg'}
                fontWeight={active === 'Settings' ? 'semibold' : 'medium'}
                _hover={{ bg: active === 'Settings' ? 'fg.muted' : 'bg.muted' }}
                transition="background 0.15s, color 0.15s"
                textAlign="left"
                w="full"
            >
                <LuSettings size={18} />
                <Text fontSize="sm">Settings</Text>
            </Flex>
        </Flex>
    )

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
            >
                <LuMenu />
            </IconButton>

            <Flex
                as="nav"
                display={{ base: 'none', md: 'flex' }}
                w="240px"
                borderRight="1px solid"
                borderColor="border"
                h="100%"
            >
                {sidebarContent}
            </Flex>

            <Drawer.Root
                open={isOpen}
                onOpenChange={(e) => setIsOpen(e.open)}
                placement="start"
            >
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
    )
}

export default Sidebar
