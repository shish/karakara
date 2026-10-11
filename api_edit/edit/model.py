import logging
import subprocess
from collections.abc import Iterable, Sequence
from pathlib import Path
from typing import Generator

# import subprocess

logger = logging.getLogger(__name__)

FILE_EXTS = (".txt", ".srt")


class FileModel:
    def __init__(
        self,
        path_source: Path,
        git_commit_on_write=False,
        file_exts: Sequence[str] = FILE_EXTS,
    ):
        self.path_source = path_source
        if not self.path_source.exists():
            raise Exception(f"{path_source} does not exist on filesystem")
        self.file_exts = file_exts
        if not next(iter(self.files), None):
            logger.warning(
                f"No files matching {self.file_exts=}. Is path_source correct? {self.path_source=}"
            )

        self.git_commit_on_write = git_commit_on_write
        if git_commit_on_write:
            git_user_email_result = self._git(("config", "user.email"))
            if git_user_email_result.returncode != 0:
                # I wanted this to be an Exception,
                # but because of shared volume state in test startup race, I've had to make this a logged.error.
                # Suggestions welcome.
                logger.error(
                    f"{path_source=} is not managed by `git` but {git_commit_on_write=}"
                    "This can happen in tests, but is a problem for production."
                )
        if not git_commit_on_write:
            logger.warning(
                "Will not be running post_write hook to backup changes with `git`."
                "This option should be on for production."
            )

    def _git(self, cmds: Sequence[str]) -> subprocess.CompletedProcess:
        if not self.git_commit_on_write:
            logging.debug("preventing git %s", cmds)
            return subprocess.CompletedProcess(cmds, 0)
        return subprocess.run(("git", *cmds), cwd=self.path_source, check=False)

    @property
    def files(self) -> Iterable[Path]:
        def _files(path: Path) -> Generator[Path]:
            for root, dirs, files in path.walk(follow_symlinks=False):
                if any(
                    part.startswith(prefix)
                    for part in root.relative_to(path).parts
                    for prefix in (".", "_")
                ):
                    continue  # Skip folders starting with `.` or `_`
                for file_str in files:
                    file = root.joinpath(file_str)
                    if file.suffix not in self.file_exts:
                        continue  # Skip files without expected file_ext
                    yield file.relative_to(path)

        return sorted(_files(self.path_source))

    def _get_file(self, path: Path) -> Path:
        file_path = self.path_source.joinpath(path)
        if not file_path.exists():
            raise FileNotFoundError(path)
        return file_path

    def _get_local_filesystem_backup_path(self, path: Path) -> Path:
        # Currently unused
        # Cute little little local filesystem backup rotator
        return next(
            iter(
                sorted(
                    (
                        path.with_name(path.name + f".{backup_number}.old")
                        for backup_number in range(3)
                    ),
                    key=lambda path: path.stat().st_mtime if path.exists() else 0,
                )
            )
        )

    def _commit_change(self, path: Path) -> None:
        path_relative = str(path.relative_to(self.path_source))
        self._git(("add", path_relative))
        self._git(("commit", path_relative, "--message", f"{__name__} {path_relative}"))

    def file_read(self, path: Path) -> str:
        logger.debug("file_read - %s", path)
        return self._get_file(path).read_text()

    def file_write(self, path: Path, data: str) -> None:
        if self.file_read(path) == data:
            logger.debug("File content unchanged - abort save - %s", path)
            return
        file_path = self._get_file(path)

        # Old backup
        # file_path_backup = self._get_local_filesystem_backup_path(file_path)
        # file_path.copy(file_path_backup)

        # git commit: should be null op for the files existing state, make sure the original state is version controlled
        self._commit_change(file_path)
        file_path.write_text(data)
        logger.debug("file_write - %s", path)
        self._commit_change(file_path)
