//var fis = module.exports = require('her-fis');
var fis = module.exports = require('fis');

fis.cli.name = 'her';
fis.cli.info = fis.util.readJSON(__dirname + '/package.json');
fis.cli.version = require('./version.js');

fis.require.prefixes = ['her', 'fis'];

var defaultConfig = require('./configs/default.js');
fis.config.merge(defaultConfig);

//alias
Object.defineProperty(global, 'her', {
    enumerable: true,
    writable: false,
    value: fis
});
