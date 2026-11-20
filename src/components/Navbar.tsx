import { pageTitles } from '@/constant'
import { getMyWarehouse } from '@/lib/api/warehouse'
import { useAuth } from '@/lib/hooks/useAuth'
import useProfile from '@/lib/hooks/useProfile'
import { qk } from '@/lib/queryKeys'
import {
    Avatar,
    Box,
    Flex,
    IconButton,
    Menu,
    Portal,
    Text,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { LuBell } from 'react-icons/lu'

const EMPTY: never[] = []

const DEFAULT_TITLE = {
    title: 'Warehouse Marketplace',
    subtitle:
        'Browse verified industrial spaces, check real-time availability, and book leases',
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const ACCOUNT_TITLE = {
    title: 'Your Account',
    subtitle: 'Update your details, profile picture, and password.',
}

const isWarehousePath = (pathname: string) => {
    if (pathname.startsWith('/warehouse')) return true
    const [first] = pathname.split('/').filter(Boolean)
    return !!first && UUID.test(first)
}

const getTitle = (pathname: string) => {
    if (pageTitles[pathname]) return pageTitles[pathname]
    if (pathname.endsWith('/lease-agree')) return pageTitles['/lease-agree']
    return isWarehousePath(pathname) ? DEFAULT_TITLE : ACCOUNT_TITLE
}
const Navbar = () => {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const { profile } = useProfile()
    const { logout, currentUser } = useAuth()
    const isSeller = currentUser?.userType === 'SELLER_ROLE'
    const unread = 0

    const { data: warehouses = EMPTY, isLoading } = useQuery({
        queryKey: qk.warehousesAll,
        queryFn: () => getMyWarehouse(),
        staleTime: 1000 * 60 * 5,
        enabled: isSeller,
        retry: false,
    })

    const current = getTitle(pathname)

    const handleLogout = async () => {
        try {
            await logout()
            navigate({ to: '/login', replace: true })
        } catch (err) {
            console.error('Logout failed', err)
        }
    }

    return (
        <Flex
            as="header"
            w="100%"
            pl={{ base: 16, md: 8 }}
            pr={{ base: 4, md: 8 }}
            py={4}
            borderBottom={{
                _light: '1px solid {colors.gray.200}',
                _dark: '1px solid {colors.gray.700}',
            }}
            bg="bg.panel"
            justifyContent="space-between"
            alignItems="center"
            position="sticky"
            top="0"
            zIndex="1000"
        >
            <Flex alignItems="center" gap={3} minW={0} flex={1}>
                <Box minW={0}>
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="bold"
                        lineHeight="1.2"
                        truncate
                    >
                        {current.title}
                    </Text>
                    <Text fontSize="xs" display={{ base: 'none', md: 'block' }}>
                        {current.subtitle}
                    </Text>
                </Box>
            </Flex>

            <Flex alignItems="center" gap={{ base: 2, md: 6 }} flexShrink={0}>
                {isSeller && (
                    <Box
                        as="button"
                        onClick={() => navigate({ to: '/my-rental' })}
                        display={{ base: 'none', md: 'block' }}
                        px={3}
                        py={1.5}
                        borderRadius="xl"
                        bg={warehouses.length > 0 ? 'green.200' : 'gray.200'}
                        transition="background 0.2s"
                    >
                        <Text fontSize="sm" fontWeight="medium">
                            My Warehouses{' '}
                            {isLoading ? '...' : warehouses.length}
                        </Text>
                    </Box>
                )}

                <IconButton
                    position="relative"
                    variant="ghost"
                    aria-label="Notifications"
                    size={{ base: 'md', md: 'lg' }}
                >
                    <LuBell />
                    {unread > 0 && (
                        <Box
                            as="span"
                            position="absolute"
                            top="6px"
                            right="4px"
                            fontSize="0.65rem"
                            bg="red.500"
                            borderRadius="full"
                            minW="16px"
                            h="16px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            px="1"
                        >
                            {unread > 9 ? '9+' : unread}
                        </Box>
                    )}
                </IconButton>

                <Menu.Root positioning={{ placement: 'bottom' }}>
                    <Menu.Trigger rounded="full" focusRing="outside">
                        <Avatar.Root size="sm" border={{ _dark: 'gray.200' }}>
                            <Avatar.Fallback name={currentUser?.name} />
                            <Avatar.Image src={profile} />
                        </Avatar.Root>
                    </Menu.Trigger>
                    <Portal>
                        <Menu.Positioner>
                            <Menu.Content>
                                <Menu.Item
                                    value="account"
                                    disabled={!currentUser}
                                    onClick={() =>
                                        navigate({
                                            to: '/settings',
                                            params: {
                                                username:
                                                    currentUser?.email ?? '',
                                            },
                                        })
                                    }
                                >
                                    Account & Settings
                                </Menu.Item>
                                <Menu.Item
                                    value="logout"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Menu.Item>
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root>
            </Flex>
        </Flex>
    )
}

export default Navbar
