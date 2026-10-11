#!/bin/sh
mkdir /tmp/user
export HOME=/tmp/user
git config --global user.email api_edit@karakara.uk
git config --global user.name api_edit
git config --global --add safe.directory /media/source
uv run litestar run
