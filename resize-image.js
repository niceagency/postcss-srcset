var sharp = require('sharp');
var sizeOf = require('image-size');

module.exports = function resizeImage(content, width) {
  const source = sizeOf(content);

  // dont scale up images, let the browser do that
  // and btw. wtf stop trying to fool me :P
  if (source.width < width) {
    return Promise.resolve(content);
  }

  return sharp(content).resize(width).toBuffer();
};
