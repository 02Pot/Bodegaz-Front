import { authQueryOptions, useAuth } from '@/lib/provider';
import type { LoginRequest } from '@/types';
import { Box, Button, Field, Flex, Input, InputGroup, Stack, Text } from '@chakra-ui/react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { LuEye, LuUser } from 'react-icons/lu';

export const Route = createFileRoute('/login')({
    beforeLoad: async ({ context }) => {
        const user = await context.queryClient.query(authQueryOptions);
        if (user) throw redirect({ to: "/"});
    },
    component: Login,
})

function Login() {
    const { login, loginError, isLoggingIn } = useAuth()
    const navigate = useNavigate();
    const [data, setData] = useState<LoginRequest>({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const update = (fields: Partial<LoginRequest>) =>
        setData((prev) => ({ ...prev, ...fields }));

    const handleSubmit = async () => {
        if(!data.email) {
            setError('Please enter email')
            return;
        }
        if (data.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        setLoading(true);
        try {
            await login(data)
            navigate({ to: "/" });
        } catch {
            setError("Login failed. Try again.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Box maxW="600px" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg">
            <Stack gap={4}>
                <Field.Root>
                    <Field.Label>Email</Field.Label>
                    <InputGroup startElement={<LuUser/>}>
                    <Input
                        type="email"
                        value={data.email}
                        onChange={(e) => update({ email: e.target.value })}
                        placeholder="Enter your email"
                    />
                    </InputGroup>
                </Field.Root>

                <Field.Root>
                    <Field.Label>Password</Field.Label>
                    <InputGroup startElement={<LuEye/>}>
                        <Input
                        type="password"
                        value={data.password}
                        onChange={(e) => update({ password: e.target.value })}
                        placeholder="*******"
                    />
                    </InputGroup>
                </Field.Root>

                {(error || loginError) && (
                    <Text color="red.500" fontSize="sm">{error || loginError}</Text>
                )}
                <Flex justifyContent='space-around'>
                    <Button variant='surface' onClick={() => navigate({ to: "/register" })}>
                        Go to register
                    </Button>
                    <Button onClick={handleSubmit} loading={isLoggingIn}>
                        Log in
                    </Button>
                </Flex>
            </Stack>
        </Box>
    );
}