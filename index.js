
const debug       = require('debug')('jigawatt');
const { inspect } = require('util');

const _         = require('ramda');
const Bluebird  = require('bluebird');
const awesomize = require('./lib/awesomize');
const Validate  = require('./lib/validate');

const defaultSpec = _.always(_.compose(Bluebird.resolve, _.prop('data')))


const awesomizeSpec = _.curry((req, spec) => awesomize(req, spec))


const getSpec = _.curry((current, req) => _.compose(
  _.ifElse(_.is(Function), awesomizeSpec(req), defaultSpec)
, _.prop('awesomize')
)(current));


const getIO = _.propOr((req, data) => data, 'io');


const getTransform = _.propOr((req, data) => data, 'transform');


const mergeDataIntoReq = (req) => _.compose(_.merge(req), _.objOf('data'));


const mergeIOData = (middleware, req) => _.compose(
  Bluebird.props
, _.merge(_.propOr({}, 'data', req))
, getIO(middleware).bind(middleware, req)
);


const mergeReqArray = (initial_req) => _.reduce((acc, x) => {
  acc.data = _.merge(acc.data, x.data)
  return acc;
}, initial_req);


const runSingle = _.curry((current, req) => _.composeP(
  mergeDataIntoReq(req)
, getTransform(current).bind(current, req)
, mergeIOData(current, req)
, getSpec(current, req)
)(req));


const runParallel = _.curry((current, req) => _.composeP(
  mergeReqArray(req)
, _.compose(Bluebird.all, _.map((x) => runSingle(x, req)))
)(current));


const rethrowError = (e) => { throw e; };


const run = _.curry(([current, ...rest], req) => _.composeP(
  (res) => _.length(rest) ? run(rest, res) : res.data
, _.ifElse(
    _.always(Array.isArray(current))
  , runParallel(current)
  , runSingle(current)
))(req).catch(rethrowError));


const Middleware = (...middleware) => {
  Validate.testMiddleware(middleware)

  return (req, res, next) =>
    run(middleware, req)

    .then( res.json.bind(res) )
    
    .catch(next);

};


Middleware.debug = (label) => ({
  transform: (req, data) => {
    const data_as_string = inspect(data);
    debug(`${label}: ${data_as_string}`);

    return data;
  }
});


Middleware.tap = (fn) => ({
  transform: (req, data) => Bluebird.resolve(fn(req, data)).return(data)
});


Middleware.branch = (predicate, ifTrue, otherwise) => ({
  transform: (req, data) =>
    Bluebird.resolve(predicate(req, data))

    .then((branch) => run([ branch ? ifTrue : otherwise ], req))

});


Middleware.promisify = (...middleware) => (req) => run(middleware, req)


Middleware.pipe = (...middleware) => ({
  transform: (req) => run(middleware, req)
})


module.exports = Middleware;
