
const _           = require('ramda');
const PropsCheck  = require('props-check')
const Helper      = require('./helper')

const SPEC = {
  io        : 'Function'
, transform : 'Function'
, awesomize : 'Function'
}

const throwMiddlewareEmpty = () => {
  throw TypeError('You must provide at least one middleware');
};

const throwMiddlewareNotObject = (index) => { 
  throw TypeError(`All middleware given must be objects - index: ${index}`);
};

const typeCheckArray = _.curry((index, mw) => {
  if (_.isEmpty(mw)) throwMiddlewareNotObject(index)

  try {
    return typeCheck(mw);

  } catch (e) {

    const result = /((\d:?)+)/.exec(e.message);
    const parent_index = result[1];

    throwMiddlewareNotObject(index + ':' + parent_index);
  }
});


const typeCheck = (middleware) => middleware.forEach((mw, index) => {
  return _.cond([
    [ Helper.isObject,  _.always(null) ]
  , [ Array.isArray,    typeCheckArray(index) ]
  , [ _.T,              () => throwMiddlewareNotObject(index) ]
  ])(mw);
});


// throwPropsCheckError : Middleware -> Error
const throwPropsCheckError = (config) => {
  throw new Error(PropsCheck.human(SPEC, config))
}


// checkProps : Middleware -> Maybe Error
const checkProps = (config) => { return _.compose(
    _.when(_.any(Helper.isNotEmpty), throwPropsCheckError.bind(null, config))
    , _.values
    , PropsCheck(SPEC)
  )(config)
}


const propsCheck = _.forEach(checkProps)

const testMiddleware = (middleware) => {
  if(middleware.length < 1) throwMiddlewareEmpty();
  typeCheck(middleware);
  propsCheck(_.flatten(middleware))
}


module.exports = {
  testMiddleware
}
