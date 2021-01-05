'use strict';

const { series, task } = require('gulp');
var log = require('fancy-log');
var wrench = require('wrench');
// require('./gulp/test.js');

/**
 *  This will load all js or coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive('./gulp').filter(function(file) {
    return (/\.(js|coffee)$/i).test(file);
}).map(file => {
    log.info(file);
    require('./gulp/' + file);
});


/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
task('default', series(task('clean'), function(cb) {
    task('build')();
    cb();
}));
// task('default', cb => {
//     log.info('defualt task');
//     cb();
// });


// task('test', task('test'));