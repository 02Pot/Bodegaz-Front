import { AuthShell } from '@/components/AuthShell'
import { register, sendOtp, verifyOtp } from '@/lib/api/auth'
import { useAuth } from '@/lib/hooks/useAuth'
import type { Step, UserType } from '@/types'
import {
    Box,
    Button,
    Link as ChakraLink,
    Field,
    Flex,
    Heading,
    HStack,
    Input,
    InputGroup,
    Stack,
    Text,
} from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import {
    createFileRoute,
    Link as RouterLink,
    useNavigate,
} from '@tanstack/react-router'
import axios from 'axios'
import { useState, type FormEvent } from 'react'
import {
    LuArrowLeft,
    LuLock,
    LuMail,
    LuPhone,
    LuShoppingBag,
    LuUser,
    LuWarehouse,
} from 'react-icons/lu'

export const Route = createFileRoute('/register')({
    component: RegisterPage,
})

const STEPS: Step[] = ['info', 'otp', 'information']

const TITLES: Record<Step, { title: string; sub: string }> = {
    info: {
        title: 'Create your account',
        sub: 'Start by telling us who you are.',
    },
    otp: {
        title: 'Verify your email',
        sub: 'Enter the code we sent to your email.',
    },
    information: { title: 'Almost done', sub: 'Set up your account details.' },
}

const ROLES: {
    value: UserType
    title: string
    desc: string
    icon: typeof LuWarehouse
}[] = [
    {
        value: 'BUYER_ROLE',
        title: 'I need storage',
        desc: 'Rent warehouse space',
        icon: LuShoppingBag,
    },
    {
        value: 'SELLER_ROLE',
        title: 'I own a warehouse',
        desc: 'List and manage units',
        icon: LuWarehouse,
    },
]

const errMsg = (e: unknown) =>
    axios.isAxiosError<{ message?: string }>(e)
        ? (e.response?.data?.message ?? 'Something went wrong')
        : 'Something went wrong'

function RegisterPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [step, setStep] = useState<Step>('info')
    const [error, setError] = useState<string | null>(null)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [contactNumber, setContactNumber] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [userType, setUserType] = useState<UserType>('')
    const [file, setFile] = useState<File | null>(null)

    const go = (next: Step) => {
        setError(null)
        setStep(next)
    }

    const sendOtpMut = useMutation({
        mutationFn: () => sendOtp(name, email),
        onSuccess: () => go('otp'),
        onError: (e) => setError(errMsg(e)),
    })

    const verifyMut = useMutation({
        mutationFn: () => verifyOtp(email, otp),
        onSuccess: () => go('information'),
        onError: (e) => setError(errMsg(e)),
    })

    const registerMut = useMutation({
        mutationFn: () =>
            register(email, contactNumber, password, userType, file),
        onSuccess: async () => {
            try {
                await login({ email, password })
                navigate({ to: '/' })
            } catch {
                navigate({ to: '/login' })
            }
        },
        onError: (e) => setError(errMsg(e)),
    })

    const mismatch = confirm.length > 0 && password !== confirm

    const canContinue =
        step === 'info'
            ? !!name.trim() && !!email.trim()
            : step === 'otp'
              ? otp.length >= 4
              : !!userType &&
                !!contactNumber &&
                password.length >= 8 &&
                password === confirm

    const busy =
        sendOtpMut.isPending || verifyMut.isPending || registerMut.isPending

    const onSubmit = (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        if (step === 'info') sendOtpMut.mutate()
        else if (step === 'otp') verifyMut.mutate()
        else registerMut.mutate()
    }

    const { title, sub } = TITLES[step]
    const cta =
        step === 'info'
            ? 'Send code'
            : step === 'otp'
              ? 'Verify'
              : 'Create account'

    return (
        <AuthShell imageSide="right" headline="List it. Rent it. Store it.">
            <Box as="form" onSubmit={onSubmit}>
                <Stack gap={6}>
                    <HStack gap={2}>
                        {STEPS.map((s, i) => (
                            <Box
                                key={s}
                                flex="1"
                                h="4px"
                                rounded="full"
                                bg={
                                    i <= STEPS.indexOf(step)
                                        ? 'blue.solid'
                                        : 'bg.emphasized'
                                }
                            />
                        ))}
                    </HStack>

                    <Box>
                        <Heading size="2xl" letterSpacing="-0.01em">
                            {title}
                        </Heading>
                        <Text color="fg.muted" mt={1}>
                            {sub}
                        </Text>
                    </Box>

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

                    {step === 'info' && (
                        <Stack gap={4}>
                            <Field.Root required>
                                <Field.Label>Full name</Field.Label>
                                <InputGroup startElement={<LuUser />}>
                                    <Input
                                        autoComplete="name"
                                        placeholder="Gehrman Sparrow"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                    />
                                </InputGroup>
                            </Field.Root>
                            <Field.Root required>
                                <Field.Label>Email</Field.Label>
                                <InputGroup startElement={<LuMail />}>
                                    <Input
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />
                                </InputGroup>
                            </Field.Root>
                        </Stack>
                    )}

                    {step === 'otp' && (
                        <Stack gap={3}>
                            <Text fontSize="sm" color="fg.muted">
                                Sent to{' '}
                                <Text as="span" fontWeight="medium" color="fg">
                                    {email}
                                </Text>
                            </Text>
                            <Field.Root required>
                                <Field.Label>Verification code</Field.Label>
                                <Input
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    textAlign="center"
                                    fontSize="2xl"
                                    letterSpacing="0.5em"
                                    placeholder="••••••"
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(
                                            e.target.value.replace(/\D/g, '')
                                        )
                                    }
                                />
                            </Field.Root>
                            <Button
                                type="button"
                                variant="plain"
                                size="sm"
                                alignSelf="flex-start"
                                loading={sendOtpMut.isPending}
                                onClick={() => sendOtpMut.mutate()}
                            >
                                Resend code
                            </Button>
                        </Stack>
                    )}

                    {step === 'information' && (
                        <Stack gap={4}>
                            <Field.Root required>
                                <Field.Label>I want to</Field.Label>
                                <HStack gap={3} w="100%" align="stretch">
                                    {ROLES.map(
                                        ({
                                            value,
                                            title,
                                            desc,
                                            icon: Icon,
                                        }) => {
                                            const active = userType === value
                                            return (
                                                <Flex
                                                    key={value}
                                                    as="button"
                                                    role="radio"
                                                    aria-checked={active}
                                                    onClick={() =>
                                                        setUserType(value)
                                                    }
                                                    flex="1"
                                                    direction="column"
                                                    align="flex-start"
                                                    gap={1}
                                                    p={3}
                                                    textAlign="left"
                                                    rounded="lg"
                                                    borderWidth="1px"
                                                    borderColor={
                                                        active
                                                            ? 'blue.solid'
                                                            : 'border'
                                                    }
                                                    bg={
                                                        active
                                                            ? 'blue.subtle'
                                                            : 'transparent'
                                                    }
                                                >
                                                    <Icon size={18} />
                                                    <Text
                                                        fontWeight="semibold"
                                                        fontSize="sm"
                                                    >
                                                        {title}
                                                    </Text>
                                                    <Text
                                                        fontSize="xs"
                                                        color="fg.muted"
                                                    >
                                                        {desc}
                                                    </Text>
                                                </Flex>
                                            )
                                        }
                                    )}
                                </HStack>
                            </Field.Root>

                            <Field.Root required>
                                <Field.Label>Contact number</Field.Label>
                                <InputGroup startElement={<LuPhone />}>
                                    <Input
                                        type="tel"
                                        autoComplete="tel"
                                        placeholder="09XX XXX XXXX"
                                        value={contactNumber}
                                        onChange={(e) =>
                                            setContactNumber(e.target.value)
                                        }
                                    />
                                </InputGroup>
                            </Field.Root>

                            <Field.Root required>
                                <Field.Label>Password</Field.Label>
                                <InputGroup startElement={<LuLock />}>
                                    <Input
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="At least 8 characters"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />
                                </InputGroup>
                            </Field.Root>

                            <Field.Root required invalid={mismatch}>
                                <Field.Label>Confirm password</Field.Label>
                                <InputGroup startElement={<LuLock />}>
                                    <Input
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Repeat your password"
                                        value={confirm}
                                        onChange={(e) =>
                                            setConfirm(e.target.value)
                                        }
                                    />
                                </InputGroup>
                                <Field.ErrorText>
                                    Passwords don’t match.
                                </Field.ErrorText>
                            </Field.Root>

                            <Field.Root>
                                <Field.Label>
                                    Profile photo{' '}
                                    <Text as="span" color="fg.muted">
                                        (optional)
                                    </Text>
                                </Field.Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    p={1}
                                    onChange={(e) =>
                                        setFile(e.target.files?.[0] ?? null)
                                    }
                                />
                            </Field.Root>
                        </Stack>
                    )}

                    <Stack gap={3}>
                        <Button
                            type="submit"
                            size="lg"
                            loading={busy}
                            disabled={!canContinue}
                        >
                            {cta}
                        </Button>
                        {step !== 'info' && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                    go(step === 'otp' ? 'info' : 'otp')
                                }
                            >
                                <LuArrowLeft /> Back
                            </Button>
                        )}
                    </Stack>

                    <Text fontSize="sm" color="fg.muted" textAlign="center">
                        Already have an account?{' '}
                        <ChakraLink asChild fontWeight="semibold" color="fg">
                            <RouterLink to="/login" viewTransition>
                                Log in
                            </RouterLink>
                        </ChakraLink>
                    </Text>
                </Stack>
            </Box>
        </AuthShell>
    )
}
