import asyncio
from typing import Callable
from collections.abc import Awaitable

import ujson as json
from sanic.log import logger as log
from .api_types import App


async def _background_tracks_update_event(app: App) -> None:
    log.debug("`tracks.json` check mtime")

    if app.ctx.track_manager.has_tracks_updated:
        log.info("`tracks.json` reload")
        app.ctx.track_manager.reload_tracks()

    # update MQTT every time - broadcasting a no-change update is a tiny
    # waste of resources, but it makes sure we broadcast an update even
    # if the update happened while the app was offline
    log.info("`tracks.json` mqtt event")
    await app.ctx.mqtt.publish(
        "global/tracks-updated",
        json.dumps({"tracks_json_mtime": app.ctx.track_manager.mtime}),
        retain=True,
    )


tracks_update_semaphore = asyncio.Semaphore(1)


async def background_tracks_update_event(
    app: App,
    _asyncio_sleep: Callable[[int], Awaitable[None]] = asyncio.sleep,
) -> None:
    # A background task is created for each sanic worker - Only allow one background process by aborting if another task has the semaphore
    # WARNING?! I don't think this works. Workers are NOT async tasks, they are threads, so the asyncio.semaphore does nothing
    if tracks_update_semaphore.locked():
        log.debug("`tracks.json` background_tracks_update_event already active - cancel task")
        return
    async with tracks_update_semaphore:
        log.info("background_tracks_update_event started")
        while app.config.BACKGROUND_TASK_TRACK_UPDATE_ENABLED:
            await _background_tracks_update_event(app)
            await _asyncio_sleep(60)
