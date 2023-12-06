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

build:
	docker build -t web-sdk .

push-latest:
	docker tag web-sdk rockstat/web-sdk:latest
	docker push rockstat/web-sdk:latest

push-ng:
	docker tag web-sdk rockstat/web-sdk:ng
	docker push rockstat/web-sdk:ng