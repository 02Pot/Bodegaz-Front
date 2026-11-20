import { ChakraProvider } from '@chakra-ui/react'
import { defaultSystem } from '@chakra-ui/react/preset'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'
import { ColorModeProvider } from './components/ui/color-mode'
import { AuthProvider } from './lib/provider/AuthProvider'
import { PreferencesProvider } from './lib/provider/PreferenceProvider'
import { routeTree } from './routeTree.gen'

const MAX_AGE = 1000 * 60 * 60 * 24

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { gcTime: 1000 * 60 * 60 * 24 },
    },
})

const persister = createAsyncStoragePersister({
    storage: window.localStorage,
})

const router = createRouter({
    routeTree,
    context: { queryClient },
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
            persister,
            maxAge: MAX_AGE,
            dehydrateOptions: {
                shouldDehydrateQuery: (query) => query.queryKey[0] === 'auth',
            },
        }}
        onSuccess={() => router.invalidate()}
    >
        <ChakraProvider value={defaultSystem}>
            <ColorModeProvider>
                <PreferencesProvider>
                    <AuthProvider>
                        <RouterProvider router={router} />
                    </AuthProvider>
                </PreferencesProvider>
            </ColorModeProvider>
        </ChakraProvider>
    </PersistQueryClientProvider>
)
