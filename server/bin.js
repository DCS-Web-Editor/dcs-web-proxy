
const port = process.argv[2];

const proxy = require(process.cwd() + '\\server\\index.js')

proxy(port)