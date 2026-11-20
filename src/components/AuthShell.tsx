import { Box, Flex, Heading, HStack, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import {
    LuCalendarCheck,
    LuMapPin,
    LuShieldCheck,
    LuWarehouse,
} from 'react-icons/lu'

const HERO =
    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=80'

const overlay = (a: number, b: number) =>
    `linear-gradient(to top, rgba(8,12,28,${a}), rgba(8,12,28,${b})), url(${HERO})`

const PERKS = [
    { icon: LuMapPin, text: 'Browse verified industrial spaces near you' },
    {
        icon: LuCalendarCheck,
        text: 'Check live availability and book in minutes',
    },
    { icon: LuShieldCheck, text: 'Signed digital leases, all in one place' },
]

export function Brand({ light = false }: { light?: boolean }) {
    return (
        <HStack gap={2} color={light ? 'white' : 'fg'}>
            <Flex
                boxSize={9}
                rounded="lg"
                bg="blue.solid"
                color="white"
                align="center"
                justify="center"
            >
                <LuWarehouse size={18} />
            </Flex>
            <Text fontWeight="bold" fontSize="lg" letterSpacing="-0.01em">
                Bodegaz
            </Text>
        </HStack>
    )
}

export function AuthShell({
    imageSide = 'left',
    headline,
    children,
}: {
    imageSide?: 'left' | 'right'
    headline: string
    children: ReactNode
}) {
    return (
        <Flex
            minH="100dvh"
            bg="bg"
            flexDir={{
                base: 'column',
                lg: imageSide === 'right' ? 'row' : 'row-reverse',
            }}
        >
            <Flex
                flex="1"
                direction="column"
                maxW={{ lg: '600px' }}
                w="100%"
                mx="auto"
                style={{ viewTransitionName: 'auth-form' }}
            >
                <Flex
                    display={{ base: 'flex', lg: 'none' }}
                    h="150px"
                    align="flex-end"
                    p={5}
                    bg="gray.900"
                    bgImage={overlay(0.85, 0.2)}
                    bgSize="cover"
                    bgPos="center"
                    style={{ viewTransitionName: 'auth-hero' }}
                >
                    <Brand light />
                </Flex>
                <Flex
                    flex="1"
                    align="center"
                    justify="center"
                    p={{ base: 6, md: 10 }}
                >
                    <Box w="100%" maxW="400px">
                        {children}
                    </Box>
                </Flex>
            </Flex>

            <Flex
                display={{ base: 'none', lg: 'flex' }}
                flex="1"
                direction="column"
                justify="space-between"
                p={12}
                color="white"
                bg="gray.900"
                bgImage={overlay(0.9, 0.35)}
                bgSize="cover"
                bgPos="center"
            >
                <Brand light />
                <Stack gap={8} maxW="480px">
                    <Heading
                        size="4xl"
                        lineHeight="1.1"
                        letterSpacing="-0.02em"
                    >
                        {headline}
                    </Heading>
                    <Stack gap={4}>
                        {PERKS.map(({ icon: Icon, text }) => (
                            <HStack key={text} gap={3}>
                                <Flex
                                    boxSize={8}
                                    rounded="full"
                                    bg="whiteAlpha.200"
                                    align="center"
                                    justify="center"
                                    flexShrink={0}
                                >
                                    <Icon size={16} />
                                </Flex>
                                <Text color="whiteAlpha.900">{text}</Text>
                            </HStack>
                        ))}
                    </Stack>
                </Stack>
                <Text fontSize="sm" color="whiteAlpha.700">
                    © {new Date().getFullYear()} Bodegaz. All rights reserved.
                </Text>
            </Flex>
        </Flex>
    )
}
