import { authQueryOptions, useAuth } from '@/lib/provider';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/login')({
    beforeLoad: async ({ context }) => {
        const user = await context.queryClient.ensureQueryData(authQueryOptions);
        if (user) throw redirect({ to: "/"});
    },
    component: Login,
})

function Login() {
    const { login, isLoggingIn, loginError } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
        await login({ email, password })
        navigate({ to: '/' })
        } catch {
            console.log('')
        }
    }

    return (
    <form onSubmit={handleSubmit} className="p-2">
        <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        />
        <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        />
        {loginError && <p>{loginError}</p>}
        <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? 'Logging in...' : 'Log in'}
        </button>
    </form>
    )
}