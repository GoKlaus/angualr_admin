
'use strict';

var path = require('path');
var conf = require('./conf');
const { task, src, dest } = require('gulp');

task('copyVendorImages', function() {
    return src([
        path.join(conf.wiredep.directory, '**/ammap/dist/ammap/images/**/*'),
        path.join(conf.wiredep.directory, '**/amcharts/dist/amcharts/images/**/*'),
        path.join(conf.wiredep.directory, '**/ionrangeslider/img/**/*'),
        path.join(conf.wiredep.directory, '**/jstree/dist/themes/**/*'),
        path.join(conf.wiredep.directory, '**/leaflet/dist/images/**/*')
    ])
        .pipe(dest(path.join(conf.paths.tmp, 'serve', '/assets/img/theme/vendor')));
});