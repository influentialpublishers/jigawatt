
const _ = require('ramda');

const isNotEmpty = _.compose(_.not, _.isEmpty);

const isObject = _.compose(_.equals('Object'), _.type)

module.exports = {
  isNotEmpty
, isObject
};
