import type { Meta, StoryObj } from "storybook-react-rsbuild";
import { useState } from "react";
import { FilterList } from "./FilterList";

const meta = {
    title: "Components/FilterList",
    component: FilterList,
    parameters: {
        layout: "padded",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof FilterList>;

export default meta;
type Story = StoryObj<typeof meta>;

function FilterListWrapper(props: any) {
    const [filters, setFilters] = useState<string[]>([]);
    const [_expanded, setExpanded] = useState<string | null>(null);

    return (
        <div>
            <FilterList
                {...props}
                setFilters={setFilters}
                setExpanded={setExpanded}
            />
            {filters.length > 0 && (
                <div style={{ marginTop: "1em", padding: "1em", backgroundColor: "#f5f5f5" }}>
                    <strong>Selected filters:</strong>
                    <ul>
                        {filters.map((filter) => (
                            <li key={filter}>{filter}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export const Default: Story = {
    render: (props) => <FilterListWrapper {...props} />,
    args: {
        heading: "Genre",
        filters: {
            "Rock": 125,
            "Pop": 98,
            "Metal": 67,
            "Jazz": 45,
            "Classical": 32,
        },
        setFilters: () => {},
        setExpanded: () => {},
    },
};
