import { useDebouncedValue } from '@/lib/hooks/useDebounced'
import { Box, CloseButton, Flex, Input, InputGroup, SimpleGrid, Table, Tabs, Text } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { LuCalendarSync, LuCheck, LuClipboard, LuHourglass, LuSearch, LuTrash } from 'react-icons/lu'

export const Route = createFileRoute('/_authenticated/my-rental')({
  component: RouteComponent,
})

function RouteComponent() {
  const [filters, setFilters] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const filteredItems = items.filter((item) => {
    const matchesSearch = [
      item.customer,
      item.warehouse,
      item.storage,
      item.material,
      item.status,
    ].some((value) =>
      value.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const matchesStatus =
    filters === "all" ||
    item.status.toLowerCase() === filters;

    return matchesSearch && matchesStatus;
  });

  return (
    <Box spaceY={3}>
      <SimpleGrid columns={5} gap={3}>
        <Box
          borderWidth="1px"
          borderRadius="lg"
          p={3}
          minH="90px"
          spaceY={1}
        >
          <Text fontSize="xs" color="fg.muted">
            Active Rentals
          </Text>
          <Text fontSize="xl" fontWeight="semibold">
            1
          </Text>
        </Box>

        <Box
          borderWidth="1px"
          borderRadius="lg"
          p={3}
          minH="90px"
          spaceY={1}
        >
          <Text fontSize="xs" color="fg.muted">
            Pending Requests
          </Text>
          <Text fontSize="xl" fontWeight="semibold">
            2
          </Text>
          <Text fontSize="xs" color="fg.muted">
            Need your approval
          </Text>
        </Box>

        <Box
          borderWidth="1px"
          borderRadius="lg"
          p={3}
          minH="90px"
          spaceY={1}
        >
          <Text fontSize="xs" color="fg.muted">
            Occupancy
          </Text>
          <Text fontSize="xl" fontWeight="semibold">
            0/12
          </Text>
        </Box>

        <Box
          borderWidth="1px"
          borderRadius="lg"
          p={3}
          minH="90px"
          spaceY={1}
        >
          <Text fontSize="xs" color="fg.muted">
            Ending in 7 Days
          </Text>
          <Text fontSize="xl" fontWeight="semibold">
            2
          </Text>
        </Box>

        <Box
          borderWidth="1px"
          borderRadius="lg"
          p={3}
          minH="90px"
          spaceY={1}
        >
          <Text fontSize="xs" color="fg.muted">
            Revenue
          </Text>
          <Text fontSize="xl" fontWeight="semibold">
            P 44999
          </Text>
          <Text fontSize="xs" color="fg.muted">
            Active + Completed
          </Text>
        </Box>
      </SimpleGrid>

      <Box borderWidth="1px" borderRadius="lg" p={{ base: 3, md: 5 }} spaceY={5}>
        <Tabs.Root
          value={filters}
          onValueChange={(details) => setFilters(details.value)}
          variant='outline'
        >
          <Tabs.List
            gap={{ base: 1, md: 4 }}
            overflowX="auto"
            whiteSpace="nowrap"
          >
            <Tabs.Trigger value="all">
              <LuClipboard />
              All
            </Tabs.Trigger>
            <Tabs.Trigger value="pending">
              <LuHourglass />
              Pending
            </Tabs.Trigger>
            <Tabs.Trigger value="active">
              <LuCalendarSync />
              Active
            </Tabs.Trigger>
            <Tabs.Trigger value="completed">
              <LuCheck />
              Completed
            </Tabs.Trigger>
            <Tabs.Trigger value="cancelled">
              <LuTrash />
              Cancelled
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>

        <Flex
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={3}
        >
          <Box>
            <Text fontWeight="medium">Rental Records</Text>
            <Text fontSize="sm" color="fg.muted">
              View and manage all rental transactions.
            </Text>
          </Box>

          <InputGroup
            maxW={{ base: "100%", md: "320px" }}
            startElement={<LuSearch />}
            endElement={
              search ? (
                <CloseButton
                  size="xs"
                  me="-2"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                />
              ) : undefined
            }
          >
            <Input
              placeholder="Search rentals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Escape" && setSearch("")
              }
            />
          </InputGroup>
        </Flex>

        <Table.ScrollArea>
          <Table.Root size="sm" stickyHeader>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Customer</Table.ColumnHeader>
                <Table.ColumnHeader>Warehouse</Table.ColumnHeader>
                <Table.ColumnHeader>Storage Location</Table.ColumnHeader>
                <Table.ColumnHeader>Material</Table.ColumnHeader>
                <Table.ColumnHeader>Rental Period</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">
                  Amount
                </Table.ColumnHeader>
                <Table.ColumnHeader>Action</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>{item.customer}</Table.Cell>
                    <Table.Cell>{item.warehouse}</Table.Cell>
                    <Table.Cell>{item.storage}</Table.Cell>
                    <Table.Cell>{item.material}</Table.Cell>
                    <Table.Cell>{item.dates}</Table.Cell>
                    <Table.Cell>{item.status}</Table.Cell>
                    <Table.Cell textAlign="end">
                      {item.amount.toLocaleString()}
                    </Table.Cell>
                    <Table.Cell>{item.action}</Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={8} textAlign="center" py={10}>
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
      </Box>
    </Box>
  )
}

const items = [
  { id: 1, customer: "Laptop", warehouse: "Electronics", storage: 'A3 - Right', material: 'Furniture', dates: 'Oct 14 - Oct 21', status: 'Active', amount: 100,action: 'create' },
  { id: 2, customer: "Laptop", warehouse: "Electronics", storage: 'A3 - Right', material: 'Furniture', dates: 'Oct 14 - Oct 21', status: 'Active', amount: 100,action: 'create' },
  { id: 3, customer: "Laptop", warehouse: "Electronics", storage: 'A3 - Right', material: 'Furniture', dates: 'Oct 14 - Oct 21', status: 'Active', amount: 100,action: 'create' },
  { id: 4, customer: "Laptop", warehouse: "Electronics", storage: 'A3 - Right', material: 'Furniture', dates: 'Oct 14 - Oct 21', status: 'Active', amount: 100,action: 'create' },

]