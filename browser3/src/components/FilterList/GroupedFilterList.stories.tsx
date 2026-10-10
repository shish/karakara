import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { useState } from "react";
import { GroupedFilterList } from "./GroupedFilterList";

const meta = {
    title: "Components/GroupedFilterList",
    component: GroupedFilterList,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof GroupedFilterList>;

export default meta;
type Story = StoryObj<typeof meta>;

function GroupedFilterListWrapper(props: any) {
    const [filters, setFilters] = useState<string[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div>
            <GroupedFilterList
                {...props}
                expanded={expanded}
                setExpanded={setExpanded}
                setFilters={setFilters}
            />
            <div style={{ marginTop: "1em", padding: "1em" }}>
                <strong>Expanded group:</strong> {expanded || "none"}
                {filters.length > 0 && (
                    <>
                        <br />
                        <strong>Selected filters:</strong>
                        <ul>
                            {filters.map((filter) => (
                                <li key={filter}>{filter}</li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}

export const Default: Story = {
    render: (props) => <GroupedFilterListWrapper {...props} />,
    args: {
        heading: "Genre",
        filters: {
            "Rock": {
                "The Beatles": 45,
                "Queen": 38,
                "David Bowie": 32,
                "The Rolling Stones": 28,
            },
            "Pop": {
                "Michael Jackson": 42,
                "Madonna": 35,
                "Prince": 28,
            },
            "Metal": {
                "Iron Maiden": 25,
                "Black Sabbath": 20,
                "Metallica": 18,
            },
            "Jazz": {
                "Miles Davis": 15,
                "John Coltrane": 12,
                "Billie Holiday": 10,
            },
        },
        expanded: null,
        setExpanded: () => {},
        setFilters: () => {},
    },
};
