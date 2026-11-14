import { ServerTimeContext } from "@shish2k/react-use-servertime";
import { useContext } from "react";
import { List, LyricsViewer } from "@/components";
import { RoomContext } from "@/providers/room";
import { ServerContext } from "@/providers/server";
import { QueueItemRender } from "./QueueItemRender";

export function NowPlaying(): React.ReactElement {
    const { tracks } = useContext(ServerContext);
    const { queue } = useContext(RoomContext);
    const { now } = useContext(ServerTimeContext);

    if (queue.length === 0) {
        return <h2>Queue Empty</h2>;
    }

    const trackTime = queue[0].start_time
        ? now - queue[0].start_time
        : undefined;

    return (
        <section>
            <List>
                <QueueItemRender
                    item={queue[0]}
                    show_time={true}
                    track={tracks[queue[0].track_id]}
                />
                <LyricsViewer
                    key={queue[0].track_id}
                    track={tracks[queue[0].track_id]}
                    variant={queue[0].subtitle_variant}
                    listItem={true}
                    trackTime={trackTime}
                />
            </List>
        </section>
    );
}
