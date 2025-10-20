BR := $(shell git branch | grep \* | cut -d ' ' -f2-)
bump-patch:
	bumpversion patch

bump-minor:
	bumpversion minor

to_master:
	@echo $(BR)
	git checkout master && git merge $(BR) && git checkout $(BR)

push:
	git push origin master --tags

travis-trigger:
	curl -vv -s -X POST \
		-H "Content-Type: application/json" \
		-H "Accept: application/json" \
		-H "Travis-API-Version: 3" \
		-H "Authorization: token $$TRAVIS_TOKEN" \
		-d '{ "request": { "branch":"$(br)" }}' \
		https://api.travis-ci.com/repo/$(subst $(DEL),$(PERCENT)2F,$(repo))/requests

# common
# --build-arg NPM_CONFIG_REGISTRY_ARG=http://host.docker.internal:4873/ 

build:

	docker build --platform linux/amd64  -t web-sdk .

# latest

tag-latest:
	docker tag web-sdk rockstat/web-sdk:latest

push-latest:
	docker push rockstat/web-sdk:latest


# ng

tag-ng:
	docker tag web-sdk rockstat/web-sdk:ng

push-ng:
	docker push rockstat/web-sdk:ng

all-ng: build tag-ng push-ng


#ng-dev

build-ng-dev:
	docker build -t web-sdk:ng-dev .

tag-ng-dev:
	docker tag web-sdk rockstat/web-sdk:ng-dev

push-ng-dev:
	docker push rockstat/web-sdk:ng-dev

all-ng-dev: build-ng-dev tag-ng-dev push-ng-dev

