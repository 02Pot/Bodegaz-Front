import { NotificationsSection } from '@/components/Settings/Notification'
import { PreferencesSection } from '@/components/Settings/Preferences'
import { PrivacySection } from '@/components/Settings/Privacy'
import { BASE_URL } from '@/constant'
import { updateMyProfile, uploadProfilePic } from '@/lib/api/user'
import { authQueryOptions } from '@/lib/context/authContext'
import { useAuth } from '@/lib/hooks/useAuth'
import type { User } from '@/types'
import {
    Avatar,
    Box,
    Button,
    Field,
    Flex,
    HStack,
    IconButton,
    Input,
    InputGroup,
    Separator,
    Stack,
    Tabs,
    Text,
} from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import axios from 'axios'
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
} from 'react'
import { LuCamera, LuEye, LuEyeOff } from 'react-icons/lu'

export const Route = createFileRoute('/_authenticated/settings')({
    component: RouteComponent,
})

const MAX_PHOTO = 5 * 1024 * 1024
const picUrl = (p: string | null | undefined) =>
    p ? `${BASE_URL}${p}` : undefined
const handle = (email: string) => email.split('@')[0]

function RouteComponent() {
    const { currentUser } = useAuth()
    const fallback = currentUser as Partial<User> | undefined

    return (
        <Box maxW="720px" mx="auto" w="100%">
            <Tabs.Root defaultValue="account" lazyMount>
                <Tabs.List mb={4}>
                    <Tabs.Trigger value="account">Account</Tabs.Trigger>
                    <Tabs.Trigger value="notifications">
                        Notifications
                    </Tabs.Trigger>
                    <Tabs.Trigger value="preferences">Preferences</Tabs.Trigger>
                    {/* <Tabs.Trigger value="billing">Billing</Tabs.Trigger> */}
                    <Tabs.Trigger value="privacy">Data & Privacy</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="account">
                    {currentUser ? (
                        <AccountForm
                            key={`${currentUser?.id}:${currentUser.name}:${currentUser.email}:${currentUser.contactNumber}:${currentUser.profilePicture}`}
                            user={currentUser}
                        />
                    ) : (
                        <Flex
                            align="center"
                            gap={4}
                            p={5}
                            borderWidth="1px"
                            rounded="xl"
                            bg="bg.panel"
                        >
                            <Avatar.Root size="xl">
                                <Avatar.Fallback name={fallback?.name} />
                                <Avatar.Image
                                    src={picUrl(fallback?.profilePicture)}
                                />
                            </Avatar.Root>
                            <Box minW={0}>
                                <Text
                                    fontWeight="semibold"
                                    fontSize="lg"
                                    truncate
                                >
                                    {fallback?.name}
                                </Text>
                                <Text color="fg.muted" truncate>
                                    {fallback?.email}
                                </Text>
                            </Box>
                        </Flex>
                    )}
                </Tabs.Content>

                <Tabs.Content value="notifications">
                    <NotificationsSection />
                </Tabs.Content>
                <Tabs.Content value="preferences">
                    <PreferencesSection />
                </Tabs.Content>
                {/* <Tabs.Content value="billing">
                    <BillingSection />
                </Tabs.Content> */}
                <Tabs.Content value="privacy">
                    <PrivacySection />
                </Tabs.Content>
            </Tabs.Root>
        </Box>
    )
}

