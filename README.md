# jigawatt

[![Build Status](https://travis-ci.org/influentialpublishers/jigawatt.svg?branch=master)](https://travis-ci.org/influentialpublishers/jigawatt)
[![Coverage Status](https://coveralls.io/repos/github/influentialpublishers/jigawatt/badge.svg?branch=master)](https://coveralls.io/github/influentialpublishers/jigawatt?branch=master)
[![codecov](https://codecov.io/gh/influentialpublishers/jigawatt/branch/master/graph/badge.svg)](https://codecov.io/gh/influentialpublishers/jigawatt)
[![Code Climate](https://codeclimate.com/github/influentialpublishers/jigawatt/badges/gpa.svg)](https://codeclimate.com/github/influentialpublishers/jigawatt)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

Influential's Functional, Promise-based Express Middleware

### Table of Contents
- [Installation](#installation)
- [Using Jigawatt](#using-jigawatt)
  - [Basic Usage](#basic-usage-example)
  - [Middleware Structure](#middleware-structure)
    - [awesomize](#awesomize)
    - [io](#io)
    - [transform](#transform)
- [Contribute](#contribute)
- [License](#license)

## Installation
`npm install jigawatt --save`

## Using Jigawatt

First, require the module.

`const JW = require('jigawatt')`

For this walkthrough, we'll also be using Ramda.

`const R = require('ramda')`

### Basic Usage Example

Consider the following Express endpoint:

```
app.get('/order/:id', (req, res)=> {

  const data = {
    order    : db.getById(req.params.id)              // Assuming that
  , product  : db.getProductByOrderId(req.params.id)  // this is data
  , customer : db.getCustomerByOrderId(req.params.id) // from database
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

getOrder(data, result)
  .then ((orderDetails) => {
    // Do what you will with the data
  })
  .catch ((err) => {
    // Handle the error
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
- For more detailed documentation about awesomize, visit the [awesomize documentation](https://github.com/influentialpublishers/awesomize)

Awesomize has four components, all of which are optional: **read -> sanitize -> validate -> normalize**

The **`read`** component has access to the entire object passed to the awesomize function. Here, we'll use Ramda to target a specific value of the object passed:

```
awesomize: (v) => ({
  id : {
    read : R.path([ 'order', 'id' ])

...
```

**`sanitize`** is an awesomize component that can manipulate the data before it is validated.

```
awesomize: (v) => ({
  id : {
    read : R.path([ 'order', 'id' ])
  , sanitize : [ R.drop(2) ]

...
```

**`validate`** is awesomize's built-in validator. Awesomize's `validate` component has a few built-in validator methods such as `required`, `isInt`, `isFunction`, etc... that are passed to our function as `v`.

```
awesomize: (v) => ({
  id : {
    read : R.path([ 'order', 'id' ])
  , validate : [ v.required, v.isInt ]

...
```

We can also chain validation methods, as seen above. For more info on awesomize validators, visit the [documentation](https://github.com/influentialpublishers/awesomize#built-in-validators)

**`normalize`** is the last awesomize component, called after the data has been validated.

```
awesomize: (v) => ({
  id : {
    read      : R.path([ 'order', 'id' ])
  , validate  : [ v.required, v.isInt ]
  , normalize : [ R.inc ]
  }
})
```

A complete awesomize function can awesomize more than one value:

```
awesomize: (v) => ({
  id : {
    read      : R.path([ 'order', 'id' ])
  , validate  : [ v.required, v.isInt ]
  }
, product  : { sanitize : [ R.trim ] }
, customer : { validate : [ v.required ] }
})
```


#### io
**`io :: Request -> Data -> Object a`**

- Can merge new data into object
- Returns a promise

```
io: (req, data) => ({
    orderId  : data.id
  , product  : data.product
  , customer : data.customer
  , quantity : dao.getQuantityByOrderId(data.id) // Grab value from database
  })
```

Where `data.__` represents data that has been passed from our awesomize function.


#### transform
**`transform :: Request -> Data -> Object a`**

- Can piece together data into a new object

Given an input object such as (the input will have already passed through awesomize):

```
data = {
  id : 1234
, product : {
    productId : 1234
  , productName : "Mechanical Pencil"

    ...
  }
, customer : {
    customerId : 1234
  , customerName : "Jabroni Seagull"

    ...
  }

  ...
}
```

We can orchestrate how we want to structure the data

```
transform: (req, data) => ({
    orderId  : data.id
  , product  : data.product
  , customer : data.customer
  })
```

And we can expect an output of

```
{ "orderId"  : "1234"
, "product"  : "Mechanical pencil"
, "customer" : "Jabroni Seagull"
}
```

## Contribute
If you find issues with Jigawatt, we encourage you to open an issue ticket on the [issues page](https://github.com/influentialpublishers/jigawatt/issues). Please open a ticket on the issues page before submitting any pull requests!

## License
**MIT** &copy; Influential
