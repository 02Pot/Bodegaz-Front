import { Box, Flex, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuFileText } from 'react-icons/lu'

const EmptyState = ({
    icon = <LuFileText size="48" style={{ color: 'fg' }} />,
    title = 'No Data found',
    desc,
}: {
    icon?: ReactNode
    title?: string
    desc?: string
}) => {
    return (
        <Flex gap="8px" p="10px" flexDir="column" alignItems="center">
            <Box p="8px">{icon}</Box>
            <Text
                color="fg"
                fontSize="14px"
                fontFamily="Inter-Medium"
                textAlign="center"
            >
                {title}
            </Text>
            <Text
                color="fg"
                fontSize="14px"
                fontFamily="Inter-Regular"
                textAlign="center"
            >
                {desc}
            </Text>
        </Flex>
    )
}

export default EmptyState
