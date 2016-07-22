
const _ = require('ramda');


const throwMiddlewareNotFunction = (index) => {
  throw TypeError(`All middleware given must be functions - index: ${index}`);
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


const testMiddleware = (middleware) => middleware.forEach((mw, index) => {
  return _.cond([
    [ _.is(Function),   _.always(null) ]
  , [ Array.isArray,    testMiddlewareArray(index) ]
  , [ _.T,              () => throwMiddlewareNotFunction(index) ]
  ])(mw);
});


