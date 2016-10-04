# jigawatt

[![Build Status](https://travis-ci.org/influentialpublishers/jigawatt.svg?branch=master)](https://travis-ci.org/influentialpublishers/jigawatt)
[![Coverage Status](https://coveralls.io/repos/github/influentialpublishers/jigawatt/badge.svg?branch=master)](https://coveralls.io/github/influentialpublishers/jigawatt?branch=master)
[![codecov](https://codecov.io/gh/influentialpublishers/jigawatt/branch/master/graph/badge.svg)](https://codecov.io/gh/influentialpublishers/jigawatt)
[![Code Climate](https://codeclimate.com/github/influentialpublishers/jigawatt/badges/gpa.svg)](https://codeclimate.com/github/influentialpublishers/jigawatt)

Influential's Functional, Promise-based Express Middleware

### Table of Contents
**Status:** Required by default, optional for READMEs less than 100 lines.

**Requirements:**
- Must link to all Markdown sections in the file.
- Must start with the next section; do not include the title or Table of Contents headings.
- Must be at least one-depth: must capture all `##` headings.

## Installation
`npm install jigawatt`

Then, require the module.

`const JW = require('jigawatt')`

## Usage
**Middleware Structure**

Jigawatt Middleware should contain at least one of the following three properties:

### awesomize
**`awesomize :: (Validator -> AwesomizeSpec) -> Request -> Object a`**

- Normalize/Sanitize/Validate an object
- Returns a promise
-


## Contribute
**Status**: Required.

**Requirements:**
- State where users can ask questions.
- State whether PRs are accepted.
- List any requirements for contributing; for instance, having a sign-off on commits.

**Suggestions:**
- Link to a contributing or contribute file -- if there is one.
- Be as friendly as possible.
- Link to the GitHub issues.
- Link to Code of Conduct. This is often in Contribute, or organization wide, so may not be necessary for each module.

## License
**MIT** &copy; Nathan Sculli
