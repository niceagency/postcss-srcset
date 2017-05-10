const postcss = require('postcss');
const balancedMatch = require('balanced-match');
const PLUGIN_NAME = 'postcss-srcset';

/**
 * Srcset transformer plugin
 *
 * Use in this form:
 * .cls {
 *   background-image: srcset('./path/to/my/image.png', 300 500 1200);
 * }
 *
 * The first argument is the path to your image, the second argument is a
 * space-separated list of sizes to scale the image to.
 *
 * The function will be converted to a collection of media queries that provide
 * a different URL at each size.
 *
 * OPTIONS:
 * function - the name of the function to transform. Defaults to `srcset`
 * transformUrl - the function to transform the image url for the given size
*                 defaults to (url, size) => `${url}?cssSize=${size}`
 *                can return a promise
 */
module.exports = postcss.plugin(
  PLUGIN_NAME,
  (options = {}) =>
    function(css) {
      // In case someone wants to use an async transform function
      var promises = [];

      // Set default options
      var funcName = options.function || 'srcset';
      var transformUrl =
        options.transformUrl || ((url, size) => `${url}?size=${size}`);

      // Look for declerations that use srcset
      css.walkDecls((decl) => {
        if (decl.value.indexOf(funcName) === -1) {
          return;
        }

        // Balanced match in case there are any functions-in-functions
        // (shouldn't be but doesn't hurt to check)
        let match = balancedMatch(`${funcName}(`, ')', decl.value);

        // Can't do layers yet, need to figure out how different size sets
        // combine into each media query
        if (match.post.indexOf(`${funcName}(`) > -1) {
          throw decl.error(
            `${PLUGIN_NAME} does not currently support more than one ` +
              `${funcName} call per declaration`
          );
        }

        let [url, sizes] = postcss.list.comma(match.body);

        // Strip string delemiters from start/end
        url = url.replace(/^['"]|['"]$/g, '');

        // Sizes to integer and in reverse order so the smallest sizes
        // goes last and thus gets the highest specificity
        sizes = postcss.list
          .space(sizes)
          .map(n => parseInt(n, 10))
          .sort((a, b) => b - a);

        // Url back to value (including any values that became before or after)
        let unparse = url => `${match.pre}url('${url}')${match.post}`;

        promises.push(
          ...sizes.map(size =>
            Promise.resolve(transformUrl(url, size)).then(url =>
              // Construct the new rules for each size
              constructRule(decl, unparse(url), size)
            )
          )
        );

        // The default value should be the image at its largest (original) size
        decl.value = unparse(url);
      });

      return Promise.all(promises);
    }
);

/**
 * Make a media query at-rule for a given size
 */
function makeQuery(size) {
  return postcss.atRule({
    name: 'media',
    params: `(max-width: ${size}px)`
  });
}

/**
 * Clone a rule and remove all of its declarations
 */
function cloneRule(decl) {
  return decl.parent.clone({
    nodes: []
  });
}

/**
 * clone a delcaration and assign it a new value
 */
function cloneDecl(decl, value) {
  var d = decl.clone({});

  d.value = value;

  return d;
}

/**
 * Construct a new media query with rule and declaration
 * and attatch it to the root
 */
function constructRule(decl, value, size) {
  var query = makeQuery(size);
  var rule = cloneRule(decl);
  var newDecl = cloneDecl(decl, value);
  query.source = decl.source;

  rule.append(newDecl);
  query.append(rule);
  decl.root().append(query);
}

module.exports.default = module.exports;
module.exports.loader = require.resolve('./resize-loader');
