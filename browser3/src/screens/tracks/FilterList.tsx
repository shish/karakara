import { faCircleChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FAIcon } from "@shish2k/react-faicon";

import { List, ListItem } from "@/components";
import { normalise_cmp } from "@/utils";

import styles from "./FilterList.module.scss";

function unThe(filter: string): string {
    if (filter.toLowerCase().endsWith(", the")) {
        return (
            filter.substring(filter.length - 3) +
            " " +
            filter.substring(0, filter.length - 5)
        );
    }
    return filter;
}

export function FilterList({
    heading,
    filters,
    setFilters,
    setExpanded,
}: {
    heading: string;
    filters: Record<string, number>;
    setFilters: (value: string[] | ((filters: string[]) => string[])) => void;
    setExpanded: (value: string | null) => void;
}): React.ReactElement {

    return (
        <List>
            {Object.keys(filters)
                .sort(normalise_cmp)
                .map((child) => (
                    <ListItem
                        key={child}
                        className={styles.addFilter}
                        title={child}
                        count={filters[child]}
                        action={<FAIcon icon={faCircleChevronRight} />}
                        onClick={(_) => {
                            setExpanded(null);
                            setFilters((fs: string[]) => [
                                ...fs,
                                `${heading}:${unThe(child)}`,
                            ]);
                        }}
                    />
                ))}
        </List>
    );
}
