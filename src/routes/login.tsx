import { AuthShell } from '@/components/AuthShell'
import { useAuth } from '@/lib/hooks/useAuth'
import {
    Box,
    Button,
    Link as ChakraLink,
    Field,
    Heading,
    IconButton,
    Input,
    InputGroup,
    Stack,
    Text,
} from '@chakra-ui/react'
import {
    createFileRoute,
    Link as RouterLink,
    useNavigate,
} from '@tanstack/react-router'
import { useState, type SubmitEvent } from 'react'
import { LuEye, LuEyeOff, LuLock, LuMail } from 'react-icons/lu'

export const Route = createFileRoute('/login')({
    component: LoginPage,
})

function LoginPage() {
    const { login, loginError, isLoggingIn } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [show, setShow] = useState(false)

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        try {
            await login({ email, password })
            navigate({ to: '/' })
        } catch {
            // loginError is set by AuthProvider
        }
    }

    return (
        <AuthShell imageSide="left" headline="Find the space your goods need.">
            <Box as="form" onSubmit={onSubmit}>
                <Stack gap={6}>
                    <Box>
                        <Heading size="2xl" letterSpacing="-0.01em">
                            Welcome back
                        </Heading>
                        <Text color="fg.muted" mt={1}>
                            Log in to manage your rentals and warehouses.
                        </Text>
                    </Box>

                    {loginError && (
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
                            {loginError}
                        </Box>
                    )}

                    <Stack gap={4}>
                        <Field.Root required>
                            <Field.Label>Email</Field.Label>
                            <InputGroup startElement={<LuMail />}>
                                <Input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </InputGroup>
                        </Field.Root>

                        <Field.Root required>
                            <Field.Label>Password</Field.Label>
                            <InputGroup
                                startElement={<LuLock />}
                                endElement={
                                    <IconButton
                                        type="button"
                                        size="xs"
                                        variant="ghost"
                                        aria-label={
                                            show
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        onClick={() => setShow((s) => !s)}
                                        me="-2"
                                    >
                                        {show ? <LuEyeOff /> : <LuEye />}
                                    </IconButton>
                                }
                            >
                                <Input
                                    type={show ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </InputGroup>
                        </Field.Root>
                    </Stack>

                    <Button
                        type="submit"
                        size="lg"
                        loading={isLoggingIn}
                        disabled={!email || !password}
                    >
                        Log in
                    </Button>

                    <Text fontSize="sm" color="fg.muted" textAlign="center">
                        New to Bodegaz?{' '}
                        <ChakraLink asChild fontWeight="semibold" color="fg">
                            <RouterLink to="/register" viewTransition>
                                Create an account
                            </RouterLink>
                        </ChakraLink>
                    </Text>
                </Stack>
            </Box>
        </AuthShell>
    )
}
