tests := $(shell find . -name 'test.js' ! -path "*node_modules/*")
reporter = spec
opts =
test:
	@node_modules/mocha/bin/mocha --reporter ${reporter} ${opts} ${tests}

.PHONY: test