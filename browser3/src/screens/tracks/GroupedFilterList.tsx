import { List } from "@/components";
import { normalise_cmp } from "@/utils";

import { FilterList } from "./FilterList";
import { FilterListGroupHeader } from "./FilterListGroupHeader";

import styles from "./GroupedFilterList.module.scss";

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
                .map((group) =>
                    group === expanded ? (
                        <div key={group} className={styles.filterListGroup}>
                            <FilterListGroupHeader
                                filter={group}
                                count={Object.keys(filters[group]).length}
                                expanded={true}
                                setExpanded={setExpanded}
                            >
                                {group}
                            </FilterListGroupHeader>
                            <FilterList
                                heading={heading}
                                filters={filters[group]}
                                setFilters={setFilters}
                                setExpanded={setExpanded}
                            />
                        </div>
                    ) : (
                        <FilterListGroupHeader
                            key={group}
                            filter={group}
                            count={Object.keys(filters[group]).length}
                            expanded={false}
                            setExpanded={setExpanded}
                        >
                            {group}
                        </FilterListGroupHeader>
                    ),
                )}
        </List>
    );
}
