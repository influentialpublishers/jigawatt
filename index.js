
const _         = require('ramda');
const Bluebird  = require('bluebird');
const awesomize = require('./lib/awesomize');


const throwMiddlewareEmpty = () => {
  throw TypeError('You must provide at least one middleware');
};

const defaultSpec = _.always(_.compose(
  Bluebird.resolve
, _.prop('data')
))


const getSpec = (req) => _.compose(
  _.ifElse(_.is(Function), awesomize(req), defaultSpec)
, _.prop('awesomize')
);

const getIO = _.propOr((req, data) => data, 'io');


const getTransform = _.propOr((req, data) => data, 'transform');


const run = _.curry((req, middleware) => {
  const current   = _.head(middleware);
  const spec      = getSpec(req)(current);
  const io        = getIO(current);
  const transform = getTransform(current);
  const cur_data  = _.propOr({}, 'data', req);

  return spec(req)

  .then((data) => Bluebird.props(_.merge(cur_data, io(req, data) ))) 

  .then(transform.bind(current, req))

  .then(_.compose(_.merge(req), _.objOf('data')))

  .then((new_req) => {
    if (_.length(middleware) > 1) {
      return run(new_req, _.tail(middleware));
    }

    return new_req.data;
  })

});


const Middleware = (...middleware) => {
  if(middleware.length < 1) throwMiddlewareEmpty();

  //@TODO validate all the middlewar objects.
  //look in lib/validate.js for inspiration.

  return (req, res, next) => {

    run(req, middleware)

    .then(res.json.bind(res))

    .catch(next);

  };

};


module.exports = Middleware;
