# node-securepay

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

SecurePay API wrapper for node.js

## Usage

See `./lib/index.js` for docs.

## Tests

```sh
npm install
npm test
```

## Dependencies

* [is-plain-object](https://github.com/jonschlinkert/is-plain-object): Returns
  true if an object was created by the `Object` constructor.
* [node-fetch](https://github.com/bitinn/node-fetch): A light-weight module that
  brings window.fetch to node.js and io.js
* [schema-object](https://github.com/scotthovestadt/schema-object): Enforce
  schema on JavaScript objects, including type, transformation, and validation.
  Supports extends, sub-schemas, and arrays.
* [xml-js](https://github.com/nashwaan/xml-js): A convertor between XML text and
  Javascript object / JSON text.

## Dev Dependencies

* [ava](https://github.com/avajs/ava): Futuristic test runner 🚀
* [babel-plugin-transform-object-rest-spread](https://github.com/babel/babel/tree/master/packages):
  Compile object rest and spread to ES5
* [babel-register](https://github.com/babel/babel/tree/master/packages): babel
  require hook
* [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier):
  Turns off all rules that are unnecessary or might conflict with Prettier.
* [husky](https://github.com/typicode/husky): Prevents bad commit or push (git
  hooks, pre-commit/precommit, pre-push/prepush, post-merge/postmerge and all
  that stuff...)
* [lint-staged](https://github.com/okonet/lint-staged): Lint files staged by git
* [pify](https://github.com/sindresorhus/pify): Promisify a callback-style
  function
* [prettier](https://github.com/prettier/prettier): Prettier is an opinionated
  code formatter
* [xo](https://github.com/sindresorhus/xo): JavaScript happiness style linter ❤️

## TODO

* [ ] Add JSDoc to README using
      [`jsdoc-to-markdown`](https://github.com/jsdoc2md/jsdoc-to-markdown)
* [ ] Optimise transpile steps and npm scripts

## License

UNLICENSED
