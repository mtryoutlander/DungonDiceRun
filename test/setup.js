const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = {
    userAgent: 'node.js',
};
global.requestAnimationFrame = function (callback) {
    return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function (id) {
    clearTimeout(id);
};