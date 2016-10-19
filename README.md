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
    - [Summary](#summary)
  - [Extras](#extras)
    - [Promisify](#promisify)
    - [Pipe](#pipe)
    - [Branch](#branch)
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

For this example, we have a poll and poll responses stored in a database.

Jigawatt middleware functions, such as `getPollResults` in this case, are created to sanitize, validate, and/or normalize the incoming data (`awesomize`), then use that awesomized data to query a database (`io`), and lastly, format the results to our liking and return the output (`transform`).

```javascript
const getPollResults = {
  awesomize: (v) => ({
    pollId : {
      read     : R.path([ 'params', 'pollId' ])
    , sanitize : [ R.toLower ]
    , validate : [ v.required ]
    }
  })

, io: (req, data) => ({
    poll      : db.Poll.findOne({ _id: data.pollId })
  , responses : db.Vote.find({ poll_id: data.pollId })
  })

, transform: (req, data) => ({
    poll    : data.poll.title
  , results : tallyVotes(
                getCity(data.poll)
              , getAnswer(data.responses)
              )
  })
}
```

Our Jigawatt middleware can then handle a given Express route. Consider the following endpoint:

```javascript
...

app.get('/poll/:pollId', JW(getPollResults))
```

**Example output:**
```javascript
{
	"poll": "What is your favorite city?",
	"results": [ { "Juneau": 2 }
             , { "Vladivostok": 3 }
             , { "Redding": 1	}
             , { "Wilmington": 0 }
             , { "Galveston": 2	}
             ]
}
```

This might be a bit overwhelming at first sight, so let's break it down in a bit more detail...

### Middleware Structure

Jigawatt Middleware expects at least one of the following three properties:

#### awesomize
**`awesomize :: Validator -> Request -> Object`**

- Normalize/Sanitize/Validate an object
- For more detailed documentation about awesomize, visit the [awesomize documentation](https://github.com/influentialpublishers/awesomize)

Awesomize has four components, all of which are optional: **read -> sanitize -> validate -> normalize**

The **`read`** component has access to the entire object passed to the awesomize function. Here, we'll use Ramda to target a specific value of the object passed:

```javascript
awesomize: (v) => ({
  id : {
    read : R.path([ 'order', 'id' ])

...
```

**`sanitize`** is an awesomize component that can manipulate the data before it is validated.

```javascript
awesomize: (v) => ({
  id : {
    read : R.path([ 'order', 'id' ])
  , sanitize : [ R.drop(2) ]

...
```

**`validate`** is a validator that is passed to our function as `v`.  Awesomize's `validate` component has a few built-in validator methods such as `required`, `isInt`, `isFunction`, etc...

```javascript
awesomize: (v) => ({
  id : {
    read : R.path([ 'order', 'id' ])
  , validate : [ v.required, v.isInt ]

...
```

We can also chain validation methods, as seen above. For more info on awesomize validators, visit the [documentation](https://github.com/influentialpublishers/awesomize#built-in-validators).

As a last note about `validate`, we can create our own custom validator functions as well:

```javascript
const isCorrectLength = (str) => R.equals(24, str.length)

...

awesomize: (v) => ({
  pollId : {
    sanitize : [ R.toLower ]
  , validate : [ isCorrectLength ]
  }

...
```

**`normalize`** is the last awesomize component, called after the data has been validated.

```javascript
awesomize: (v) => ({
  id : {
    read      : R.path([ 'order', 'id' ])
  , validate  : [ v.required, v.isInt ]
  , normalize : [ R.inc ]
  }
})
```

A complete awesomize function can awesomize more than one value:

```javascript
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
**`io :: Request -> Data -> Object`**

- Can merge new data into object
- Returns a promise

`io`'s primary use is to fetch data using the information passed to it from the awesomize function.  In the example below, we have `io` making two calls to two separate database tables.  Once resolved, `io` will pass the data fetched from the database along to the `transform` method.

```javascript
io: (req, data) => ({
    poll      : db.Poll.findOne({ _id: data.pollId })
  , responses : db.Vote.find({ poll_id: data.pollId })
  })
```


#### transform
**`transform :: Request -> Data -> Object`**

- Can piece together data into a new object

`transform` is used to structure the incoming data in a unique way.  Remember that `transform` is optional, and if omitted, the Jigawatt middleware simply returns the raw results.

```javascript
const getAnswer = (arr) => R.compose(
  R.map(R.dec)
, R.pluck('answer')
)(arr)

const getCity = (obj) => R.map(
  R.replace(/\,.*$/, '')
, obj.questions
)

const tallyVotes = (options, responses) => {
  // Tally total vote for a specific city
  return R.map((str) => {
    let ind = R.indexOf(str, options)

    let votes = R.compose(
      R.length
    , R.filter(R.equals(ind))
    )(responses)

    return R.assoc(str, votes, {})
  }, options)
}

...

transform: (req, data) => ({
    poll    : data.poll.title
  , results : tallyVotes(
                getCity(data.poll)
              , getAnswer(data.responses)
              )
  })
```

#### Summary
Our Jigawatt middleware was used to take an incoming ID, query two separate database tables for that ID, and format the results to our liking. The final output of our Jigawatt middleware looks like this:

```javascript
{
	"poll": "What is your favorite city?",
	"results": [ { "Juneau": 2 }
             , { "Vladivostok": 3 }
             , { "Redding": 1	}
             , { "Wilmington": 0 }
             , { "Galveston": 2	}
             ]
}
```

### Extras

#### Promisify
If you would like to use a Jigawatt middleware as a promise, you can use the `JW.promisify` method:

```javascript
const getSingleVote = {
  awesomize: (v) => ...
, io: (req, data) => ...
, transform: (req, data) => ...
}

...

const voteDetails = JW.promisify(getSingleVote)

...
voteDetails(data).then((result) => // do with the data what you will
```

#### Pipe
`JW.pipe` can be used to chain multiple Jigawatt middleware together into a single unit:

```javascript
const combinedJigawatts = JW.pipe(getPollResults, getSingleVote, ...)

app.get('/poll/:pollId', JW(combinedJigawatts))
```

#### Branch
`JW.branch` should be given a predicate, and two Jigawatt middlewares.  If the predicate function returns true, the first Jigawatt middleware is called. If false, the latter is called:

```javascript
const fetchUserDetails = JW(
  JW.branch(
    isAdmin         // Predicate
  , showAllData     // Called if predicate returns true
  , showMinimalData // Called if predicate returns false
  )
)
```

## Contribute
If you find issues with Jigawatt, we encourage you to open an issue ticket on the [issues page](https://github.com/influentialpublishers/jigawatt/issues). Please open a ticket on the issues page before submitting any pull requests!

## License
**MIT** &copy; Influential, Nathan Sculli
