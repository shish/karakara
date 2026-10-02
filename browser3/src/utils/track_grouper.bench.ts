import { test } from "vitest";

import { generateTracks } from "./test_data";
import * as grouper from "./track_grouper";

test("summarise_tags", async ({ bench }) => {
    const tracks = Object.values(generateTracks(10000));
    const subset = tracks.slice(0, 1000);

    await bench("full library", () => {
        grouper.summarise_tags(tracks);
    }).run();

    await bench("subset", () => {
        grouper.summarise_tags(subset);
    }).run();
});

test("suggest_next_filters", async ({ bench }) => {
    const summary = {
        macross: {
            "movie 1": 2,
            "movie 2": 1,
        },
        pokemon: {
            johto: 2,
        },
        artist: {
            "artist 1": 10,
            "artist 2": 20,
            "artist 3": 30,
        },
        category: {
            anime: 100,
            jpop: 50,
            game: 25,
        },
    };

    await bench("no filters", () => {
        grouper.suggest_next_filters([], summary);
    }).run();

    await bench("curated tag", () => {
        grouper.suggest_next_filters(["category:anime"], summary);
    }).run();

    await bench("tag having children", () => {
        grouper.suggest_next_filters(["from:macross"], summary);
    }).run();

    await bench("multiple filters", () => {
        grouper.suggest_next_filters(
            ["category:anime", "vocaltrack:on", "lang:jp"],
            summary,
        );
    }).run();
});

test("group_tracks", async ({ bench }) => {
    const tracks = Object.values(generateTracks(10000));
    const subset = tracks.slice(0, 1000);

    await bench("no filters", () => {
        grouper.group_tracks([], tracks);
    }).run();

    await bench("single filter", () => {
        grouper.group_tracks(["category:anime"], tracks);
    }).run();

    await bench("multiple filters", () => {
        grouper.group_tracks(["category:anime", "vocaltrack:on"], tracks);
    }).run();

    await bench("category:new", () => {
        grouper.group_tracks(["category:new"], tracks);
    }).run();

    await bench("subset", () => {
        grouper.group_tracks(["category:anime", "vocaltrack:on"], subset);
    }).run();
});
