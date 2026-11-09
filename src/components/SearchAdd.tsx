import { useDebouncedValue } from "@/lib/hooks/useDebounced";
import { useAuth } from "@/lib/provider";
import { Button, CloseButton, Flex, IconButton, Input, InputGroup } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuPlus, LuSearch } from "react-icons/lu";
import { FilterMenu, type Filters } from "./Filter";
import CreateWarehouse from "./Warehouse/CreateWarehouse";

const SearchBar = ({ onSearch,onFilters } : { onSearch: (v: string) => void; onFilters: (f: Filters) => void }) => {
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search)
    const [createOpen, setCreateOpen] = useState(false)

    useEffect(() => { onSearch(debouncedSearch) }, [debouncedSearch])


    const isBuyer = currentUser?.userType === 'BUYER_ROLE'

    return(
        <Flex gap="12px" wrap="wrap" align="center">
            {!isBuyer &&
                <>
                    <IconButton
                        aria-label="New warehouse"
                        display={{ base: "inline-flex", md: "none" }}
                        onClick={() => setCreateOpen(true)}
                    >
                        <LuPlus />
                    </IconButton>
                    <Button display={{ base: "none", md: "inline-flex" }} onClick={() => setCreateOpen(true)}>
                        <LuPlus />
                        New Warehouse
                    </Button>
                </>
            }

            <InputGroup
                flex="1"
                minW={{ base: "0", md: "200px" }}
                order={{ base: 3, md: 0 }}
                w={{ base: "100%", md: "auto" }}
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

            <FilterMenu onApply={onFilters} />
            <CreateWarehouse open={createOpen} onClose={() => setCreateOpen(false)} />
        </Flex>
    )
}

export default SearchBar