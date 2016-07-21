
const _         = require('ramda');
const awesomize = require('./lib/awesomize');

const throwMiddlewareNotFunction = (index) => {
  throw TypeError(`All middleware given must be functions - index: ${index}`);
};

const throwMiddlewareEmpty = () => {
  throw TypeError('You must provide at least one function');
};

const testMiddlewareArray = _.curry((index, mw) => {
  try {
    return testMiddleware(mw);

  } catch (e) {
    const result = /((\d:?)+)/.exec(e.message);

    if (_.isNil(result)) {
      throw new ReferenceError(`Unexpected Error: ${e.message}`);
    }

    const parent_index = result[1];

    throwMiddlewareNotFunction(index + ':' + parent_index);
  }
});


const run = _.curry((req, middleware) => {
  const current = _.head(middleware);
  const spec    = awesomize(req, current.awesomize);

  return spec(req)
});


const testMiddleware = (middleware) => middleware.forEach((mw, index) => {
  return _.cond([
    [ _.is(Function),   _.always(null) ]
  , [ Array.isArray,    testMiddlewareArray(index) ]
  , [ _.T,              () => throwMiddlewareNotFunction(index) ]
  ])(mw);
});

const Middleware = (...middleware) => {
  if(middleware.length < 1) throwMiddlewareEmpty();


  return (req, res, next) => {

    run(req, middleware)

    .then(res.json.bind(res))

    .catch(next);

  };

};


module.exports = Middleware;
