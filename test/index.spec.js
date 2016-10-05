/*eslint-env node, mocha */
const _           = require('ramda');
const expect      = require('chai').expect;
const { inspect } = require('util');

const JW     = require('../index.js');


const basic_middleware = {

  awesomize: (v) => ({
    foo: {
      validate: [ v.required ]
    }
  })

, io: (req, data) => ({ bar: data.foo })

, transform: (req, data) => data
};


const fail_res = {
  json: (x) => { throw Error(`Unexpected: ${x}`); }
}

describe('jigawatt/index.js', () => {

  it('should be a function', () => expect(JW).to.be.a('function'));

  
  it('should throw an error when not given any arguments', () => {

    const test = () => JW();

    expect(test).to.throw(
      TypeError
    , /You must provide at least one middleware/
    );

  });


  it('should call the validation function of the given middleware using ' +
  'the awesomize module', (done) => {

    const req = {};

    const test = JW(basic_middleware);

    test(req, fail_res, (err) => {
      expect(err).to.not.be.undefined;
      expect(err.name).to.eql('ValidationError');
      expect(err.validation.foo).to.eql('required');
      done();
    });

  });

  it('should pass the output of the awesomizer as `data` to the IO ' +
  'function', (done) => {

    const req  = { foo: 'bar' };
    const mw   = _.merge(basic_middleware, {
      io: (req, data) => {
        expect(data.foo).to.eql('bar');

        return data;
      }

    });
    const test = JW(mw);

    const res  = {
      json: (data) => {
        expect(data.foo).to.eql('bar');
        done();

      }
    };

    test(req, res, done);

  });


  it('should pass the new request object to the second middleware', (done) => {

    const req = { foo: 'bar' };
    const mw1 = _.merge(basic_middleware, {
      io: (req, data) => {
        expect(data.foo).to.eql('bar');

        return { bar: 'baz' };
      }
    });
    const mw2 = _.merge(basic_middleware, {
      awesomize: (v) => ({
        bar: {
          read: _.path([ 'data', 'bar' ])
        , validate: [ v.required ]
        }
      })
    , io: (req, data) => ({ boo: data.bar })
    });

    const test = JW(mw1, mw2);

    const res = {
      json: (data) => {

        expect(data.bar).to.eql('baz');
        expect(data.boo).to.eql('baz');
        done();

      }
    };

    test(req, res, done);

  });


  it('should run arrays of middleware in parallel', (done) => {

    const req = { foo: 'bar' };
    const mw1 = _.merge(basic_middleware, {
      io: () => ({ bar: 'Chic-fil-a' })
    });
    const mw2 = _.merge(basic_middleware, {
      io: () => ({ boo: 'Wendy\'s' })
    });
    const mw3 = _.merge(basic_middleware, {
      io: () => ({ buzz: 'Chipotle' })
    });
    const mw4 = _.merge(basic_middleware, {
      io: () => ({ fuzz: 'In-n-Out' })
    });

    const test = JW(mw1, [mw2, mw3], mw4);

    const res = {
      json: (data) => {
        expect(data.bar).to.eql('Chic-fil-a');
        expect(data.boo).to.eql('Wendy\'s');
        expect(data.buzz).to.eql('Chipotle');
        expect(data.fuzz).to.eql('In-n-Out');
        done()
      }
    };

    test(req, res, done);
  });


  it('should pass in the req.data object if no awesomize function is ' +
  'provided', (done) => {
    const req = { foo: 'bar', data: { bar: 'blah' }};
    const mw1 = {
      io: (req, data) => {
        expect(data.bar).to.eql('blah');
        return data;
      }
    };

    const test = JW(mw1);

    const res = {
      json: (data) => {
        expect(data.bar).to.eql('blah');
        done();
      }
    };

    test(req, res, done);

  });


  it('should pass the data to transform if no io function is provided',
  (done) => {
    const req = { foo: 'bar' };
    const mw = _.omit(['io'], basic_middleware);

    const test = JW(mw);

    const res = {
      json: (data) => {
        expect(data).to.deep.eql(req);
        done();
      }
    }

    test(req, res, done);
  });


  it('should throw a TypeError if one of the items is not an object',
  () => {

    const o1   = {};
    const o2   = {};

    const t1 = [
      ['foo']
      , () => null
      , 'foo'
      , null
      , undefined
      , Number(1)
      , []
      , true
    ]

    
    const message = 'All middleware given must be objects - index: 1' 

    const master_test = (not_obj) => {
      const test = () => JW(o1, not_obj, o2);
      expect(test).to.throw(TypeError, message);
    }

    _.forEach(master_test)(t1)

  });

  it('should throw an exception if a sub-item is not a object',
  () => {
    const o1 = {};
    const o2 = {};
    const o3 = {};
    const test = () => JW(o1, [o2, 'foo'], o3);
    const message = 'All middleware given must be objects - index: 1:1'

    expect(test).to.throw(TypeError, message);

  });

  it('should throw an exception if a sub-sub-item is not a function',
  () => {
    const o1 = {};
    const o2 = {};
    const o3 = {};
    const o4 = {};
    const o5 = {};
    const test = () => JW([o2, [o4, o5, 'foo']], o1, o3);
    const message = 'All middleware given must be objects - index: 0:1:2'

    expect(test).to.throw(TypeError, message);
  });

  it('should return a function with an arity of 3 when given one argument ' +
  'that is a function', () => {

    const actual = JW({});
    expect(actual).to.be.a('function');
    expect(actual.length).to.eql(3);

  });

  it('should return a PropsCheckError when a middleware has invalid keys'
    , () => {

      const m1 = {
        awesomize: (v) => ({ foo: { validate: [ v.required ] } })
      , io: (req, data) => ({ bar: data.foo })
      , transform: (req, data) => data
      };

      const m2 = {
        awesomize: (v) => ({ foo: { validate: [ v.required ] } })
      , io: (req, data) => ({ bar: data.foo })
      };

      const m3 = {
        awesomizer: (v) => ({ foo: { validate: [ v.required ] } })
      , io: (req, data) => ({ bar: data.foo })
      };

      const test1 = () => JW(m3);
      expect(test1).to.throw(/awesomizer <-> awesomize/);

      const test2 = () => JW(m1, [m2, m3]);
      expect(test2).to.throw(/awesomizer <-> awesomize/);

      const test3 = () => JW({}, [m2, [m1, m3]]);
      expect(test3).to.throw(/awesomizer <-> awesomize/);

  });


  it('should pass any execption thrown from the `io` function to the ' +
  '`next` route function', (done) => {

    const fn = () => { throw new Error('foo'); };

    const m1 = {
      io: (req, data) => ({ foo: fn(data) })
    }

    const res = {
      json: (x) => done( new Error('Should not get here: ' + inspect(x)) )
    };

    const test = JW(m1);

    test({}, res, (err) => {

      expect(err.message).to.eql('foo');
      done();

    });

  });


  describe('JW::debug', function() {

    it('should not affect the data object', function(done) {

      const test = JW(JW.debug('foo'));

      const req = {
        data: { foo: 'bar' }
      };

      const res = {
        json: (x) => {
          expect(req.data).to.eql(x);
          done();
        }
      };

      test(req, res, done);

    });

  });


  describe('JW::tap', function() {

    it('should not affect the data object', function(done) {

      const foo = (req, data) => {
        expect(data.foo).to.eql('bar');
        return 'blah';
      };
      const test = JW(JW.tap(foo));


      const req = {
        data: { foo: 'bar' }
      };


      const res = {
        json: (x) => {
          expect(req.data).to.eql(x);
          done();
        }
      };

      test(req, res, done);

    });

  });

  describe('JW::pick', function() {

    it('should pick selected keys from the data object if they exist', function(done) {

      const req = {
        data: { foo: {a: 'bar', b: 'baz'}, bar: 'fiz' }
      }

      const expected = { foo: {a: 'bar', b: 'baz'} }

      const res = {
        json: (x) => {
          expect(x).to.eql(expected)
          done();
        }
      }

      const test = JW(JW.pick(['foo', 'boo']))

      test(req, res, done)

    });

  });


  describe('JW::branch', function() {

    it('should call the first middleware if the predicate function returns ' +
    ' a truthy value', function(done) {

      const predicate = _.T

      const whenTrue  = {
        transform: (req, data) => {
          expect(data.foo).to.eql('bar');
          return data;
        }
      };

      const whenFalse = {
        transform: () => { throw new Error("Wait...what? How?") }
      };


      const test = JW(JW.branch(predicate, whenTrue, whenFalse));

      const req  = { data: { foo: 'bar' } };
      const res  = { json: (x) => {
        expect(x).to.eql(req.data);
        done();
      }};

      test(req, res, done);

    });


    it('should call the second middleware if the predicate function returns ' +
    ' a falsy value', function(done) {

      const predicate = _.F

      const whenTrue  = {
        transform: () => { throw new Error('The result is a lie!') }
      };

      const whenFalse = {
        transform: (req, data) => {
          expect(data.foo).to.eql('baz');
          return data;
        }
      };


      const test = JW(JW.branch(predicate, whenTrue, whenFalse));

      const req  = { data: { foo: 'baz' } };
      const res  = { json: (x) => {
        expect(x).to.eql(req.data);
        done();
      }};

      test(req, res, done);

    });


    it('should call the predicate with the req and data objects',
    function(done) {


      const req  = { data: { foo: 'baz' } };
      const res  = { json: (x) => {
        expect(x).to.eql(req.data);
        done();
      }};


      const predicate = (req, data) => {
        expect(req).to.eql(req);
        expect(data).to.eql(data);
        return true;
      };


      const whenTrue = {
        transform: (req, data) => data
      };

      const whenFalse = {
        transform: () => { throw new Error('I call shenanigans!') }
      };

      const test = JW(JW.branch(predicate, whenTrue, whenFalse));

      test(req, res, done);

    });

  });


  describe('JW::promisify', function() {


    it('should translate the list of middlewares into a promise', function() {

      const mw1 = {
        transform: (req, data) => _.merge(data, { foo: 'bar' })
      };

      const mw2 = {
        transform: (req, data) => _.merge(data, { bar: 'baz' })
      };

      const test = JW.promisify(mw1, mw2)

      const req  = { data: { boo: 'aahh' } };

      return test(req).then((data) => expect(data).to.deep.eql({
        foo: 'bar'
      , bar: 'baz'
      , boo: 'aahh'
      }))

    })


  });


  describe('JW::pipe', function() {

    it('should compose a set of JW middleware into a single unit',
    function(done) {

      const mw1 = {
        transform: (req, data) => _.merge(data, { foo: 'bar' })
      };

      const mw2 = {
        transform: (req, data) => _.merge(data, { bar: 'baz' })
      };


      const mw3 = {
        transform: (req, data) => _.merge(data, { fizz: 'buzz' })
      };

      const mw4 = {
        transform: (req, data) => _.merge(data, { fuzz: 'buzz' })
      };

      const mw5 = {
        transform: (req, data) => _.merge(data, { fozzy: 'foo', boo: 'bah' })
      };

      const mw6 = {
        transform: (req, data) => _.merge(data, { fozzy: 'bear' })
      };

      const composed = JW.pipe(mw1, [mw2, mw3], mw4)

      const test = JW(mw5, composed, mw6)

      const req = { data: { moo: 'cow', boo: 'poo' } };

      const res = {
        json: (data) => {
          expect(data).to.deep.eql({
            foo: 'bar'
          , bar: 'baz'
          , fizz: 'buzz'
          , fuzz: 'buzz'
          , boo: 'bah'
          , fozzy: 'bear'
          , moo: 'cow'
          });
          done();
        }
      };

      test(req, res, done);

    })

  })


});
