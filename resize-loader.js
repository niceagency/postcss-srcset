// This is more or less lifted from srcset-loader
// https://github.com/timse/srcset-loader/blob/master/src/resize-loader.js
var loaderUtils = require('loader-utils');
var resizeImage = require('./resize-image');

function parseQuery(query) {
  if (!query) {
    return {};
  }

  if (typeof query === 'string') {
    return loaderUtils.parseQuery(query);
  }

  return query;
}

module.exports = function resizeLoader(content) {
  if (this.cacheable) {
    this.cacheable();
  }

  const options = loaderUtils.getOptions(this);

  const queryParam = (options && options.queryParam) || 'size';

  const callback = this.async();

  const query = parseQuery(this.resourceQuery);

  const size = parseInt(query[queryParam], 10);

  resizeImage(content, size).then(
    buffer => callback(null, buffer),
    err => callback(err)
  );
};

module.exports.raw = true;
