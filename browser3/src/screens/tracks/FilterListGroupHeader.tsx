import { faCircleMinus, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FAIcon } from "@shish2k/react-faicon";

import { ListItem } from "@/components";

export function FilterListGroupHeader({
    filter,
    count,
    expanded,
    setExpanded,
    children,
}: {
    filter: string;
    count: number;
    expanded: boolean;
    setExpanded: (value: string | null) => void;
    children: React.ReactNode;
}): React.ReactElement {
    return (
        <ListItem
            title={children}
            count={count}
            action={<FAIcon icon={expanded ? faCircleMinus : faCirclePlus} />}
            onClick={(_) => setExpanded(expanded ? null : filter)}
        />
    );
}
