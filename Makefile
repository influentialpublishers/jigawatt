APP_BIN=./bin
NODE_BIN=./node_modules/.bin

install:
	npm install

test:
	${NODE_BIN}/istanbul cover ${NODE_BIN}/_mocha test

test-nocov:
	${NODE_BIN}/mocha test

.PHONY: install test test-nocov
