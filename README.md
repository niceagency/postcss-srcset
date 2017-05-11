# PostCSS srcset plugin

<img align="right" width="135" height="95"
     title="Philosopher's stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo-leftp.svg">

Assists in auto-generating background images scaled for different viewport
widths.

```javascript
postcss([
  require('postcss-srcset')(/* optional options */)
])
```

```css
/* Input example */
html {
  background: srcset('./myimage.png', 300, 500, 1000) cover;
  color: white;
}
```

```css
/* Output example */
html {
  background: url('./myimage.png') cover;
  color: white;
}

@media (max-width: 1000px) {
  html {
    background: url('./myimage.png?size=1000') cover;
  }
}

@media (max-width: 500px) {
  html {
    background: url('./myimage.png?size=500') cover;
  }
}

@media (max-width: 300px) {
  html {
    background: url('./myimage.png?size=300') cover;
  }
}
```

### Options

You can pass an options object as the first argument to the plugin. Here is
an explanation of the available configuration arguments and their default
values:

```javascript
const options = {
  // The name of the function to make available in the css, in case you take
  // offense to my default naming of it.
  function: 'srcset',
  // The function that transforms the image's URL for a given media query.
  // You can return a promise from here if you want to do something async.
  transformUrl: (url, size) => `${url}?size=${size}`
}

postcss([
  require('postcss-srcset')(options)
])
```

### Demo

To run the demo, clone this repo and run `npm i && npm start`.

![Demonstration of the output](demo.gif)

## Use With Build Tools

This plugin comes with a loader for webpack, but you can use any build tool
you like.

### Webpack

An example of using the built-in webpack loader:

```javascript
const srcsetPlugin = require('postcss-srcset')

module.expots = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: [srcsetPlugin()]
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png)$/,
        resourceQuery: /[?&]size(=|&|\[|$)/,
        use: [
          'url-loader',
          srcsetPlugin.loader
        ]
      }
    ]
  }
}
```

### Other Build Tools

If you want to use another build tool you may have to write it yourself.
Unless you're doing something very simple, in which case you can do the image
resizing just in the plugin's `transformUrl` argument.

Either way, if you're happy using the same image resize function that the
webpack loader uses, it's available for you to `require`:

```javascript
const resizeImage = require('postcss-loader/resize-image');
const fs = require('fs')

var image = fs.readFileSync('myImage.png')
// Arguments: Image buffer, image width
// Returns a promise that resolves to a buffer with the resized image
resizeImage(image, 400).then(
  resized => fs.writeFileSync('myImage-400.png', resized),
  error => console.error('Error in resizeImage:', error)
)
```

## ACK

This file is inspired by (and partly copied from) the [srcset-loader][1];
check that out if you want to use `srcset` in img tags.

[1]: https://github.com/timse/srcset-loader/
