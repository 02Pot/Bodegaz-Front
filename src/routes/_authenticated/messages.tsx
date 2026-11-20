import { BASE_URL } from '@/constant'
import { searchUsers } from '@/lib/api/user'
import {
    getChatMessages,
    getConversations,
    onChatMessage,
    sendMessage,
} from '@/lib/api/ws/chat'
import { useAuth } from '@/lib/hooks/useAuth'
import { useDebouncedValue } from '@/lib/hooks/useDebounced'
import type { ChatMessageResponse, ChatUser } from '@/types'
import {
    Avatar,
    Badge,
    Box,
    Button,
    Center,
    CloseButton,
    Flex,
    Heading,
    IconButton,
    Input,
    InputGroup,
    Spinner,
    Stack,
    Text,
    Textarea,
} from '@chakra-ui/react'
import {
    useInfiniteQuery,
    useQuery,
    useQueryClient,
    type InfiniteData,
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
    type RefObject,
} from 'react'
import { LuArrowLeft, LuMessageCircle, LuSearch, LuSend } from 'react-icons/lu'

export const Route = createFileRoute('/_authenticated/messages')({
    validateSearch: (s: Record<string, unknown>): { to?: string } => ({
        to: typeof s.to === 'string' ? s.to : undefined,
    }),
    component: RouteComponent,
})

const PAGE = 30
const messagesKey = (id: string) => ['chat', 'messages', id]
const time = (iso: string) => new Date(iso).getTime()

