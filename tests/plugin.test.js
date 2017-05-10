const postcss = require('postcss');
const srcset = require('..');

const testInput = `html {
  background: srcset('./images/background.jpg', 300 600 900) cover;
  color: white;
}
`;

const testOutput = require('fs').readFileSync(
  `${__dirname}/test-output.css`,
  'utf-8'
);

it('Converts srcset into multiple media queries', () =>
  postcss([srcset()])
    .process(testInput)
    .then(result => expect(result.css).toEqual(testOutput)));
