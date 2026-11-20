import { useAuth } from '@/lib/hooks/useAuth'
import {
    Accordion,
    Badge,
    Box,
    Button,
    Card,
    Field,
    Flex,
    Grid,
    Heading,
    HStack,
    Icon,
    IconButton,
    Input,
    InputGroup,
    Link,
    NativeSelect,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
} from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useRef, useState, type FormEvent } from 'react'
import type { IconType } from 'react-icons'
import {
    LuCircleHelp,
    LuClock,
    LuCreditCard,
    LuFacebook,
    LuGithub,
    LuLinkedin,
    LuMail,
    LuMessagesSquare,
    LuPaperclip,
    LuPhone,
    LuRocket,
    LuSearch,
    LuWrench,
    LuX,
} from 'react-icons/lu'

export const Route = createFileRoute('/_authenticated/supp-inq')({
    component: RouteComponent,
})

type CategoryKey = 'start' | 'billing' | 'trouble' | 'general'

const CATEGORIES: {
    key: CategoryKey
    label: string
    desc: string
    icon: IconType
}[] = [
    {
        key: 'start',
        label: 'Getting Started',
        desc: 'Listing and booking basics',
        icon: LuRocket,
    },
    {
        key: 'billing',
        label: 'Account & Billing',
        desc: 'Profile, payments, invoices',
        icon: LuCreditCard,
    },
    {
        key: 'trouble',
        label: 'Troubleshooting',
        desc: 'Fix common problems',
        icon: LuWrench,
    },
    {
        key: 'general',
        label: 'General & Sales',
        desc: 'Pricing, plans, partnerships',
        icon: LuCircleHelp,
    },
]

const FAQS: { id: string; cat: CategoryKey; q: string; a: string }[] = [
    {
        id: 'f1',
        cat: 'start',
        q: 'How do I list a warehouse?',
        a: 'Open Find Rentals and click New Warehouse. Add the address, capacity and photos, then add storage units with their price per cubic meter.',
    },
    {
        id: 'f2',
        cat: 'start',
        q: 'How do I book a storage unit?',
        a: 'Open a warehouse, choose a unit, pick your dates and the volume and weight you need, then review and accept the lease terms.',
    },
    {
        id: 'f3',
        cat: 'billing',
        q: 'How do I change my email or password?',
        a: 'Go to Settings > Account, update the fields and click Save changes. Your new email is used the next time you log in.',
    },
    {
        id: 'f4',
        cat: 'billing',
        q: 'Where can I find my invoices?',
        a: 'Invoices are listed under Settings > Billing. You can download each one as a PDF.',
    },
    {
        id: 'f5',
        cat: 'trouble',
        q: 'My images will not upload.',
        a: 'Images must be under 5 MB and in JPG or PNG format. If it still fails, try a different browser and send us the error message.',
    },
    {
        id: 'f6',
        cat: 'trouble',
        q: 'I am not receiving messages or emails.',
        a: 'Check your spam folder and the notification options in Settings. Make sure your email address is correct in your account.',
    },
    {
        id: 'f7',
        cat: 'general',
        q: 'What are the fees for owners?',
        a: 'Listing is free. Contact our sales team through the form below for commission and plan details.',
    },
    {
        id: 'f8',
        cat: 'general',
        q: 'Can I partner with you as a logistics company?',
        a: 'Yes. Choose Partnership / Business Inquiry in the form below and tell us about your company.',
    },
]

const TOPICS = [
    'General Question / Pre-Sales',
    'Technical Issue / Bug Report',
    'Billing & Account Help',
    'Partnership / Business Inquiry',
    'Feature Request / Feedback',
]

const MAX_FILE = 5 * 1024 * 1024

