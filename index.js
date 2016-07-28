
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


const run = _.curry(([current, ...rest], req) => _.composeP(
  (next) => _.length(rest) ? run(rest, next) : next.data
, _.ifElse(
    _.always(Array.isArray(current))
  , runParallel(current)
  , runSingle(current)
))(req));


const Middleware = (...middleware) => {
  Validate.testMiddleware(middleware)

  return (req, res, next) => { 
    run(middleware, req)

    .then(res.json.bind(res))

    .catch(next);

  };

};


module.exports = Middleware;
