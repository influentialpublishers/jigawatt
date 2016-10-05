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

## Using Jigawatt

### Basic Usage Example

Consider the following endpoint:

```
app.get('/order/:id', (req, res)=> {

  const data = {
    order    : db.getById(req.params.id)
  , product  : db.getProductByOrderId(req.params.id)
  , customer : db.getCustomerByOrderId(req.params.id)
  }

  const getOrder = JW(formatOrder, data)
      , result   = { json : (data) => data }

...
```

Jigawatt middleware functions, such as `formatOrder` in this case, are created to handle the incoming data:

```
const formatOrder = {
  awesomize: (v) => ({
    id : {
      read : R.path([ 'order', 'id' ])
    , validate : [ v.required, v.isInt ]
    }
  , product  : { sanitize : [ R.trim ] }
  , customer : { validate : [ v.required ] }
  })

, io: (req, data) => ({
    orderId  : data.id
  , product  : data.product
  , customer : data.customer
  })
}
```

This will return a promise which, when resolved, will be a new beautified object.

```
...

Promise
  .resolve(
    getOrder(data, result)
  )
  .then((orderDetails) => {
    // do what you will with the data
  })
```
**Example output:**
```
{ "orderId"  : "1234"
, "product"  : "Mechanical pencil"
, "customer" : "Jabroni Seagull"
}
```

This might be a bit overwhelming at first sight, so let's break it down in a bit more detail...

### Middleware Structure

Jigawatt Middleware expects at least one of the following three properties:

#### awesomize
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
