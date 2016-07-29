[![Build Status](https://travis-ci.org/influentialpublishers/jigawatt.svg?branch=master)](https://travis-ci.org/influentialpublishers/jigawatt)
[![Coverage Status](https://coveralls.io/repos/github/influentialpublishers/jigawatt/badge.svg?branch=master)](https://coveralls.io/github/influentialpublishers/jigawatt?branch=master)
[![codecov](https://codecov.io/gh/influentialpublishers/jigawatt/branch/master/graph/badge.svg)](https://codecov.io/gh/influentialpublishers/jigawatt)
[![Code Climate](https://codeclimate.com/github/influentialpublishers/jigawatt/badges/gpa.svg)](https://codeclimate.com/github/influentialpublishers/jigawatt)

# jigawatt
Influential's Functional, Promise-based Express Middleware

## Installation
`npm install jigawatt`

## Middleware Structure

### Properties
Jigawatt Middleware must consist of at least one of three properties:
- `awesomize`: `(Validator -> AwesomizeSpec) -> Request -> Object a`
  - validates/sanitizes the request to initialize the `data` object
  - _for more info on `awesomize`, see https://www.npmjs.com/package/awesomize_

- `io`: `Request, Data -> Object a`
  - returns an object that is merged into `req.data`

- `transform`: `Request, Data -> Object a`
  - returns an object to become the new `req.data` value

### Example Middleware
```
const _         = require('ramda')
const Bluebird  = require('bluebird')

const Order = require('../domain/order.js')

const getById = {
  awesomize: (v) => ({
    order_id: {
      read: _.path(['params', 'orderId'])
    , validation: [ v.required ]
    }
  })

  io: (req, data) => {
    return Bluebird.props({
      order : Order.getById(data.order_id)
    })
  }
};

const uniteDetails = {
  transform: (req, data) => {
    return {
      order     : data.order
    , customer  : data.customer
    , product   : data.product
    , shipping  : data.shipping  
    }
  }
}

module.exports = {
  getById
, uniteDetails
}
```


## Example Usage

```
const router     = require('express').Router()
const JW         = require('jigawatt')

// MIDDLEWARE
const Order      = require('../middleware/order.js')
const Customer   = require('../middleare/customer.js')
const Product    = require('../middleware/product.js')
const Shipping   = require('../middleare/shipping.js')


// ROUTES
router.get('order/:orderId', JW(Order.getById));

router.get('order/:orderId/detail', JW(

  [ Order.getById             // call all of these promise
  , Customer.getByOrderId     // functions at the same time
  , Product.getByOrderId      // and merge request.data when
  , Shipping.getByOrderId     // all are complete
  ]

, Order.uniteDetails          // transform-only middleware
                              // to aggregate details and
                              // present to user
))
```

