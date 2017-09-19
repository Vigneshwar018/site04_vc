var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-ruby-sass'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    minifyHTML = require('gulp-minify-html'),
    sourcemaps = require('gulp-sourcemaps'),
    // postcss = require('gulp-postcss'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel'),
    zip = require('gulp-zip'),
    htmlreplace = require('gulp-html-replace'),
    rename = require("gulp-rename"),
    stylish = require('jshint-stylish'),
    jshint = require('gulp-jshint'),
    lec = require ('gulp-line-ending-corrector'),
    htmlPartial = require('gulp-html-partial'),
    htmlbeautify = require('gulp-html-beautify'),
    stripCssComments = require('gulp-strip-css-comments'),
    gcmq = require('gulp-group-css-media-queries'),
    pngcrush = require('imagemin-pngcrush'),
    imagemin = require('gulp-imagemin'),
    browserSync = require('browser-sync').create();

env = 'development';
// env = 'production';

var env,
    jsSources,
    sassSources,
    htmlSources,
    outputDir,
    sassStyle;

var reload = browserSync.reload;

if (env === 'development') {
  outputDir = 'development/';
  sassStyle = 'expanded';
} else {
  outputDir = 'production/';
  sassStyle = 'compressed';
}

jsSources = [
  // 'tools/js/jquery.js',
  'tools/js/nav.js',
  // 'components/scripts/jquery.scrollmagic.min.js',
  'tools/js/script.js'
];

sassSources = 'tools/sass/style.scss';
htmlSources = [outputDir + '*.html'];


//js
gulp.task('js', function() {
  'use strict';

  // gulp.src(jsSources)
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
    // .pipe(gcmq())
    .pipe(gulpif(env === 'development', sourcemaps.write()))
    .pipe(gulpif(env === 'production', stripCssComments()))
    .pipe(gulpif(env === 'production', rename({suffix: '.min'})))
    .pipe(gulp.dest(outputDir + 'css'))
    .pipe(connect.reload())
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
  // gulp.watch('development/*.html').on('change', browserSync.reload);
  gulp.watch(jsSources, ['js']).on('change', browserSync.reload);
  gulp.watch(['development/*.php', '*/*.php']).on('change', browserSync.reload);
  gulp.watch('development/img/**/*.*', ['images']);
  gulp.watch(['tools/html-page/html-partials/*.html','tools/html-page/*.html'],['html-partials']).on('change', browserSync.reload);
  // gulp.watch(['development/css/*.css', '*/*.css']).on('change', browserSync.reload);
});//watch

//connect
gulp.task('connect', function() {
  'use strict';
  connect.server({
    root: './',
    livereload: true
  });
  }); // connect

//browser-sync
gulp.task('browser-sync', ['sass'], function() {
    browserSync.init(gulpif(env === 'production', {
        // proxy: "127.0.0.98:80/s04/production/",
        proxy: "127.0.0.98:8080/production/",
        port:80,
        // server: "./development",
        notify: false
    }, function (err, bs) {
      if (err)
        console.log(err);
      else
        console.log('BrowserSync is ready.');
      }),
    gulpif(env === 'development', {
        // proxy: "127.0.0.98:80/s04/development/",
        proxy: "127.0.0.98:8080/development/",
        port:80,
        // server: "./development",
        notify: false
    }, function (err, bs) {
      if (err)
        console.log(err);
      else
        console.log('BrowserSync is ready.');
      })
    );
});//browser-sync

//html-partials
gulp.task('html-partials', function () {
  return gulp.src('tools/html-page/*.html')
  .pipe(htmlPartial({
    basePath: 'tools/html-page/html-partials/',
    tagName: 'vc',
    variablePrefix: '@@'
  }))
  .on('error', function (err) {
        console.error('Error!', err.message);
    })
  // .pipe(lec({verbose:true, eolc: 'LF', encoding:'utf8'})) // clean up line endings for useref to find flags
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
  .pipe(gulpif(env === 'development', htmlbeautify()))
  .pipe(gulp.dest(outputDir))
  .pipe(connect.reload())
  .pipe(browserSync.stream());
});//html-partials


//PHP
gulp.task('php', function() {
  'use strict';
  gulp.src('development/*.php')
    // .pipe(gulpif(env === 'production', minifyPHP()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    .pipe(connect.reload())
    .pipe(browserSync.stream());

});//PHP

//imagemin
gulp.task('images', function() {
  gulp.src('development/img/**/*.*')
    .pipe(gulpif(env === 'production', imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngcrush()]
    })))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir+'css/img')))
    .pipe(connect.reload())
    .pipe(browserSync.stream());
});//imagemin

