import { Box, Collapsible, Flex, Text } from "@chakra-ui/react"
import { useState, type ReactNode } from "react"
import { LuChevronUp } from "react-icons/lu"
import { Tooltip } from "./Ui-kit/Tooltip"

const CollapSibleNavs = ({
    title,
    icon,
    items,
    children,
    defaultOpen = true,
}: {
    defaultOpen?: boolean
    title: string
    icon: ReactNode
    children?: ReactNode
    items: {
        isActive: boolean
        onClick?: VoidFunction
        label: string
        count?: number
        rightElement?: ReactNode
        elementContent?: string
    }[]
}) => {
    const [open, setOpen] = useState<boolean>(defaultOpen)

    return (
        <Box p={{ base: '1rem', md: '20px' }} bg="#fcfcfc" borderRadius="10px" boxShadow="0px 1px 2px -1px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.1)">
            <Collapsible.Root open={open} onOpenChange={(e) => setOpen(e.open)} lazyMount>
                <Collapsible.Trigger w="100%" cursor="pointer">
                    <Flex alignItems="center" justifyContent="space-between" w="100%">
                        <Flex alignItems="center" gap="7px">
                            {icon}
                            <Text color="#101828" fontSize="16px" fontWeight='600' letterSpacing="-0.4px">
                                {title}
                            </Text>
                        </Flex>

                        <LuChevronUp
                            size="20"
                            style={{
                                color: '#99A1AF',
                                transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
                                transition: 'transform 0.2s ease',
                            }}
                        />
                    </Flex>
                </Collapsible.Trigger>
                <Collapsible.Content>
                    <Flex flexDir="column" mt="10px" gap="4px">
                        {items.map((e, i) => {
                            return (
                                <Box
                                    cursor="pointer"
                                    onClick={() => e.onClick?.()}
                                    borderRadius="10px"
                                    bg={e.isActive ? '#CAD4F0' : 'unset'}
                                    p="8px"
                                    transition="all 0.2s ease"
                                    _hover={{ bg: '#CAD4F0' }}
                                    key={i}
                                >
                                    <Flex alignItems="center" gap="4px" maxW={{ base: 'unset', md: '277px' }}>
                                        <Text
                                            flex="1"
                                            fontSize="16px"
                                            fontWeight={`${e.isActive ? 'medium' : 'regular'}`}
                                            letterSpacing="-0.4px"
                                            color={e.isActive ? '#2C2C7C' : '#4A5565'}
                                            overflow="hidden"
                                            textOverflow="ellipsis"
                                            whiteSpace="nowrap"
                                        >
                                            {e.label}
                                        </Text>

                                        {e.rightElement ? (
                                            <Box flexShrink={0}>
                                                <Tooltip
                                                    showArrow
                                                    content={e.elementContent}
                                                    contentProps={{
                                                        background: '#DBEAFE',
                                                        color: '#4E74DE',
                                                    }}
                                                >
                                                    {e.rightElement}
                                                </Tooltip>
                                            </Box>
                                        ) : e.count !== undefined ? (
                                            <Text fontSize="12px" color="#6B7280" flexShrink={0}>
                                                {e.count}
                                            </Text>
                                        ) : null}
                                    </Flex>
                                </Box>
                            )
                        })}
                    </Flex>
                </Collapsible.Content>
            </Collapsible.Root>
            {children}
        </Box>
    )
}

export default CollapSibleNavs;