function AccountForm({ user }: { user: User }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const navigate = useNavigate()
    const fileRef = useRef<HTMLInputElement>(null)

    const [name, setName] = useState(user.name)
    const [email, setEmail] = useState(user.email)
    const [contact, setContact] = useState(user.contactNumber ?? '')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)

    const preview = useMemo(
        () => (file ? URL.createObjectURL(file) : null),
        [file]
    )
    useEffect(
        () => () => {
            if (preview) URL.revokeObjectURL(preview)
        },
        [preview]
    )

    const nameChanged = name.trim() !== user.name
    const emailChanged = email.trim() !== user.email
    const contactChanged = contact.trim() !== (user.contactNumber ?? '')
    const passwordChanged = password.length > 0
    const detailsChanged =
        nameChanged || emailChanged || contactChanged || passwordChanged
    const dirty = detailsChanged || !!file

    const pwTooShort = passwordChanged && password.length < 8
    const pwTooLong = password.length > 72
    const pwMismatch = confirm.length > 0 && password !== confirm
    const pwOk =
        !passwordChanged || (!pwTooShort && !pwTooLong && password === confirm)

    const valid =
        !!name.trim() &&
        name.trim().length <= 100 &&
        /^\S+@\S+\.\S+$/.test(email.trim()) &&
        contact.trim().length <= 30 &&
        pwOk

    const onPick = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        e.target.value = ''
        if (!f) return
        if (!f.type.startsWith('image/'))
            return setFileError('Choose an image file.')
        if (f.size > MAX_PHOTO) return setFileError('Image must be under 5 MB.')
        setFileError(null)
        setFile(f)
    }

    const save = useMutation({
        mutationFn: async () => {
            if (file) await uploadProfilePic(file)
            if (detailsChanged) {
                await updateMyProfile({
                    ...(nameChanged && { name: name.trim() }),
                    ...(emailChanged && { email: email.trim() }),
                    ...(contactChanged && { contactNumber: contact.trim() }),
                    ...(passwordChanged && { password }),
                })
            }
        },
        onSuccess: async () => {
            setPassword('')
            setConfirm('')
            setFile(null)
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: authQueryOptions.queryKey,
                }),
                queryClient.invalidateQueries({ queryKey: ['profile'] }),
                queryClient.invalidateQueries({ queryKey: ['currentUser'] }),
            ])
            const next = handle(email.trim())
            if (next !== handle(user.email)) {
                navigate({
                    to: '/settings',
                    params: { username: next },
                    replace: true,
                })
            } else {
                router.invalidate()
            }
        },
    })

    const reset = () => {
        setName(user.name)
        setEmail(user.email)
        setContact(user.contactNumber ?? '')
        setPassword('')
        setConfirm('')
        setFile(null)
        setFileError(null)
        save.reset()
    }

    const error = save.error
        ? axios.isAxiosError<{ message?: string }>(save.error)
            ? (save.error.response?.data?.message ??
              'Could not save your changes.')
            : 'Could not save your changes.'
        : null

    const onSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (dirty && valid) save.mutate()
    }

    return (
        <Box
            as="form"
            onSubmit={onSubmit}
            borderWidth="1px"
            rounded="xl"
            bg="bg.panel"
            p={{ base: 4, md: 6 }}
        >
            <Stack gap={6}>
                <Flex align="center" gap={4} wrap="wrap">
                    <Box position="relative">
                        <Avatar.Root size="2xl">
                            <Avatar.Fallback name={name || user.name} />
                            <Avatar.Image
                                src={preview ?? picUrl(user.profilePicture)}
                            />
                        </Avatar.Root>
                        <Button
                            type="button"
                            aria-label="Change profile picture"
                            size="xs"
                            rounded="full"
                            position="absolute"
                            bottom={0}
                            right={0}
                            px={0}
                            boxSize={7}
                            onClick={() => fileRef.current?.click()}
                        >
                            <LuCamera />
                        </Button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={onPick}
                        />
                    </Box>
                    <Box>
                        <Text fontWeight="medium">Profile picture</Text>
                        <Text fontSize="sm" color="fg.muted">
                            JPG or PNG, up to 5 MB.
                        </Text>
                        {file && (
                            <Button
                                type="button"
                                size="xs"
                                variant="plain"
                                px={0}
                                onClick={() => setFile(null)}
                            >
                                Remove new photo
                            </Button>
                        )}
                        {fileError && (
                            <Text fontSize="sm" color="fg.error">
                                {fileError}
                            </Text>
                        )}
                    </Box>
                </Flex>

                <Field.Root required>
                    <Field.Label>Name</Field.Label>
                    <Input
                        value={name}
                        maxLength={100}
                        autoComplete="name"
                        onChange={(e) => setName(e.target.value)}
                    />
                </Field.Root>

                <Field.Root required>
                    <Field.Label>Email</Field.Label>
                    <Input
                        type="email"
                        value={email}
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Field.HelperText>
                        You’ll use this email to log in.
                    </Field.HelperText>
                </Field.Root>

                <Field.Root>
                    <Field.Label>Contact number</Field.Label>
                    <Input
                        type="tel"
                        value={contact}
                        maxLength={30}
                        autoComplete="tel"
                        placeholder="09XX XXX XXXX"
                        onChange={(e) => setContact(e.target.value)}
                    />
                </Field.Root>

                <Separator />

                <Box>
                    <Text fontWeight="medium">Change password</Text>
                    <Text fontSize="sm" color="fg.muted">
                        Leave blank to keep your current password.
                    </Text>
                </Box>

                <Field.Root invalid={pwTooShort || pwTooLong}>
                    <Field.Label>New password</Field.Label>
                    <InputGroup
                        endElement={
                            <IconButton
                                type="button"
                                size="xs"
                                variant="ghost"
                                aria-label={
                                    showPw ? 'Hide password' : 'Show password'
                                }
                                onClick={() => setShowPw((s) => !s)}
                                me="-2"
                            >
                                {showPw ? <LuEyeOff /> : <LuEye />}
                            </IconButton>
                        }
                    >
                        <Input
                            type={showPw ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </InputGroup>
                    <Field.ErrorText>
                        {pwTooLong
                            ? 'Password must be 72 characters or fewer.'
                            : 'Password must be at least 8 characters.'}
                    </Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={pwMismatch}>
                    <Field.Label>Confirm new password</Field.Label>
                    <Input
                        type={showPw ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Repeat your new password"
                        value={confirm}
                        disabled={!passwordChanged}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                    <Field.ErrorText>Passwords don’t match.</Field.ErrorText>
                </Field.Root>

                {error && (
                    <Box
                        role="alert"
                        bg="red.subtle"
                        color="red.fg"
                        borderWidth="1px"
                        borderColor="red.muted"
                        rounded="lg"
                        px={3}
                        py={2}
                        fontSize="sm"
                    >
                        {error}
                    </Box>
                )}

                <HStack justify="flex-end" gap={3}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={reset}
                        disabled={!dirty || save.isPending}
                    >
                        Reset
                    </Button>
                    <Button
                        type="submit"
                        loading={save.isPending}
                        disabled={!dirty || !valid}
                    >
                        Save changes
                    </Button>
                </HStack>
            </Stack>
        </Box>
    )
}
