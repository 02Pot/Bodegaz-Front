import type { Currency, Units } from '@/constant'
import { usePreferences } from '@/lib/hooks/usePreference'
import { SegmentGroup, Stack } from '@chakra-ui/react'
import { useTheme } from 'next-themes'
import { Row, Section, Select } from './SettingsSection'

export const PreferencesSection = () => {
    const { theme, setTheme } = useTheme()
    // const [language, setLanguage] = useState('en')
    // const [timezone, setTimezone] = useState('Asia/Manila')
    const { currency, setCurrency, units, setUnits } = usePreferences()

    return (
        <Stack gap={6}>
            <Section title="Appearance">
                <Row label="Theme" hint="Light, dark, or match your device.">
                    <SegmentGroup.Root
                        value={theme ?? 'system'}
                        onValueChange={(e) => setTheme(e.value ?? 'system')}
                    >
                        <SegmentGroup.Indicator />
                        <SegmentGroup.Items
                            items={[
                                { value: 'light', label: 'Light' },
                                { value: 'dark', label: 'Dark' },
                                { value: 'system', label: 'System' },
                            ]}
                        />
                    </SegmentGroup.Root>
                </Row>
            </Section>

            <Section title="Region">
                <Stack gap={4}>
                    {/* <Row label="Language">
                        <Select
                            value={language}
                            onChange={setLanguage}
                            options={[
                                { value: 'en', label: 'English' },
                                { value: 'fil', label: 'Filipino' },
                            ]}
                        />
                    </Row> */}
                    {/* <Row label="Timezone">
                        <Select
                            value={timezone}
                            onChange={setTimezone}
                            options={[
                                {
                                    value: 'Asia/Manila',
                                    label: 'Manila (GMT+8)',
                                },
                                {
                                    value: 'Asia/Singapore',
                                    label: 'Singapore (GMT+8)',
                                },
                                { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
                                { value: 'UTC', label: 'UTC' },
                            ]}
                        />
                    </Row> */}
                    <Row label="Currency">
                        <Select
                            value={currency}
                            onChange={(v) => setCurrency(v as Currency)}
                            options={[
                                { value: 'PHP', label: 'Philippine peso (₱)' },
                                { value: 'USD', label: 'US dollar ($)' },
                            ]}
                        />
                    </Row>
                    <Row
                        label="Measurement units"
                        hint="Used for capacity and volume."
                    >
                        <Select
                            value={units}
                            onChange={(v) => setUnits(v as Units)}
                            options={[
                                { value: 'metric', label: 'Metric (kg, m³)' },
                                {
                                    value: 'imperial',
                                    label: 'Imperial (lb, ft³)',
                                },
                            ]}
                        />
                    </Row>
                </Stack>
            </Section>
        </Stack>
    )
}
