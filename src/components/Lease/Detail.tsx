import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import type { IconType } from 'react-icons'

type Props = {
    icon: IconType
    label: string
    value: string
    sub?: string
}

export function Detail({ icon: Icon, label, value, sub }: Props) {
    return (
        <HStack align="flex-start" gap={3}>
            <Flex
                w={9}
                h={9}
                borderRadius="md"
                bg="bg.muted"
                align="center"
                justify="center"
                flexShrink={0}
            >
                <Icon size={18} />
            </Flex>
            <Box minW={0}>
                <Text fontSize="xs" color="fg.muted">
                    {label}
                </Text>
                <Text fontWeight="semibold" fontSize="sm">
                    {value}
                </Text>
                {sub && (
                    <Text fontSize="xs" color="fg.muted">
                        {sub}
                    </Text>
                )}
            </Box>
        </HStack>
    )
}
