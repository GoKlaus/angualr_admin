'use strict';

const { task } = require("gulp");
var log = require('fancy-log');

task('test', cb => {
    log.info('test is good');
    cb();
})