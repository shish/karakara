import { faCircleMinus, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FAIcon } from "@shish2k/react-faicon";

import { normalise_cmp } from "@/utils";
import { List, ListItem } from "@/components";

import { FilterList } from "./FilterList";

export function GroupedFilterList({
    heading,
    filters,
    expanded,
    setExpanded,
    setFilters,
}: {
    heading: string;
    filters: Record<string, Record<string, number>>;
    expanded: string | null;
    setExpanded: (value: string | null) => void;
    setFilters: (value: string[] | ((filters: string[]) => string[])) => void;
}): React.ReactElement {

    return (
        <List>
            {Object.keys(filters)
                .sort(normalise_cmp)
                .map((group) => [group, `${heading}-${group}`])
                .map(([group, key]) =>
                    <>
                        <ListItem
                            key={`${key}-heading`}
                            title={group}
                            count={Object.keys(filters[group]).length}
                            action={<FAIcon icon={expanded === key ? faCircleMinus : faCirclePlus} />}
                            onClick={(_) => setExpanded(expanded === key ? null : key)}
                        />
                        {expanded === key && <FilterList
                            key={`${key}-body`}
                            heading={heading}
                            filters={filters[group]}
                            setFilters={setFilters}
                            setExpanded={setExpanded}
                        />}
                    </>
                )}
        </List>
    );
}
