BR := $(shell git branch | grep \* | cut -d ' ' -f2-)
bump-patch:
	bumpversion patch

bump-minor:
	bumpversion minor

to_master:
	@echo $(BR)
	git checkout master && git merge $(BR) && git checkout $(BR)
