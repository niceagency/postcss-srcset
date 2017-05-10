const mockSharp = jest.fn();
const mockResize = jest.fn();

mockSharp.mockReturnValue({
  resize: mockResize
});
mockResize.mockReturnValue({
  toBuffer: () => Promise.resolve("output")
});

jest.mock("image-size", () => () => 10000);
jest.mock("sharp", () => mockSharp);

const loader = require("../resize-loader");

test("resize-loader works", () =>
  new Promise((res, rej) => {
    loader.call(
      {
        query: {},
        resourceQuery: "?size=100",
        async: () => (err, buffer) => {
          if (err) rej(err);
          else res(buffer);
        }
      },
      "input"
    );
  }).then(buffer => {
    expect(mockSharp).toBeCalledWith("input");
    expect(mockResize).toBeCalledWith(100);
    expect(buffer).toEqual("output");
  }));