function RouteComponent() {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<CategoryKey | null>(null)

    const filtered = useMemo(() => {
        const s = search.trim().toLowerCase()
        return FAQS.filter(
            (f) =>
                (!category || f.cat === category) &&
                (!s ||
                    f.q.toLowerCase().includes(s) ||
                    f.a.toLowerCase().includes(s))
        )
    }, [search, category])

    return (
        <Stack gap={10} maxW="1100px" mx="auto" w="100%">
            {/* Hero */}
            <Stack align="center" textAlign="center" gap={4}>
                <Heading size="3xl">How can we help?</Heading>
                <InputGroup
                    maxW="520px"
                    w="100%"
                    startElement={<LuSearch />}
                    endElement={
                        search ? (
                            <IconButton
                                size="xs"
                                variant="ghost"
                                aria-label="Clear search"
                                me="-2"
                                onClick={() => setSearch('')}
                            >
                                <LuX />
                            </IconButton>
                        ) : undefined
                    }
                >
                    <Input
                        size="lg"
                        placeholder="Search guides and FAQs"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </InputGroup>
                <Badge
                    colorPalette="green"
                    size="lg"
                    variant="subtle"
                    rounded="full"
                    px={3}
                >
                    <Box boxSize="8px" rounded="full" bg="green.solid" />
                    All Systems Operational
                </Badge>
            </Stack>

            {/* Topic cards */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
                {CATEGORIES.map((c) => {
                    const active = category === c.key
                    return (
                        <Card.Root
                            key={c.key}
                            as="button"
                            textAlign="start"
                            cursor="pointer"
                            borderWidth="1px"
                            borderColor={
                                active ? 'colorPalette.solid' : undefined
                            }
                            bg={active ? 'colorPalette.subtle' : 'bg.panel'}
                            transition="all 0.15s"
                            _hover={{
                                shadow: 'md',
                                transform: 'translateY(-2px)',
                            }}
                            aria-pressed={active}
                            onClick={() => setCategory(active ? null : c.key)}
                        >
                            <Card.Body gap={2}>
                                <Icon as={c.icon} boxSize={6} />
                                <Text fontWeight="semibold">{c.label}</Text>
                                <Text fontSize="sm" color="fg.muted">
                                    {c.desc}
                                </Text>
                            </Card.Body>
                        </Card.Root>
                    )
                })}
            </SimpleGrid>

            {/* FAQs */}
            <Stack gap={3}>
                <Flex justify="space-between" align="center">
                    <Heading size="lg">
                        {category
                            ? CATEGORIES.find((c) => c.key === category)?.label
                            : 'Frequently asked questions'}
                    </Heading>
                    {category && (
                        <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => setCategory(null)}
                        >
                            Show all
                        </Button>
                    )}
                </Flex>

                {filtered.length ? (
                    <Accordion.Root collapsible multiple variant="outline">
                        {filtered.map((f) => (
                            <Accordion.Item
                                key={f.id}
                                value={f.id}
                                bg="bg.panel"
                                p="2    "
                            >
                                <Accordion.ItemTrigger>
                                    <Text flex="1" fontWeight="medium">
                                        {f.q}
                                    </Text>
                                    <Accordion.ItemIndicator />
                                </Accordion.ItemTrigger>
                                <Accordion.ItemContent>
                                    <Accordion.ItemBody color="fg.muted">
                                        {f.a}
                                    </Accordion.ItemBody>
                                </Accordion.ItemContent>
                            </Accordion.Item>
                        ))}
                    </Accordion.Root>
                ) : (
                    <Box
                        p={6}
                        textAlign="center"
                        borderWidth="1px"
                        rounded="xl"
                        bg="bg.panel"
                    >
                        <Text fontWeight="medium">No results found</Text>
                        <Text fontSize="sm" color="fg.muted">
                            Try different keywords or send us a message below.
                        </Text>
                    </Box>
                )}
            </Stack>

            {/* Contact */}
            <Grid
                templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
                gap={6}
                alignItems="start"
            >
                <ContactForm />
                <InfoSidebar />
            </Grid>
        </Stack>
    )
}

