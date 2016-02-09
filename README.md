# generator-fido-release [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> A tool for generating releases of FIDO specifications

## Installation

First, install [Yeoman](http://yeoman.io) and generator-fido-release using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-fido-release
```

Then generate your new project:

```bash
yo fido-release
```

## Usage

## Adding new specs
- Add new questions in `generators/app/templates/questions-<new spec>.js`
- Be sure to include `questions-<new spec>.js` in `generators/app/templates/questions.js` (search for UAF or U2F as examples)
- Update repos `writing.js` to include GitHub repo

## License

 © [Adam Powers]()


[npm-image]: https://badge.fury.io/js/generator-fido-release.svg
[npm-url]: https://npmjs.org/package/generator-fido-release
[travis-image]: https://travis-ci.org/apowers313/generator-fido-release.svg?branch=master
[travis-url]: https://travis-ci.org/apowers313/generator-fido-release
[daviddm-image]: https://david-dm.org/apowers313/generator-fido-release.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/apowers313/generator-fido-release
