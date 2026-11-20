import { Box, Button, Flex, HStack, Stack, Table } from '@chakra-ui/react'
import { useState } from 'react'
import { Section, Select, Toggle } from './SettingsSection'

const EVENTS = [
    { key: 'messages', label: 'New messages' },
    { key: 'bookings', label: 'Booking updates' },
    { key: 'leases', label: 'Lease & signing' },
]
const CHANNELS = ['email'] as const
const CHANNEL_LABEL = { email: 'Email' }

//CHANNELS ADD SMS AND INAPP

export const NotificationsSection = () => {
    const [prefs, setPrefs] = useState<
        Record<string, Record<(typeof CHANNELS)[number], boolean>>
    >(
        Object.fromEntries(
            EVENTS.map((e) => [e.key, { email: true, sms: false, inApp: true }])
        )
    )
    const [frequency, setFrequency] = useState('instant')

    const set = (k: string, c: (typeof CHANNELS)[number], v: boolean) =>
        setPrefs((p) => ({ ...p, [k]: { ...p[k], [c]: v } }))

    return (
        <Stack gap={6}>
            <Section
                title="Notifications"
                description="Choose where you want to be notified."
            >
                <Box overflowX="auto">
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>
                                    Activity
                                </Table.ColumnHeader>
                                {CHANNELS.map((c) => (
                                    <Table.ColumnHeader
                                        key={c}
                                        textAlign="center"
                                    >
                                        {CHANNEL_LABEL[c]}
                                    </Table.ColumnHeader>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {EVENTS.map((e) => (
                                <Table.Row key={e.key}>
                                    <Table.Cell>{e.label}</Table.Cell>
                                    {CHANNELS.map((c) => (
                                        <Table.Cell key={c}>
                                            <Flex justify="center">
                                                <Toggle
                                                    label={`${e.label} by ${CHANNEL_LABEL[c]}`}
                                                    checked={prefs[e.key][c]}
                                                    onChange={(v) =>
                                                        set(e.key, c, v)
                                                    }
                                                />
                                            </Flex>
                                        </Table.Cell>
                                    ))}
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Box>
            </Section>

            <Section
                title="Frequency"
                description="How often should we send email notifications?"
            >
                <Select
                    value={frequency}
                    onChange={setFrequency}
                    options={[
                        { value: 'instant', label: 'Instant' },
                        { value: 'daily', label: 'Daily digest' },
                        { value: 'off', label: 'Off' },
                    ]}
                />
            </Section>

            <HStack justify="flex-end">
                <Button>Save notifications</Button>
            </HStack>
        </Stack>
    )
}