function ContactForm() {
    const { currentUser } = useAuth()
    const fileRef = useRef<HTMLInputElement>(null)
    const [name, setName] = useState(currentUser?.name ?? '')
    const [email, setEmail] = useState(currentUser?.email ?? '')
    const [topic, setTopic] = useState(TOPICS[0])
    const [message, setMessage] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)
    const [sent, setSent] = useState(false)

    const isTech = topic === 'Technical Issue / Bug Report'
    const valid =
        !!name.trim() &&
        /^\S+@\S+\.\S+$/.test(email.trim()) &&
        message.trim().length >= 10

    const onSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (!valid) return
        // TODO: call the support API with { name, email, topic, message, file }
        setSent(true)
    }

    if (sent) {
        return (
            <Stack
                p={8}
                align="center"
                textAlign="center"
                borderWidth="1px"
                rounded="xl"
                bg="bg.panel"
                gap={2}
            >
                <Heading size="lg">Message sent</Heading>
                <Text color="fg.muted">
                    We will reply to {email} within 24 hours, Mon–Fri.
                </Text>
                <Button
                    variant="outline"
                    mt={2}
                    onClick={() => {
                        setMessage('')
                        setFile(null)
                        setSent(false)
                    }}
                >
                    Send another message
                </Button>
            </Stack>
        )
    }

    return (
        <Box
            as="form"
            id="contact"
            onSubmit={onSubmit}
            borderWidth="1px"
            rounded="xl"
            bg="bg.panel"
            p={{ base: 4, md: 6 }}
        >
            <Stack gap={5}>
                <Box>
                    <Heading size="lg">Still need help?</Heading>
                    <Text fontSize="sm" color="fg.muted">
                        Send us a message and we will get back to you.
                    </Text>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field.Root required>
                        <Field.Label>Name</Field.Label>
                        <Input
                            value={name}
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
                    </Field.Root>
                </SimpleGrid>

                <Field.Root required>
                    <Field.Label>Topic</Field.Label>
                    <NativeSelect.Root>
                        <NativeSelect.Field
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        >
                            {TOPICS.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                </Field.Root>

                <Field.Root required>
                    <Field.Label>Message</Field.Label>
                    <Textarea
                        rows={6}
                        value={message}
                        placeholder={
                            isTech
                                ? 'What happened, what did you expect, and how can we reproduce it?'
                                : 'How can we help?'
                        }
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <Field.HelperText>At least 10 characters.</Field.HelperText>
                </Field.Root>

                <Field.Root invalid={!!fileError}>
                    <Field.Label>
                        Attachment{' '}
                        <Text as="span" color="fg.muted" fontWeight="normal">
                            {isTech
                                ? '(recommended: a screenshot)'
                                : '(optional)'}
                        </Text>
                    </Field.Label>
                    <HStack>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileRef.current?.click()}
                        >
                            <LuPaperclip />{' '}
                            {file ? 'Replace file' : 'Attach file'}
                        </Button>
                        {file && (
                            <HStack gap={1} minW={0}>
                                <Text fontSize="sm" truncate>
                                    {file.name}
                                </Text>
                                <IconButton
                                    type="button"
                                    size="2xs"
                                    variant="ghost"
                                    aria-label="Remove attachment"
                                    onClick={() => setFile(null)}
                                >
                                    <LuX />
                                </IconButton>
                            </HStack>
                        )}
                    </HStack>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,.pdf"
                        hidden
                        onChange={(e) => {
                            const f = e.target.files?.[0]
                            e.target.value = ''
                            if (!f) return
                            if (f.size > MAX_FILE)
                                return setFileError('File must be under 5 MB.')
                            setFileError(null)
                            setFile(f)
                        }}
                    />
                    <Field.ErrorText>{fileError}</Field.ErrorText>
                    {!fileError && (
                        <Field.HelperText>
                            Images or PDF, up to 5 MB.
                        </Field.HelperText>
                    )}
                </Field.Root>

                <HStack justify="flex-end">
                    <Button type="submit" disabled={!valid}>
                        Send message
                    </Button>
                </HStack>
            </Stack>
        </Box>
    )
}

const Item = ({
    icon,
    title,
    children,
}: {
    icon: IconType
    title: string
    children: React.ReactNode
}) => (
    <HStack align="flex-start" gap={3}>
        <Icon as={icon} boxSize={5} mt={0.5} color="fg.muted" />
        <Box minW={0}>
            <Text fontSize="sm" fontWeight="medium">
                {title}
            </Text>
            <Box fontSize="sm" color="fg.muted">
                {children}
            </Box>
        </Box>
    </HStack>
)

function InfoSidebar() {
    return (
        <Stack
            gap={5}
            p={{ base: 4, md: 6 }}
            borderWidth="1px"
            rounded="xl"
            bg="bg.panel"
        >
            <Heading size="md">Contact info</Heading>
            <Item icon={LuMail} title="Email">
                <Link href="mailto:support@bodegaz.com">
                    support@bodegaz.com
                </Link>
            </Item>
            <Item icon={LuPhone} title="Phone">
                <Link href="tel:+639567720531">+63 956 772 0531</Link>
            </Item>
            <Item icon={LuClock} title="Business hours">
                Mon–Fri, 9:00 AM – 6:00 PM (PHT)
                <br />
                Replies within 24 hours.
            </Item>
            <Item icon={LuMessagesSquare} title="Community">
                <Stack gap={1}>
                    {/* <Link href="#" target="_blank" rel="noreferrer">
                        Community forum
                    </Link> */}
                    <Link href="#" target="_blank" rel="noreferrer">
                        <LuFacebook />
                        Facebook
                    </Link>
                    <Link href="#" target="_blank" rel="noreferrer">
                        <LuLinkedin />
                        LinkedIn
                    </Link>
                    <Link href="#" target="_blank" rel="noreferrer">
                        <LuGithub />
                        Github
                    </Link>
                </Stack>
            </Item>
        </Stack>
    )
}
