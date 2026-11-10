import type { Range } from '@/types'
import { Box, Button, HStack, Input, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export const Chip = ({
    active,
    onClick,
    children,
}: {
    active: boolean
    onClick: () => void
    children: ReactNode
}) => (
    <Button size="xs" variant={active ? 'solid' : 'outline'} onClick={onClick}>
        {children}
    </Button>
)

export const Section = ({
    title,
    children,
}: {
    title: string
    children: ReactNode
}) => (
    <Box>
        <Text fontSize="xs" fontWeight="bold" color="fg.muted" mb="2">
            {title}
        </Text>
        {children}
    </Box>
)

export const RangeSection = ({
    title,
    presets,
    value,
    onChange,
}: {
    title: string
    presets: { label: string; min: string; max: string }[]
    value: Range
    onChange: (v: Range) => void
}) => (
    <Section title={title}>
        <Stack gap="2">
            <HStack gap="2" wrap="wrap">
                {presets.map((p) => {
                    const active = value.min === p.min && value.max === p.max
                    return (
                        <Chip
                            key={p.label}
                            active={active}
                            onClick={() =>
                                onChange(
                                    active
                                        ? { min: '', max: '' }
                                        : { min: p.min, max: p.max }
                                )
                            }
                        >
                            {p.label}
                        </Chip>
                    )
                })}
            </HStack>
            <HStack gap="2">
                <Input
                    type="number"
                    placeholder="Min"
                    size="sm"
                    value={value.min}
                    onChange={(e) =>
                        onChange({ ...value, min: e.target.value })
                    }
                />
                <Text fontSize="xs" color="fg.muted">
                    -
                </Text>
                <Input
                    type="number"
                    placeholder="Max"
                    size="sm"
                    value={value.max}
                    onChange={(e) =>
                        onChange({ ...value, max: e.target.value })
                    }
                />
            </HStack>
        </Stack>
    </Section>
)
