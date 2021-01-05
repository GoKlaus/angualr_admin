
'use strict';

const { series, task, src } = require('gulp');

var $ = require('gulp-load-plugins')();

task('wintersmith-generate', $.shell.task([
    'wintersmith build'
], { cwd: 'docs' }));

task('deploy-docs', series(task('wintersmith-generate'), function() {
    return src('./docs/build/**/*')
        .pipe($.ghPages());
}));