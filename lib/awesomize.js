
const Awesomize = require('awesomize');


function ValidationError(results) {
  this.message    = 'ValidationError';
  this.name       = 'ValidationError';
  this.status     = 400;
  this.validation = results;
}

ValidationError.prototype             = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;


const throwValidationError = (results) => {
  throw new ValidationError(results);
};


module.exports = Awesomize.dataOrError(throwValidationError);
