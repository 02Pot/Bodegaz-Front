import {
    Box,
    Flex,
    NativeSelect,
    Stack,
    Switch,
    Text,
    type StackProps,
} from '@chakra-ui/react'
import { type ReactNode } from 'react'

export const Section = ({
    title,
    description,
    children,
    danger,
    ...rest
}: {
    title: string
    description?: string
    children: ReactNode
    danger?: boolean
} & StackProps) => (
    <Stack
        gap={4}
        p={{ base: 4, md: 6 }}
        borderWidth="1px"
        borderColor={danger ? 'red.muted' : undefined}
        rounded="xl"
        bg="bg.panel"
        {...rest}
    >
        <Box>
            <Text fontWeight="semibold" color={danger ? 'red.fg' : undefined}>
                {title}
            </Text>
            {description && (
                <Text fontSize="sm" color="fg.muted">
                    {description}
                </Text>
            )}
        </Box>
        {children}
    </Stack>
)

export const Toggle = ({
    checked,
    onChange,
    label,
}: {
    checked: boolean
    onChange: (v: boolean) => void
    label: string
}) => (
    <Switch.Root checked={checked} onCheckedChange={(e) => onChange(e.checked)}>
        <Switch.HiddenInput aria-label={label} />
        <Switch.Control />
    </Switch.Root>
)

export const Select = ({
    value,
    onChange,
    options,
}: {
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
}) => (
    <NativeSelect.Root>
        <NativeSelect.Field
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
    </NativeSelect.Root>
)

export const Row = ({
    label,
    hint,
    children,
}: {
    label: string
    hint?: string
    children: ReactNode
}) => (
    <Flex
        justify="space-between"
        align={{ base: 'stretch', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        gap={2}
    >
        <Box>
            <Text fontSize="sm" fontWeight="medium">
                {label}
            </Text>
            {hint && (
                <Text fontSize="xs" color="fg.muted">
                    {hint}
                </Text>
            )}
        </Box>
        <Box minW={{ sm: '220px' }}>{children}</Box>
    </Flex>
)