//zip
gulp.task('zip', function () {
  return gulp.src('production/**/*')
    .pipe(zip('website.zip'))
    .pipe(gulp.dest('./'),console.log('\n█▀▀▀█ ▀█▀ █▀▀█   █▀▀█ █▀▀▀█ █▀▄▀█ █▀▀█ █    █▀▀▀ ▀▀█▀▀ █▀▀▀\n▄▄▄▀▀  █  █▄▄█ ▒ █    █   █ █ █ █ █▄▄█ █    █▀▀▀   █   █▀▀▀\n█▄▄▄█ ▄█▄ █      █▄▄█ █▄▄▄█ █   █ █    █▄▄█ █▄▄▄   █   █▄▄▄\n'))

});//zip

//environment
gulp.task('env', function() {
  if (env === 'production'){
        console.log(' env = production!!\n environment is production files will be output in production \n█▀▀█ █▀▀█ █▀▀▀█ █▀▀▄ █  █ █▀▀█ ▀▀█▀▀ ▀█▀ █▀▀▀█ █▄  █\n█▄▄█ █▄▄▀ █   █ █  █ █  █ █      █    █  █   █ █ █ █\n█    █  █ █▄▄▄█ █▄▄▀ ▀▄▄▀ █▄▄█   █   ▄█▄ █▄▄▄█ █  ▀█\n');
      }else if (env === 'development') {
        console.log(' env = development!!\n environment is development files will be output in development\n█▀▀▄ █▀▀▀ █   █ █▀▀▀ █    █▀▀▀█ █▀▀█ █▀▄▀█ █▀▀▀ █▄  █ ▀▀█▀▀\n█  █ █▀▀▀  █ █  █▀▀▀ █    █   █ █▄▄█ █ █ █ █▀▀▀ █ █ █   █  \n█▄▄▀ █▄▄▄  ▀▄▀  █▄▄▄ █▄▄█ █▄▄▄█ █    █   █ █▄▄▄ █  ▀█   █\n');
      }else {
    console.log(' environment not defined\n█  █ █▄  █ █▀▀▄ █▀▀▀ █▀▀▀ ▀█▀ █▄  █ █▀▀▀ █▀▀▄\n█  █ █ █ █ █  █ █▀▀▀ █▀▀▀  █  █ █ █ █▀▀▀ █  █\n▀▄▄▀ █  ▀█ █▄▄▀ █▄▄▄ █    ▄█▄ █  ▀█ █▄▄▄ █▄▄▀\n');
      }
});////environment

//default
gulp.task('default', ['watch','connect', 'sass', 'browser-sync', 'js', 'php', 'html-partials','images'], function() {
  //environment
  if (env === 'production'){
        console.log(' env = production!!\n environment is production files will be output in production \n█▀▀█ █▀▀█ █▀▀▀█ █▀▀▄ █  █ █▀▀█ ▀▀█▀▀ ▀█▀ █▀▀▀█ █▄  █\n█▄▄█ █▄▄▀ █   █ █  █ █  █ █      █    █  █   █ █ █ █\n█    █  █ █▄▄▄█ █▄▄▀ ▀▄▄▀ █▄▄█   █   ▄█▄ █▄▄▄█ █  ▀█\n');
      }else if (env === 'development') {
        console.log(' env = development!!\n environment is development files will be output in development\n█▀▀▄ █▀▀▀ █   █ █▀▀▀ █    █▀▀▀█ █▀▀█ █▀▄▀█ █▀▀▀ █▄  █ ▀▀█▀▀\n█  █ █▀▀▀  █ █  █▀▀▀ █    █   █ █▄▄█ █ █ █ █▀▀▀ █ █ █   █  \n█▄▄▀ █▄▄▄  ▀▄▀  █▄▄▄ █▄▄█ █▄▄▄█ █    █   █ █▄▄▄ █  ▀█   █\n');
      }else {
    console.log(' environment not defined\n█  █ █▄  █ █▀▀▄ █▀▀▀ █▀▀▀ ▀█▀ █▄  █ █▀▀▀ █▀▀▄\n█  █ █ █ █ █  █ █▀▀▀ █▀▀▀  █  █ █ █ █▀▀▀ █  █\n▀▄▄▀ █  ▀█ █▄▄▀ █▄▄▄ █    ▄█▄ █  ▀█ █▄▄▄ █▄▄▀\n');
      }//environment
});//default