const shortTime = (iso: string) => {
    const d = new Date(iso)
    return d.toDateString() === new Date().toDateString()
        ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

type Pages = InfiniteData<ChatMessageResponse[], string | undefined>

function UserAvatar({
    name,
    url,
    size = 'md',
}: {
    name: string
    url: string | null
    size?: 'sm' | 'md' | 'lg'
}) {
    return (
        <Avatar.Root size={size}>
            <Avatar.Fallback name={name} />
            {url && <Avatar.Image src={`${BASE_URL}${url}`} />}
        </Avatar.Root>
    )
}

function RouteComponent() {
    const { currentUser } = useAuth()
    const queryClient = useQueryClient()
    const { to } = Route.useSearch()
    const [picked, setPicked] = useState<ChatUser | null | undefined>(undefined)
    const searchRef = useRef<HTMLInputElement>(null)
    const myId = currentUser?.id

    const { data: target } = useQuery({
        queryKey: ['chat', 'target', to],
        queryFn: async () =>
            (await searchUsers(to!)).find(
                (u) => u.email.toLowerCase() === to!.toLowerCase()
            ) ?? null,
        enabled: !!to,
        staleTime: 5 * 60 * 1000,
        retry: false,
    })

    const active = picked === undefined ? (target ?? null) : picked

    useEffect(() => {
        if (!myId) return
        return onChatMessage((m) => {
            const other = m.senderId === myId ? m.recipientId : m.senderId
            queryClient.setQueryData<Pages>(
                messagesKey(other),
                (old) =>
                    old && {
                        ...old,
                        pages: [
                            [m, ...(old.pages[0] ?? [])],
                            ...old.pages.slice(1),
                        ],
                    }
            )
            queryClient.invalidateQueries({
                queryKey: ['chat', 'conversations'],
            })
        })
    }, [myId, queryClient])

    if (!myId) return null

    return (
        <Flex
            h={{ base: 'calc(100dvh - 150px)', md: 'calc(100dvh - 130px)' }}
            gap={4}
            minH="420px"
        >
            <Box
                flex="1"
                minW={0}
                display={{ base: active ? 'flex' : 'none', lg: 'flex' }}
                flexDirection="column"
                borderWidth="1px"
                rounded="xl"
                overflow="hidden"
                bg="bg"
            >
                {active ? (
                    <Thread
                        key={active.id}
                        user={active}
                        myId={myId}
                        onBack={() => setPicked(null)}
                    />
                ) : (
                    <EmptyThread onFind={() => searchRef.current?.focus()} />
                )}
            </Box>

            <Sidebar
                activeId={active?.id}
                onSelect={setPicked}
                searchRef={searchRef}
                display={{ base: active ? 'none' : 'flex', lg: 'flex' }}
            />
        </Flex>
    )
}

function EmptyThread({ onFind }: { onFind: () => void }) {
    return (
        <Center flex="1" p={6}>
            <Stack align="center" textAlign="center" gap={3} maxW="320px">
                <Flex
                    boxSize={14}
                    rounded="full"
                    bg="bg.muted"
                    align="center"
                    justify="center"
                    color="fg.muted"
                >
                    <LuMessageCircle size={26} />
                </Flex>
                <Heading size="lg">Start a conversation</Heading>
                <Text color="fg.muted" fontSize="sm">
                    Message someone by searching for their email address or
                    username.
                </Text>
                <Button size="sm" onClick={onFind}>
                    <LuSearch /> Find a user
                </Button>
            </Stack>
        </Center>
    )
}

function Sidebar({
    activeId,
    onSelect,
    searchRef,
    display,
}: {
    activeId?: string
    onSelect: (u: ChatUser) => void
    searchRef: RefObject<HTMLInputElement | null>
    display: Record<string, string>
}) {
    const [search, setSearch] = useState('')
    const q = useDebouncedValue(search).trim()
    const searching = q.length >= 2

    const { data: conversations = [], isLoading } = useQuery({
        queryKey: ['chat', 'conversations'],
        queryFn: getConversations,
        retry: false,
    })

    const { data: results = [], isFetching } = useQuery({
        queryKey: ['chat', 'user-search', q],
        queryFn: () => searchUsers(q),
        enabled: searching,
        retry: false,
    })

    const pick = (u: ChatUser) => {
        onSelect(u)
        setSearch('')
    }

    return (
        <Flex
            display={display}
            direction="column"
            w={{ base: '100%', lg: '340px' }}
            flexShrink={0}
            borderWidth="1px"
            rounded="xl"
            overflow="hidden"
            bg="bg"
        >
            <Box p={3} borderBottomWidth="1px">
                <Heading size="md" mb={3}>
                    Messages
                </Heading>
                <InputGroup
                    startElement={<LuSearch />}
                    endElement={
                        search ? (
                            <CloseButton
                                size="xs"
                                me="-2"
                                aria-label="Clear search"
                                onClick={() => setSearch('')}
                            />
                        ) : undefined
                    }
                >
                    <Input
                        ref={searchRef}
                        placeholder="Search by email or username"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Escape' && setSearch('')}
                    />
                </InputGroup>
            </Box>

            <Stack gap={0} flex="1" overflowY="auto">
                {searching ? (
                    isFetching ? (
                        <Center py={8}>
                            <Spinner size="sm" />
                        </Center>
                    ) : results.length === 0 ? (
                        <Text
                            p={6}
                            textAlign="center"
                            color="fg.muted"
                            fontSize="sm"
                        >
                            No users found for “{q}”.
                        </Text>
                    ) : (
                        results.map((u) => (
                            <Row
                                key={u.id}
                                active={u.id === activeId}
                                onClick={() => pick(u)}
                            >
                                <UserAvatar
                                    name={u.name}
                                    url={u.profilePicUrl}
                                />
                                <Box minW={0} flex="1">
                                    <Text fontWeight="medium" truncate>
                                        {u.name}
                                    </Text>
                                    <Text
                                        fontSize="sm"
                                        color="fg.muted"
                                        truncate
                                    >
                                        {u.email}
                                    </Text>
                                </Box>
                            </Row>
                        ))
                    )
                ) : isLoading ? (
                    <Center py={8}>
                        <Spinner size="sm" />
                    </Center>
                ) : conversations.length === 0 ? (
                    <Text
                        p={6}
                        textAlign="center"
                        color="fg.muted"
                        fontSize="sm"
                    >
                        No conversations yet. Search for a user above to say hi.
                    </Text>
                ) : (
                    conversations.map((c) => (
                        <Row
                            key={c.userId}
                            active={c.userId === activeId}
                            onClick={() =>
                                pick({
                                    id: c.userId,
                                    name: c.name,
                                    email: c.email,
                                    profilePicUrl: c.profilePicUrl,
                                })
                            }
                        >
                            <UserAvatar name={c.name} url={c.profilePicUrl} />
                            <Box minW={0} flex="1">
                                <Flex justify="space-between" gap={2}>
                                    <Text fontWeight="medium" truncate>
                                        {c.name}
                                    </Text>
                                    <Text
                                        fontSize="xs"
                                        color="fg.muted"
                                        flexShrink={0}
                                    >
                                        {shortTime(c.lastMessageAt)}
                                    </Text>
                                </Flex>
                                <Flex justify="space-between" gap={2}>
                                    <Text
                                        fontSize="sm"
                                        color="fg.muted"
                                        truncate
                                    >
                                        {c.lastMessage}
                                    </Text>
                                    {!!c.unreadCount && (
                                        <Badge
                                            colorPalette="blue"
                                            rounded="full"
                                        >
                                            {c.unreadCount}
                                        </Badge>
                                    )}
                                </Flex>
                            </Box>
                        </Row>
                    ))
                )}
            </Stack>
        </Flex>
    )
}

function Row({
    active,
    onClick,
    children,
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <Flex
            as="button"
            onClick={onClick}
            align="center"
            gap={3}
            px={3}
            py={3}
            textAlign="left"
            w="100%"
            bg={active ? 'bg.muted' : 'transparent'}
            _hover={{ bg: 'bg.muted' }}
        >
            {children}
        </Flex>
    )
}

function Thread({
    user,
    myId,
    onBack,
}: {
    user: ChatUser
    myId: string
    onBack: () => void
}) {
    const [text, setText] = useState('')
    const [sendError, setSendError] = useState<string | null>(null)
    const boxRef = useRef<HTMLDivElement>(null)

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteQuery({
            queryKey: messagesKey(user.id),
            queryFn: ({ pageParam }) =>
                getChatMessages(user.id, pageParam, PAGE),
            initialPageParam: undefined as string | undefined,
            getNextPageParam: (last) =>
                last.length < PAGE
                    ? undefined
                    : last.reduce(
                          (a, m) =>
                              time(m.createdAt) < time(a) ? m.createdAt : a,
                          last[0].createdAt
                      ),
            retry: false,
        })

    // flatten, dedupe by id, and always render oldest -> newest
    const messages = useMemo(() => {
        const map = new Map<string, ChatMessageResponse>()
        data?.pages.flat().forEach((m) => map.set(m.id, m))
        return [...map.values()].sort(
            (a, b) => time(a.createdAt) - time(b.createdAt)
        )
    }, [data])

    const lastId = messages.at(-1)?.id
    useEffect(() => {
        const el = boxRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [lastId])

    const submit = (e?: FormEvent) => {
        e?.preventDefault()
        const content = text.trim()
        if (!content) return
        try {
            sendMessage(user.id, content)
            setText('')
            setSendError(null)
        } catch {
            setSendError('Not connected yet. Try again in a moment.')
        }
    }

    return (
        <>
            <Flex align="center" gap={3} p={3} borderBottomWidth="1px">
                <IconButton
                    aria-label="Back to conversations"
                    variant="ghost"
                    size="sm"
                    display={{ base: 'inline-flex', lg: 'none' }}
                    onClick={onBack}
                >
                    <LuArrowLeft />
                </IconButton>
                <UserAvatar name={user.name} url={user.profilePicUrl} />
                <Box minW={0}>
                    <Text fontWeight="semibold" truncate>
                        {user.name}
                    </Text>
                    <Text fontSize="xs" color="fg.muted" truncate>
                        {user.email}
                    </Text>
                </Box>
            </Flex>

            <Stack ref={boxRef} flex="1" overflowY="auto" p={4} gap={2}>
                {hasNextPage && (
                    <Button
                        size="xs"
                        variant="ghost"
                        alignSelf="center"
                        loading={isFetchingNextPage}
                        onClick={() => fetchNextPage()}
                    >
                        Load earlier messages
                    </Button>
                )}

                {isLoading ? (
                    <Center flex="1">
                        <Spinner />
                    </Center>
                ) : messages.length === 0 ? (
                    <Center flex="1">
                        <Text color="fg.muted" fontSize="sm">
                            Say hello to {user.name}.
                        </Text>
                    </Center>
                ) : (
                    messages.map((m) => {
                        const mine = m.senderId === myId
                        return (
                            <Flex
                                key={m.id}
                                justify={mine ? 'flex-end' : 'flex-start'}
                            >
                                <Box
                                    maxW={{ base: '85%', md: '70%' }}
                                    px={3}
                                    py={2}
                                    rounded="2xl"
                                    roundedBottomRight={mine ? 'sm' : '2xl'}
                                    roundedBottomLeft={mine ? '2xl' : 'sm'}
                                    bg={mine ? 'blue.solid' : 'bg.muted'}
                                    color={mine ? 'white' : 'fg'}
                                >
                                    <Text
                                        whiteSpace="pre-wrap"
                                        wordBreak="break-word"
                                    >
                                        {m.content}
                                    </Text>
                                    <Text
                                        fontSize="2xs"
                                        opacity={0.7}
                                        textAlign="right"
                                        mt={0.5}
                                    >
                                        {new Date(
                                            m.createdAt
                                        ).toLocaleTimeString([], {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                        })}
                                    </Text>
                                </Box>
                            </Flex>
                        )
                    })
                )}
            </Stack>

            <Box as="form" onSubmit={submit} p={3} borderTopWidth="1px">
                {sendError && (
                    <Text fontSize="xs" color="fg.error" mb={2}>
                        {sendError}
                    </Text>
                )}
                <Flex gap={2} align="flex-end">
                    <Textarea
                        autoresize
                        rows={1}
                        maxH="140px"
                        placeholder="Write a message…"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                submit()
                            }
                        }}
                    />
                    <IconButton
                        type="submit"
                        aria-label="Send"
                        disabled={!text.trim()}
                    >
                        <LuSend />
                    </IconButton>
                </Flex>
            </Box>
        </>
    )
}
