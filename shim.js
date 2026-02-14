if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

if (typeof process === 'undefined') {
  global.process = {
    env: {
      NODE_ENV: 'development',
    },
  };
}

if (typeof global === 'undefined') {
  global = globalThis;
}