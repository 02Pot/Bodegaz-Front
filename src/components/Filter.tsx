import { Badge, Box, Button, HStack, Input, Popover, Portal, Stack, Text } from '@chakra-ui/react';
import { useState, type ReactNode } from 'react';
import { LuFilter } from 'react-icons/lu';

export type Range = { min: string; max: string }

export type Filters = {
    capacity: string
    city: string
    area: Range
    budget: Range
    sortOrder: 'newest' | 'oldest' | ''
    customDate: string
}

export const emptyFilters: Filters = {
    capacity: '',
    city: '',
    area: { min: '', max: '' },
    budget: { min: '', max: '' },
    sortOrder: '',
    customDate: '',
}

const CAPACITIES = [
    { value: '1000', label: 'Up to 1,000 kg' },
    { value: '5000', label: '1,000 - 5,000 kg' },
    { value: '10000', label: '5,000+ kg' },
]
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami']
const AREA_PRESETS = [
    { label: 'Under 50 m²', min: '', max: '50' },
    { label: '50 - 150 m²', min: '50', max: '150' },
    { label: '150+ m²', min: '150', max: '' },
]
const BUDGET_PRESETS = [
    { label: 'Under 1,000', min: '', max: '1000' },
    { label: '1,000 - 5,000', min: '1000', max: '5000' },
    { label: '5,000+', min: '5000', max: '' },
]

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => (
    <Button size="xs" variant={active ? 'solid' : 'outline'} onClick={onClick}>
        {children}
    </Button>
)

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <Box>
        <Text fontSize="xs" fontWeight="bold" color="fg.muted" mb="2">
        {title}
        </Text>
        {children}
    </Box>
)

const RangeSection = ({
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
            {presets.map((p) => (
            <Chip
                key={p.label}
                active={value.min === p.min && value.max === p.max}
                onClick={() =>
                value.min === p.min && value.max === p.max
                    ? onChange({ min: '', max: '' })
                    : onChange({ min: p.min, max: p.max })
                }
            >
                {p.label}
            </Chip>
            ))}
        </HStack>
        <HStack gap="2">
            <Input type="number" placeholder="Min" size="sm" value={value.min}
            onChange={(e) => onChange({ ...value, min: e.target.value })} />
            <Text fontSize="xs" color="fg.muted">-</Text>
            <Input type="number" placeholder="Max" size="sm" value={value.max}
            onChange={(e) => onChange({ ...value, max: e.target.value })} />
        </HStack>
        </Stack>
    </Section>
)

const countActive = (f: Filters) =>
    [
        f.capacity,
        f.city,
        f.area.min || f.area.max,
        f.budget.min || f.budget.max,
        f.sortOrder || f.customDate,
    ].filter(Boolean).length

export const FilterMenu = ({
    onApply,
    initial = emptyFilters,
}: {
    onApply?: (filters: Filters) => void
    initial?: Filters
}) => {
    const [open, setOpen] = useState(false)
    const [applied, setApplied] = useState<Filters>(initial)
    const [draft, setDraft] = useState<Filters>(initial)

    const set = <K extends keyof Filters>(key: K, val: Filters[K]) =>
        setDraft((d) => ({ ...d, [key]: val }))

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) setDraft(applied) // discard unapplied edits when reopening
        setOpen(isOpen)
    }

    const apply = () => {
        setApplied(draft)
        onApply?.(draft)
        setOpen(false)
    }

    const reset = () => {
        setDraft(emptyFilters)
        setApplied(emptyFilters)
        onApply?.(emptyFilters)
    }

    const activeCount = countActive(applied)

    return (
        <Popover.Root open={open} onOpenChange={(e) => handleOpenChange(e.open)} positioning={{ placement: 'bottom-start' }}>
        <Popover.Trigger asChild>
            <Button variant="outline" size="sm" gap="8px" borderWidth="1px">
            <LuFilter />
            Filters
            {activeCount > 0 && <Badge colorPalette="blue">{activeCount}</Badge>}
            </Button>
        </Popover.Trigger>
        <Portal>
            <Popover.Positioner>
            <Popover.Content w="340px">
                <Popover.Body maxH="70vh" overflowY="auto">
                <Stack gap="5">
                    <Section title="Capacity">
                    <HStack gap="2" wrap="wrap">
                        {CAPACITIES.map((c) => (
                        <Chip key={c.value} active={draft.capacity === c.value}
                            onClick={() => set('capacity', draft.capacity === c.value ? '' : c.value)}>
                            {c.label}
                        </Chip>
                        ))}
                    </HStack>
                    </Section>

                    <Section title="City">
                    <HStack gap="2" wrap="wrap">
                        {CITIES.map((c) => (
                        <Chip key={c} active={draft.city === c}
                            onClick={() => set('city', draft.city === c ? '' : c)}>
                            {c}
                        </Chip>
                        ))}
                    </HStack>
                    </Section>

                    <RangeSection title="Area (m²)" presets={AREA_PRESETS}
                    value={draft.area} onChange={(v) => set('area', v)} />

                    <RangeSection title="Budget ($)" presets={BUDGET_PRESETS}
                    value={draft.budget} onChange={(v) => set('budget', v)} />

                    <Section title="Created">
                    <Stack gap="2">
                        <HStack gap="2">
                        {(['newest', 'oldest'] as const).map((order) => (
                            <Chip key={order} active={draft.sortOrder === order}
                            onClick={() =>
                                setDraft((d) => ({
                                ...d,
                                sortOrder: d.sortOrder === order ? '' : order,
                                customDate: '', // sort and exact date are mutually exclusive
                                }))
                            }>
                            {order === 'newest' ? 'Newest first' : 'Oldest first'}
                            </Chip>
                        ))}
                        </HStack>
                        <Input type="date" size="sm" value={draft.customDate}
                        onChange={(e) =>
                            setDraft((d) => ({ ...d, customDate: e.target.value, sortOrder: '' }))
                        } />
                    </Stack>
                    </Section>

                    <HStack justify="space-between" pt="2" borderTopWidth="1px" borderColor="border.subtle">
                    <Button size="sm" variant="ghost" colorPalette="red" onClick={reset}>
                        Reset all
                    </Button>
                    <Button size="sm" onClick={apply}>Apply</Button>
                    </HStack>
                </Stack>
                </Popover.Body>
            </Popover.Content>
            </Popover.Positioner>
        </Portal>
        </Popover.Root>
    )
}