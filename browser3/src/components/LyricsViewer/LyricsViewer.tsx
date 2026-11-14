import { useEffect, useState } from "react";

import { useApi } from "@/hooks/api";
import type { Subtitle, Track } from "@/types";
import { attachment_path } from "@/utils";

import styles from "./LyricsViewer.module.scss";

export function LyricsViewer({
    track,
    variant,
    listItem = false,
    trackTime,
}: {
    track: Track;
    variant: string | null;
    listItem?: boolean;
    trackTime?: number;
}): React.ReactElement | null {
    const [lyrics, setLyrics] = useState<Subtitle[]>([]);
    const { request } = useApi();

    useEffect(() => {
        const subtitleAttachment = track.attachments.subtitle?.find(
            (a) => a.mime === "application/json" && a.variant === variant,
        );
        if (subtitleAttachment) {
            request<Subtitle[]>({
                url: attachment_path(subtitleAttachment),
                options: { credentials: "omit" },
                onAction: (result) => setLyrics(result),
            });
        }
    }, [request, track, variant]);

    const isActive = (line: Subtitle): boolean =>
        trackTime !== undefined &&
        trackTime >= line.start &&
        trackTime < line.end;

    if (lyrics.length === 0) {
        return null;
    } else {
        return listItem ? (
            <li>
                <div className={styles.lyrics}>
                    {lyrics.map((line, n) => (
                        <div
                            key={n}
                            className={isActive(line) ? styles.active : undefined}
                        >
                            {line.text}
                        </div>
                    ))}
                </div>
            </li>
        ) : (
            <>
                <h2>Lyrics</h2>
                <div className={styles.lyrics}>
                    {lyrics.map((line, n) => (
                        <div
                            key={n}
                            className={isActive(line) ? styles.active : undefined}
                        >
                            {line.text}
                        </div>
                    ))}
                </div>
            </>
        );
    }
}
