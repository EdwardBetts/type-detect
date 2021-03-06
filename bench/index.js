'use strict';

var typeDetect = require('../');
var Benchmark = require('benchmark');
var benches = [];
var fixtures = {
  'string literal    ': '',
  'array literal     ': [],
  'boolean literal   ': true,
  'object literal    ': {},
  'object from null  ': Object.create(null),
  'regex literal     ': /^$/,
  'number literal    ': 1,
  'promise           ': Promise.resolve(),
  'null              ': null,
  'undefined         ': undefined,
  'function          ': function () {},

  'buffer            ': new Buffer(1),
  'date              ': new Date(),
  'error             ': new Error(),
  'map               ': new Map(),
  'regex constructor ': new RegExp(),
  'set               ': new Set(),
  'string constructor': new String(),
  'weakmap           ': new WeakMap(),
  'weakset           ': new WeakSet(),
  'arguments         ': (function () {
    return arguments;
  }()),
};
try {
  fixtures['arrow function    '] = eval('() => {}'); // eslint-disable-line no-eval
} catch (error) {
  console.error('cannot benchmark arrow functions');
}
try {
  fixtures['generator function'] = eval('function * generator() {}; generator'); // eslint-disable-line no-eval
} catch (error) {
  console.error('cannot benchmark generator functions');
}
[
  'Float64Array', 'Float32Array',
  'Uint32Array', 'Uint16Array', 'Uint8Array',
  'Int32Array', 'Int16Array', 'Int8Array',
  'Uint8ClampedArray',
].forEach(function (value) {
  if (typeof global[value] === 'function') {
    fixtures[value + new Array(19 - value.length).join(' ')] = new (global[value])(1);
  }
});
if (typeof DataView === 'function') {
  fixtures['DataView          '] = new DataView(new ArrayBuffer(1));
}

var filter = process.argv[2] || '';
Object.keys(fixtures).filter(function (key) {
  return key.indexOf(filter) !== -1;
}).forEach(function (test) {
  benches.push(new Benchmark(test, {
    fn: function () {
      typeDetect(fixtures[test]);
    },
    onCycle: function (event) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(event.target.toString());
    },
  }));
});
Benchmark.invoke(benches, {
  name: 'run',
  onCycle: function onCycle() {
    console.log('');
  },
  onComplete: function onComplete() {
    console.log('~Fin~');
  },
});
