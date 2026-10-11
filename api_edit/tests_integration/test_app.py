import json
import logging
import subprocess
import urllib.request
from collections.abc import AsyncGenerator, Mapping, Sequence
from pathlib import Path
from types import MappingProxyType, TracebackType
from typing import Self

import pytest

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------------------

# Trying to do async http requests seems impossible due to multiple event loops
# Degrading to plain blocking python until I can come up with a better plan

type JsonPrimitives = str | int | float | bool | None
type JsonObject = Mapping[str, Json | JsonPrimitives]
type JsonSequence = Sequence[Json | JsonPrimitives]
type Json = JsonObject | JsonSequence


def request(
    url: str,
    method: str = "GET",
    headers: Mapping[str, str] = MappingProxyType({}),
    data: bytes | None = None,
) -> bytes:
    request = urllib.request.Request(url=url, method=method, data=data, headers=headers)  # type: ignore
    with urllib.request.urlopen(request) as f:
        return f.read()


def request_json(
    url, method="GET", headers: Mapping[str, str] = MappingProxyType({}), data=None
) -> Json:
    headers = {"content-type": "text/javascript"} | headers  # type: ignore
    return json.loads(request(url, method, headers, data))


# ------------------------------------------------------------------------------


class EditService:
    def __init__(
        self,
        EDIT_ENDPOINT: str,
        PATH_SOURCE: Path,
    ):
        self.EDIT_ENDPOINT = EDIT_ENDPOINT
        self.PATH_SOURCE = PATH_SOURCE
        self.tempfile_prefix = "_api_edit.pytest"

    def __enter__(self) -> Self:
        # Init git repo (should be null operation if already init'ed)
        assert self._git(("init",)).returncode == 0
        # Setup git user if one if not already setup
        git_user_email_result = self._git(("config", "user.email"))
        if git_user_email_result.returncode != 0:
            logger.info("setting up: git config  user")
            self._git(("config", "user.email", "you@example.com"))
            self._git(("config", "user.name", "Your Name"))

        # Create tempfiles
        txt = self.PATH_SOURCE.joinpath(self.tempfile_prefix + ".txt")
        srt = self.PATH_SOURCE.joinpath(self.tempfile_prefix + ".srt")
        txt.write_text("fake tags")
        srt.write_text("fake srt")

        return self

    def __exit__(
        self,
        exctype: type[BaseException] | None,
        excinst: BaseException | None,
        exctb: TracebackType | None,
    ) -> bool | None:
        # Teardown_tempfiles
        for file in self.PATH_SOURCE.iterdir():
            if file.name.startswith(self.tempfile_prefix):
                file_relative = str(file.relative_to(self.PATH_SOURCE))
                git_rm_result = self._git(("rm", "--force", file_relative))
                if git_rm_result.returncode == 0:
                    self._git(("commit", file_relative, "--message", __name__))
                file.unlink(missing_ok=True)
        return True

    def _git(self, cmds: Sequence[str]) -> subprocess.CompletedProcess:
        return subprocess.run(
            ("git", *cmds), cwd=self.PATH_SOURCE, check=False, capture_output=True
        )

    @property
    async def index(self) -> str:
        return request(self.EDIT_ENDPOINT + "/api/edit/").decode("utf8")

    @property
    async def files(self) -> Sequence[str]:
        return request_json(self.EDIT_ENDPOINT + "/api/edit/files.json")  # type: ignore

    def get_file(self, filename: str) -> str:
        return request(
            self.EDIT_ENDPOINT + "/api/edit/file/" + filename.strip("/")
        ).decode("utf8")

    def post_file(self, filename: str, **contents: str) -> None:
        request(
            self.EDIT_ENDPOINT + "/api/edit/file/" + filename.strip("/"),
            method="POST",
            data=json.dumps(contents).encode(),
        )

    def file_history(self, filename: str) -> Sequence[str]:
        # Old manual version system
        # Old version of the file are kept in files with a new suffix
        # return tuple(f.read_text() for f in self.PATH_SOURCE.glob(filename + "*"))

        # `git` version history
        return (
            self._git(("show", f"HEAD~1:{filename}")).stdout.decode("utf8"),
            self._git(("show", f"HEAD:{filename}")).stdout.decode("utf8"),
        )


@pytest.fixture(scope="session")
async def edit_service(
    EDIT_ENDPOINT: str,
    PATH_SOURCE: Path,
) -> AsyncGenerator[EditService]:
    with EditService(EDIT_ENDPOINT, PATH_SOURCE) as edit_service:
        yield edit_service


async def test_index(edit_service: EditService) -> None:
    index = await edit_service.index
    assert "<html>" in index


async def test_files(edit_service: EditService) -> None:
    files = await edit_service.files
    files = [f for f in files if f.startswith(edit_service.tempfile_prefix)]
    assert files


async def test_file_get(edit_service: EditService) -> None:
    assert edit_service.get_file(edit_service.tempfile_prefix + ".txt") == "fake tags"
    assert edit_service.get_file(edit_service.tempfile_prefix + ".srt") == "fake srt"


async def test_file_post(edit_service: EditService) -> None:
    filename = edit_service.tempfile_prefix + ".txt"

    old_content = edit_service.get_file(filename)

    edit_service.post_file(filename, content="New content")
    new_content = edit_service.get_file(filename)
    assert old_content != new_content
    assert new_content == "New content"

    assert frozenset(edit_service.file_history(filename)) >= frozenset(
        (old_content, new_content)
    )
