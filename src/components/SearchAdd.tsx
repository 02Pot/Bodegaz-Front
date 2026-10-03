import { useDebouncedValue } from "@/lib/hooks/useDebounced";
import { useAuth } from "@/lib/provider";
import { Button, CloseButton, Flex, Input, InputGroup } from "@chakra-ui/react";
import { useState } from "react";
import { LuPlus, LuSearch } from "react-icons/lu";
import { FilterMenu, type Filters } from "./Filter";

const SearchBar = () => {
    const { currentUser } = useAuth();
    const [filters, setFilters] = useState<Filters>();
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search)

    const isBuyer = currentUser?.userType === 'BUYER_ROLE'

    return(
        <Flex gap="12px">
            {isBuyer &&
                <Button>
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

        </Flex>
    )
}

export default SearchBar