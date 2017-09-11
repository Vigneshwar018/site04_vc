var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-ruby-sass'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    minifyHTML = require('gulp-minify-html'),
    sourcemaps = require('gulp-sourcemaps'),
    // postcss = require('gulp-postcss'),
    // minifyPHP = require('@cedx/gulp-php-minify'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel'),
    zip = require('gulp-zip'),
    htmlreplace = require('gulp-html-replace'),
    rename = require("gulp-rename"),
    stripCssComments = require('gulp-strip-css-comments'),
    // $           = require('gulp-load-plugins')(),
    browserSync = require('browser-sync').create();
    // autoprefixer = require('autoprefixer');

var env,
    jsSources,
    sassSources,
    htmlSources,
    outputDir,
    sassStyle;

var reload = browserSync.reload;

env = 'development';
// env = 'production';


if (env==='development') {
  outputDir = 'development/';
  sassStyle = 'expanded';
} else {
  outputDir = 'production/';
  sassStyle = 'compressed';
}

jsSources = [
  'tools/js/jquery.js',
  // 'components/scripts/TweenMax.min.js',
  // 'components/scripts/jquery.scrollmagic.min.js',
  'tools/js/script.js'
];

sassSources = 'tools/sass/style.scss';
htmlSources = [outputDir + '*.html'];


// var   PHPMYADMIN_FOLDER = 'phpmyadmin',
//       AUTOOPEN_ADMIN = false;

//browserSync FILES
// var LIVE_RELOAD_FILES = [
//     // '**/*.css',
//     // '*.css',
//     // '**/*.js',
//     // '*.js',
//     '**/*.php',
//     '*.php'
//     // '*.html'
// ];//browserSync FILES

// var SERVERS = {
//   DEV: { // Use 0.0.0.0 for access on devices in the same wifi
//     HOST: '127.0.0.1',
//     PORT: 3000
//   },
//   DEV_PHP: {
//     HOST: '127.0.0.1', // For PHP server that will be proxied to DEV
//     PORT: 8000
//   },
//   ADMIN: { // phpMyAdmin
//     HOST: '127.0.0.1',
//     PORT: 1337
//   }
// };


//js
gulp.task('js', function() {
  'use strict';

  // gulp.src('components/scripts/script.js')
  //   .pipe(jshint('./.jshintrc'))
  //   .pipe(jshint.reporter('jshint-stylish'));

  gulp.src(jsSources)

    .pipe(concat('script.js'))
    // .pipe(browserify())
    .on('error', gutil.log)
    .pipe(gulpif(env === 'development', sourcemaps.init()))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulpif(env === 'production', rename({suffix: '.min'})))
    .pipe(gulpif(env === 'development', sourcemaps.write()))
    .pipe(gulp.dest(outputDir + 'js'))
    .pipe(connect.reload());
});//js


// sass
gulp.task('sass', function () {
    return sass(sassSources, {
      sourcemap: true,
      style: sassStyle
    })
    .on('error', function (err) {
        console.error('Error!', err.message);
    })
    .pipe(autoprefixer())
    .pipe(gulpif(env === 'development', sourcemaps.write()))
    .pipe(gulpif(env === 'production', stripCssComments()))
    .pipe(gulpif(env === 'production', rename({suffix: '.min'})))
    .pipe(gulp.dest(outputDir + 'css'))
    .pipe(connect.reload())
    // .pipe(browserSync.reload({
    //   stream: true
    // }));
    .pipe(browserSync.stream());
});// sass

//compass
// gulp.task('compass', function() {
//   gulp.src(sassSources)
//     .pipe(compass({
//       sass: 'tools/sass',
//       image: outputDir + 'images',
//        style: sassStyle,
//       sourcemap: true
//     })
//     .on('error', gutil.log))
//     .pipe(gulp.dest(outputDir + 'css'))
//     .pipe(connect.reload())
// });//compass


// watch
gulp.task('watch', function() {
  'use strict';
  gulp.watch(['*.scss', 'tools/sass/*.scss'], ['sass']);
  gulp.watch('development/*.html', ['html']);
  gulp.watch(jsSources, ['js']).on('change', browserSync.reload);
  gulp.watch(['development/*.php', '*/*.php']).on('change', browserSync.reload);
  gulp.watch(['development/css/*.css', '*/*.css']).on('change', browserSync.reload);
});//watch

//connect
gulp.task('connect', function() {
  'use strict';
  connect.server({
    root: outputDir,
    livereload: true
  });

  // // Server for wordpress (will be proxied)
  // $.connectPhp.server({
  //   base: outputDir,
  //   hostname: SERVERS.DEV_PHP.HOST,
  //   port: SERVERS.DEV_PHP.PORT
  // });

  // // Another server for phpMyAdmin, since connect-php doesn't support multiple bases
  // $.connectPhp.server({
  //   base: PHPMYADMIN_FOLDER,
  //   open: AUTOOPEN_ADMIN,
  //   hostname: SERVERS.ADMIN.HOST,
  //   port: SERVERS.ADMIN.PORT
  // });
}); // connect

// browser-sync
// gulp.task('browser-sync', ['sass', 'php', 'js' ], function() {
//   browserSync({
//     files: LIVE_RELOAD_FILES,
//     // proxy: "http://localhost/s01",
//     //port:8888,
//     notify: false
//   }, function (err, bs) {
//       if (err)
//         console.log(err);
//       else
//         console.log('BrowserSync is ready.');
//   });
// });//browser-sync


//browser-sync
gulp.task('browser-sync', ['sass'], function() {
    browserSync.init({
        proxy: "127.0.0.98:80",
        port:80,
        // server: "./development",
        // files: LIVE_RELOAD_FILES,
        notify: false
    }, function (err, bs) {
      if (err)
        console.log(err);
      else
        console.log('BrowserSync is ready.');
      });
});

//html
gulp.task('html', function() {
  'use strict';
  gulp.src('development/*.html')
    .pipe(gulpif(env === 'production', htmlreplace({
        'css': 'css/style.min.css',
        'bootstrap_css': 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css',
        'bootstrap_js': 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js',
        'font_awesome': 'https://use.fontawesome.com/41fbfe827f.js',
        'jquery': 'https://code.jquery.com/jquery-3.2.1.min.js',
        'js': 'js/script.min.js'
    })
    ))
    .pipe(gulpif(env === 'production', minifyHTML()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    .pipe(connect.reload())
    // .pipe(browserSync.reload({
    //   stream: true
    // }));
    .pipe(browserSync.stream());

});//html

//PHP
gulp.task('php', function() {
  'use strict';
  gulp.src('development/*.php')
    // .pipe(gulpif(env === 'production', minifyPHP()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    .pipe(connect.reload())
    // .pipe(browserSync.reload({
    //   stream: true
    // }));
    .pipe(browserSync.stream());

});//PHP


// Copy images to production
gulp.task('move', function() {
  'use strict';
  gulp.src('development/css/img/**/*.*')
  .pipe(gulpif(env === 'production', gulp.dest(outputDir+'css/img')));
});

//zip
gulp.task('zip', function () {
  return gulp.src('production/**/*')
    .pipe(zip('website.zip'))
    .pipe(gulp.dest('./'))
});//zip

// gulp.task('default', ['watch', 'html', 'sass', 'move', 'browser-sync', 'connect']);
gulp.task('default', ['watch', 'sass', 'browser-sync', 'js', 'php', 'html', 'move', 'connect']);