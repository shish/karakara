import { test } from "vitest";

import { generateTracks } from "./test_data";
import * as finder from "./track_finder";

test("find_tracks", async ({ bench }) => {
    const tracks = Object.values(generateTracks(10000));
    const subset = tracks.slice(0, 1000);

    await bench("tags and search (full)", () => {
        finder.find_tracks(tracks, ["category:anime", "from:Macross"], "mac");
    }).run();

    await bench("tags and search (subset)", () => {
        finder.find_tracks(subset, ["category:anime", "from:Macross"], "mac");
    }).run();

    await bench("only tags (full)", () => {
        finder.find_tracks(tracks, ["category:anime", "from:Macross"], "");
    }).run();

    await bench("only tags (subset)", () => {
        finder.find_tracks(subset, ["category:anime", "from:Macross"], "");
    }).run();

    await bench("only search (full)", () => {
        finder.find_tracks(tracks, [], "macross");
    }).run();

    await bench("only search (subset)", () => {
        finder.find_tracks(subset, [], "macross");
    }).run();
});

test("apply_tags", async ({ bench }) => {
    const tracks = Object.values(generateTracks(10000));

    await bench("no tags", () => {
        finder.apply_tags(tracks, []);
    }).run();

    await bench("single tag", () => {
        finder.apply_tags(tracks, ["category:anime"]);
    }).run();

    await bench("multiple tags", () => {
        finder.apply_tags(tracks, [
            "category:anime",
            "from:Macross",
            "vocaltrack:on",
        ]);
    }).run();
});

test("apply_search", async ({ bench }) => {
    const tracks = Object.values(generateTracks(10000));

    await bench("empty query", () => {
        finder.apply_search(tracks, "");
    }).run();

    await bench("short query", () => {
        finder.apply_search(tracks, "mac");
    }).run();

    await bench("longer query", () => {
        finder.apply_search(tracks, "macross");
    }).run();

    await bench("multi-word query", () => {
        finder.apply_search(tracks, "macross gundam");
    }).run();
});
