#!make
include .env

DOCKER_IMAGE:=api_edit
# PATH_SOURCE:= in `.env` file
DOCKER_RUN:=docker run --rm --volume ${PATH_SOURCE}:/media/source:rw --publish 8000:8000

run:
	uv run litestar run --debug --reload --reload-include 'edit/**'
test:
	uv run pytest

build_docker:
	docker build --tag ${DOCKER_IMAGE} .
build_docker_with_test_dependencies:
	docker build --tag ${DOCKER_IMAGE} --target test .
run_docker: build_docker
	${DOCKER_RUN} ${DOCKER_IMAGE}
shell_docker: build_docker_with_test_dependencies
	${DOCKER_RUN} -it ${DOCKER_IMAGE} /bin/sh
test_docker:
	docker compose --file compose.test.yml run --build --rm test

clean:
	docker image rm ${DOCKER_IMAGE} --force
	rm -rf \
		.venv \
