'use strict';

const { series, src, task, dest } = require('gulp');
var path = require('path');
var conf = require('./conf');
require('./inject');
require('./images');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});


task('partials', function() {
    return src([
        path.join(conf.paths.src, '/app/**/*.html'),
        path.join(conf.paths.tmp, '/serve/app/**/*.html')
    ])
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.angularTemplatecache('templateCacheHtml.js', {
            module: 'BlurAdmin',
            root: 'app'
        }))
        .pipe(dest(conf.paths.tmp + '/partials/'));
});


task('html', series(task('inject-task'), task('partials'), function() {
    var partialsInjectFile = src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), { read: false });
    var partialsInjectOptions = {
        starttag: '<!-- inject:partials -->',
        ignorePath: path.join(conf.paths.tmp, '/partials'),
        addRootSlash: false
    };

    var htmlFilter = $.filter('*.html', { restore: true, dot: true });
    var jsFilter = $.filter('**/*.js', { restore: true, dot: true });
    var cssFilter = $.filter('**/*.css', { restore: true, dot: true });
    var assets;

    return src(path.join(conf.paths.tmp, '/serve/*.html'))
        .pipe($.inject(partialsInjectFile, partialsInjectOptions))
        .pipe(assets = $.useref())
        .pipe($.rev())
        .pipe(jsFilter)
        .pipe($.sourcemaps.init())
        .pipe($.ngAnnotate())
        .pipe($.uglify({ preserveComments: $.uglifySaveLicense })).on('error', conf.errorHandler('Uglify'))
        .pipe($.sourcemaps.write('maps'))
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe($.sourcemaps.init())
        .pipe($.replace('../../bower_components/bootstrap-sass/assets/fonts/bootstrap/', '../fonts/'))
        .pipe($.minifyCss({ processImport: false }))
        .pipe($.sourcemaps.write('maps'))
        .pipe(cssFilter.restore)
        // .pipe(assets.restore())
        // .pipe($.useref())
        .pipe($.revReplace())
        .pipe(htmlFilter)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true,
            conditionals: true
        }))
        .pipe(htmlFilter.restore)
        .pipe(dest(path.join(conf.paths.dist, '/')))
        .pipe($.size({ title: path.join(conf.paths.dist, '/'), showFiles: true }));
}));

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
task('fonts', function() {
    return src($.mainBowerFiles('**/*.{eot,svg,ttf,woff,woff2}'))
        .pipe($.flatten())
        .pipe(dest(path.join(conf.paths.dist, '/fonts/')));
});

task('other', series(task('copyVendorImages'), function() {
    var fileFilter = $.filter(function(file) {
        return file.stat.isFile();
    });

    return src([
        path.join(conf.paths.src, '/**/*'),
        path.join('!' + conf.paths.src, '/**/*.{html,css,js,scss,md}'),
        path.join(conf.paths.tmp, '/serve/**/assets/img/theme/vendor/**/*')
    ])
        .pipe(fileFilter)
        .pipe(dest(path.join(conf.paths.dist, '/')));
}));

task('clean', function() {
    return $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')]);
});

task('build', series(task('html'), task('fonts'), task('other')));
