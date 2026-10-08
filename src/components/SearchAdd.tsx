import { useDebouncedValue } from "@/lib/hooks/useDebounced";
import { useAuth } from "@/lib/provider";
import { Button, CloseButton, Flex, Input, InputGroup } from "@chakra-ui/react";
import { useState } from "react";
import { LuPlus, LuSearch } from "react-icons/lu";
import CreateWarehouse from "./CreateWarehouse";
import { FilterMenu, type Filters } from "./Filter";

const SearchBar = () => {
    const { currentUser } = useAuth();
    const [filters, setFilters] = useState<Filters>();
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search)
    const [createOpen, setCreateOpen] = useState(false)

    const isBuyer = currentUser?.userType === 'BUYER_ROLE'

    return(
        <Flex gap="12px">
            {!isBuyer &&
                <Button onClick={() => setCreateOpen(true)}>
                    <LuPlus/>
                    New Warehouse
                </Button>
            }

        <InputGroup
            flex="1"
            startElement={<LuSearch />}
            endElement={
                search ? (
                <CloseButton size="xs" me="-2" aria-label="Clear search" onClick={() => setSearch('')} />
                ) : undefined
            }
        >
            <Input
                placeholder="Search warehouse"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setSearch('')}
            />
        </InputGroup>
            
        <FilterMenu onApply={setFilters}/>
        <CreateWarehouse open={createOpen} onClose={() => setCreateOpen(false)} />
        </Flex>
    )
}

export default SearchBar