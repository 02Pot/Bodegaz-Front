import {
    Badge,
    Box,
    Button,
    Flex,
    HStack,
    Stack,
    Table,
    Text,
} from '@chakra-ui/react'
import { LuCreditCard, LuDownload } from 'react-icons/lu'
import { Section } from './SettingsSection'

const INVOICES = [
    {
        id: 'INV-1003',
        date: 'Nov 1, 2026',
        amount: '₱1,499.00',
        status: 'Paid',
    },
    {
        id: 'INV-0987',
        date: 'Oct 1, 2026',
        amount: '₱1,499.00',
        status: 'Paid',
    },
    {
        id: 'INV-0951',
        date: 'Sep 1, 2026',
        amount: '₱1,499.00',
        status: 'Paid',
    },
]

export const BillingSection = () => (
    <Stack gap={6}>
        <Section title="Current plan">
            <Flex
                justify="space-between"
                align={{ base: 'flex-start', sm: 'center' }}
                direction={{ base: 'column', sm: 'row' }}
                gap={3}
            >
                <Box>
                    <HStack>
                        <Text fontSize="lg" fontWeight="semibold">
                            Pro
                        </Text>
                        <Badge colorPalette="green">Active</Badge>
                    </HStack>
                    <Text fontSize="sm" color="fg.muted">
                        ₱1,499.00 / month · renews Dec 1, 2026
                    </Text>
                </Box>
                <HStack>
                    <Button variant="outline" size="sm">
                        Downgrade
                    </Button>
                    <Button size="sm">Upgrade</Button>
                </HStack>
            </Flex>
            <Button
                variant="plain"
                colorPalette="red"
                size="sm"
                alignSelf="flex-start"
                px={0}
            >
                Cancel subscription
            </Button>
        </Section>

        <Section title="Payment method">
            <Flex justify="space-between" align="center" gap={3}>
                <HStack gap={3}>
                    <LuCreditCard size={20} />
                    <Box>
                        <Text fontSize="sm" fontWeight="medium">
                            Visa ending in 4242
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                            Expires 08/28
                        </Text>
                    </Box>
                </HStack>
                <Button variant="outline" size="sm">
                    Update
                </Button>
            </Flex>
        </Section>

        <Section title="Billing history">
            <Box overflowX="auto">
                <Table.Root size="sm">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Invoice</Table.ColumnHeader>
                            <Table.ColumnHeader>Date</Table.ColumnHeader>
                            <Table.ColumnHeader>Amount</Table.ColumnHeader>
                            <Table.ColumnHeader>Status</Table.ColumnHeader>
                            <Table.ColumnHeader />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {INVOICES.map((i) => (
                            <Table.Row key={i.id}>
                                <Table.Cell>{i.id}</Table.Cell>
                                <Table.Cell>{i.date}</Table.Cell>
                                <Table.Cell>{i.amount}</Table.Cell>
                                <Table.Cell>
                                    <Badge colorPalette="green">
                                        {i.status}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell textAlign="end">
                                    <Button variant="ghost" size="xs">
                                        <LuDownload /> PDF
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Box>
        </Section>
    </Stack>
)
