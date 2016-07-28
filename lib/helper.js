
const _ = require('ramda');

const isNotEmpty = _.compose(_.not, _.isEmpty);

module.exports = {
  isNotEmpty
};
