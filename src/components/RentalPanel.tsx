import { BookingStatus } from "@/constant";
import { getOwnerBookings, getOwnerBookingStats } from "@/lib/api/booking";
import { useDebouncedValue } from "@/lib/hooks/useDebounced";
import type { OwnerBooking } from "@/types";
import { fmtDate } from "@/utils/helpers";
import { Badge, Box, Button, ButtonGroup, CloseButton, Flex, IconButton, Input, InputGroup, NativeSelect, Pagination, Stack, Table, Tabs, Text } from "@chakra-ui/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LuChevronLeft, LuChevronRight, LuClipboard, LuSearch } from "react-icons/lu";

const statusGroup = (status: string) => {
    switch (status as BookingStatus) {
        case "PENDING_TERMS":
        case "PENDING_OWNER":
        case "PENDING_PAYMENT":
        case "HELD":
            return "pending";
        case "REJECTED":
        case "CANCELLED":
        case "EXPIRED":
            return "cancelled";
        case "COMPLETED":
            return "completed";
        case "CONFIRMED":
            return "active";
        default:
            return "active";
    }
}
const PAGE_SIZE = 10;

const RentalPanel = () => {
    const [filters, setFilters] = useState("all");
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search);
    const [page, setPage] = useState(1);

    const { data, isLoading, isPlaceholderData } = useQuery({
        queryKey: ["rentals", { page, search: debouncedSearch, status: filters }],
        queryFn: () => getOwnerBookings({ page: page - 1, size: PAGE_SIZE, search: debouncedSearch,status:filters }),
        placeholderData: keepPreviousData,
        retry: false,
    });

    const { data: s } = useQuery({
        queryKey: ["rentals", "stats"],
        queryFn: getOwnerBookingStats,
        retry: false,
    });

    const rental: OwnerBooking[] = data?.content ?? [];
    const total: number = data?.totalElements ?? 0;

    const changeFilter = (v: string) => { setFilters(v); setPage(1); };
    const changeSearch = (v: string) => { setSearch(v); setPage(1); };

    const stats = [
        { label: "Active Rentals", value: s?.active ?? 0 },
        { label: "Pending Requests", value: s?.pending ?? 0, hint: "Need your approval" },
        { label: "All Rental", value: s?.total ?? 0 },
        { label: "Ending in 7 Days", value: s?.endingSoon ?? 0 },
        { label: "Revenue", value: `P ${(s?.revenue ?? 0).toLocaleString()}`, hint: "Active + Completed" },
    ];

    const statusLabel = (st: string) => st.replace(/_/g, " ");


    return(
        <Box spaceY={3}>
            <Flex
                gap={{ base: 2, md: 3 }}
                overflowX={{ base: "auto", md: "visible" }}
                display={{ base: "flex", md: "grid" }}
                gridTemplateColumns={{ md: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" }}
                pb={{ base: 1, md: 0 }}
                css={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
            >
                {stats.map((s) => (
                    <Box
                        key={s.label}
                        flex={{ base: "0 0 auto", md: "unset" }}
                        minW={{ base: "130px", md: "0" }}
                        borderWidth="2px"
                        borderRadius="lg"
                        p={{ base: 2, md: 3 }}
                        spaceY={0.5}
                    >
                        <Text fontSize="xs" color="fg.muted">{s.label}</Text>
                        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold">{s.value}</Text>
                        {s.hint && <Text fontSize="xs" color="fg.muted">{s.hint}</Text>}
                    </Box>
                ))}
            </Flex>
    
            <Box borderWidth="2px" borderRadius="lg" p={{ base: 3, md: 5 }} spaceY={5}>

            <Tabs.Root
                value={filters}
                onValueChange={(details) => changeFilter(details.value)}
                variant="outline"
            >
                <NativeSelect.Root display={{ base: "block", md: "none" }}>
                    <NativeSelect.Field value={filters} onChange={(e) => changeFilter(e.currentTarget.value)}>
                        <option value="all">All</option>
                        {Object.keys(BookingStatus).map((st) => (
                            <option key={st} value={st}>{statusLabel(st)}</option>
                        ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                </NativeSelect.Root>

                <Tabs.List
                    display={{ base: "none", md: "flex" }}
                    gap={4}
                    overflowX="auto"
                    whiteSpace="nowrap"
                >
                    <Tabs.Trigger value="all">
                        <LuClipboard />
                        All
                    </Tabs.Trigger>
                    {Object.keys(BookingStatus).map((st) => (
                        <Tabs.Trigger key={st} value={st}>
                            {statusLabel(st)}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>
            </Tabs.Root>

            <Flex
                justify="space-between"
                align={{ base: "stretch", md: "center" }}
                direction={{ base: "column", md: "row" }}
                gap={3}
            >
                <InputGroup
                maxW={{ base: "100%", md: "320px" }}
                startElement={<LuSearch />}
                endElement={
                    search ? (
                    <CloseButton
                        size="xs"
                        me="-2"
                        aria-label="Clear search"
                        onClick={() => changeSearch("")}
                    />
                    ) : undefined
                }
                >
                <Input
                    placeholder="Search rentals..."
                    value={search}
                    onChange={(e) => changeSearch(e.target.value)}
                    onKeyDown={(e) =>
                        e.key === "Escape" && changeSearch("")
                    }
                />
                </InputGroup>
            </Flex>
    
            <Table.ScrollArea display={{ base: "none", md: "block" }} opacity={isPlaceholderData ? 0.6 : 1}>
                <Table.Root size="sm" stickyHeader>
                <Table.Header>
                    <Table.Row>
                    <Table.ColumnHeader>Customer</Table.ColumnHeader>
                    <Table.ColumnHeader>Warehouse</Table.ColumnHeader>
                    <Table.ColumnHeader>Storage Location</Table.ColumnHeader>
                    <Table.ColumnHeader>Rental Period</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader>Amount</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign='center'>Action</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
    
                <Table.Body>
                    {isLoading ? (
                        <Table.Row>
                            <Table.Cell colSpan={7} textAlign="center" py={10}>Loading rentals…</Table.Cell>
                        </Table.Row>
                    ) : rental.length > 0 ? (
                        rental.map((item: OwnerBooking) => (
                            <Table.Row key={item.orderId}>
                                <Table.Cell>
                                    <Text>{item.tenantName}</Text>
                                    <Text fontSize="xs" color="fg.muted">{item.tenantEmail}</Text>
                                </Table.Cell>
                                <Table.Cell>{item.warehouseName}</Table.Cell>
                                <Table.Cell>{item.unitNumber} · {item.blockName} / {item.section}</Table.Cell>
                                <Table.Cell>{fmtDate(item.startDate)} - {fmtDate(item.endDate)}</Table.Cell>
                                <Table.Cell>{statusLabel(item.status)}</Table.Cell>
                                <Table.Cell>P {item.totalPrice.toLocaleString()}</Table.Cell>
                                <Table.Cell textAlign='center'>
                                    {item.status === "PENDING_OWNER" && <Button size="xs">Review</Button>}
                                </Table.Cell>
                            </Table.Row>
                            ))
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan={7} textAlign="center" py={10}>
                                    <Text fontWeight="medium">No rentals found</Text>
                                    <Text fontSize="sm" color="fg.muted" mt={1}>
                                        Try changing your search or selected status.
                                    </Text>
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>
            
            <Stack display={{ base: "flex", md: "none" }} gap={3} opacity={isPlaceholderData ? 0.6 : 1}>
                {isLoading ? (
                    <Text textAlign="center" py={6}>Loading rentals…</Text>
                ) : rental.length > 0 ? (
                    rental.map((item: OwnerBooking) => (
                        <Box key={item.orderId} borderWidth="1px" rounded="lg" p={3} spaceY={2}>
                            <Flex justify="space-between" align="flex-start" gap={2}>
                                <Box minW={0}>
                                    <Text fontWeight="medium">{item.tenantName}</Text>
                                    <Text fontSize="xs" color="fg.muted" truncate>{item.tenantEmail}</Text>
                                </Box>
                                <Badge colorPalette={BookingStatus[item.status as keyof typeof BookingStatus]?.color} size="sm">
                                    {statusLabel(item.status)}
                                </Badge>
                            </Flex>
                            <Text fontSize="sm">{item.warehouseName}</Text>
                            <Text fontSize="xs" color="fg.muted">{item.unitNumber} · {item.blockName} / {item.section}</Text>
                            <Flex justify="space-between" align="center" borderTopWidth="1px" pt={2}>
                                <Box>
                                    <Text fontSize="xs" color="fg.muted">{fmtDate(item.startDate)} - {fmtDate(item.endDate)}</Text>
                                    <Text fontSize="sm" fontWeight="medium">P {item.totalPrice.toLocaleString()}</Text>
                                </Box>
                                {item.status === "PENDING_OWNER" && <Button size="xs">Review</Button>}
                            </Flex>
                        </Box>
                    ))
                ) : (
                    <Box textAlign="center" py={6}>
                        <Text fontWeight="medium">No rentals found</Text>
                        <Text fontSize="sm" color="fg.muted">Try changing your search or selected status.</Text>
                    </Box>
                )}
            </Stack>
            <Pagination.Root count={total} pageSize={PAGE_SIZE} page={page} onPageChange={(e) => setPage(e.page)}>
                <Flex justify="space-between" align="center" gap={2}>
                    <Pagination.PageText format="long" fontSize="sm" color="fg.muted" />
                    <ButtonGroup variant="ghost" size="sm">
                        <Pagination.PrevTrigger asChild>
                            <IconButton aria-label="Previous page"><LuChevronLeft /></IconButton>
                        </Pagination.PrevTrigger>
                        <Box display={{ base: "none", md: "contents" }}>
                            <Pagination.Items render={(p) => (
                                <IconButton variant={{ base: "ghost", _selected: "outline" }}>{p.value}</IconButton>
                            )} />
                        </Box>
                        <Pagination.NextTrigger asChild>
                            <IconButton aria-label="Next page"><LuChevronRight /></IconButton>
                        </Pagination.NextTrigger>
                    </ButtonGroup>
                </Flex>
            </Pagination.Root>
        </Box>
    </Box>
    )
}

export default RentalPanel