import { Button, Dialog, Input, Portal, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { LuDownload, LuTrash2 } from 'react-icons/lu'
import { Section } from './SettingsSection'

export const PrivacySection = () => {
    // const [analytics, setAnalytics] = useState(true)
    // const [marketing, setMarketing] = useState(false)
    const [open, setOpen] = useState(false)
    const [confirm, setConfirm] = useState('')

    return (
        <Stack gap={6}>
            <Section
                title="Your data"
                description="Download a copy of your profile, bookings, leases and messages."
            >
                <Button variant="outline" alignSelf="flex-start">
                    <LuDownload /> Export my data
                </Button>
            </Section>

            {/* <Section title="Cookies & tracking">
                <Row
                    label="Analytics cookies"
                    hint="Help us understand how the app is used."
                >
                    <Flex justify={{ sm: 'flex-end' }}>
                        <Toggle
                            label="Analytics cookies"
                            checked={analytics}
                            onChange={setAnalytics}
                        />
                    </Flex>
                </Row>
                <Row
                    label="Marketing cookies"
                    hint="Personalised offers and ads."
                >
                    <Flex justify={{ sm: 'flex-end' }}>
                        <Toggle
                            label="Marketing cookies"
                            checked={marketing}
                            onChange={setMarketing}
                        />
                    </Flex>
                </Row>
            </Section> */}

            <Section
                danger
                title="Danger zone"
                description="Deleting your account permanently removes your profile, warehouses, bookings and messages. This can't be undone."
            >
                <Button
                    colorPalette="red"
                    alignSelf="flex-start"
                    onClick={() => setOpen(true)}
                >
                    <LuTrash2 /> Delete account
                </Button>
            </Section>

            <Dialog.Root
                role="alertdialog"
                open={open}
                onOpenChange={(e) => {
                    setOpen(e.open)
                    if (!e.open) setConfirm('')
                }}
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>
                                    Delete your account?
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Stack gap={3}>
                                    <Text fontSize="sm">
                                        This permanently deletes your account
                                        and all related data. Type <b>DELETE</b>{' '}
                                        to confirm.
                                    </Text>
                                    <Input
                                        value={confirm}
                                        placeholder="DELETE"
                                        onChange={(e) =>
                                            setConfirm(e.target.value)
                                        }
                                    />
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    colorPalette="red"
                                    disabled={confirm !== 'DELETE'}
                                >
                                    Delete account
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </Stack>
    )
}
