import { Box, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";

type Props = {
    icon: IconType
    title: string
    children: ReactNode
}

export function Panel({icon: Icon, title, children,}: Props) {
    return (
        <Box borderWidth="1px" borderRadius="lg" p={4}>
            <HStack gap={3} mb={3}>
                <Flex w={9} h={9} borderRadius="md" bg="bg.muted" align="center" justify="center">
                <Icon size={18} />
                </Flex>
                <Text fontWeight="semibold">{title}</Text>
            </HStack>
            <Stack gap={1}>{children}</Stack>
        </Box>
    )
}