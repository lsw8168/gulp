var gulp = require('gulp');

// gulp-rename 모듈 호출
var concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    scss = require('gulp-sass'),
    css = require('gulp-minify-css'),
    changed = require('gulp-changed'),
    imagemin = require('gulp-imagemin'),
    ejs = require("gulp-ejs"),
    del = require("del"),
    browserSync = require('browser-sync').create();


var src = 'project/src';
var dist = 'project/dist';
var paths = {
    html : src + '/**/*.html',
    ejs : src + '/**/*.ejs',
    js : src + ['/js/**/*.js','plugins/**/*.js'],
    scss : src + '/sass/**/*.scss',
    css : src + '/css/**/*.css',
    image : src + '/images/*.+(png|jpg|gif)'
};

/**
* =====================================+
* @task : HTML livereload 반영
* =====================================+
*/

gulp.task('clean', function () {
    return del.sync([dist]);
});

gulp.task('html', function () {
     return gulp
     .src(paths.html)
     .pipe(gulp.dest(dist))
     .pipe(browserSync.reload({
         stream : true
     }));
});

gulp.task('ejs', function(){
    return gulp
    .src(paths.ejs)
    .pipe(ejs())
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({
        stream : true
    }));
});

/**
* =====================================+
* @task : Script 병합,압축,min 파일 생성
* =====================================+
*/

gulp.task('js:combine', function () {
    return gulp.src(paths.js)
    .pipe(concat('combined.js'))
    .pipe(gulp.dest(dist+'/js'))
    .pipe(uglify({
        mangle : true, // 알파벳 한 글자 압축 과정 설정
        preserveComments : 'all' // 'all', 또는 'some'
    }))
    .pipe(rename('combined.min.js'))
    .pipe(gulp.dest(dist+'/js'))
    /**
    * 스크립트 파일을 browserSync 로 브라우저에 반영
    */
    .pipe(browserSync.reload(
        {stream : true}
    ));
});

/**
* ==============================+
* @SCSS : SCSS Config(환경설정)
* ==============================+
*/

var scssOptions = {
    /**
    * outputStyle (Type : String , Default : nested)
    * CSS의 컴파일 결과 코드스타일 지정
    * Values : nested, expanded, compact, compressed
    */

     outputStyle : "expanded",

     /**
     * indentType (>= v3.0.0 , Type : String , Default : space)
     * 컴파일 된 CSS의 "들여쓰기" 의 타입
     * Values : space , tab
     */

     indentType : "tab",

     /**
     * indentWidth (>= v3.0.0, Type : Integer , Default : 2)
     * 컴파일 된 CSS의 "들여쓰기" 의 갯수
     */

     indentWidth : 1, // outputStyle 이 nested, expanded 인 경우에 사용

     /**
     * precision (Type : Integer , Default : 5)
     * 컴파일 된 CSS 의 소수점 자리수.
     */

     precision: 6,

     /**
     * sourceComments (Type : Boolean , Default : false)
     * 컴파일 된 CSS 에 원본소스의 위치와 줄수 주석표시.
     */

     sourceComments: true
};

/**
* ==================================+
* @task : SCSS Compile & sourcemaps
* ==================================+
*/


gulp.task('scss:compile', function () {
    return gulp
    // SCSS 파일을 읽어온다.
    .src(paths.scss)

    // 소스맵 초기화(소스맵을 생성)
    .pipe(sourcemaps.init())

    // SCSS 함수에 옵션갑을 설정, SCSS 작성시 watch 가 멈추지 않도록 logError 를 설정
    .pipe(scss(scssOptions).on('error', scss.logError))

    // 위에서 생성한 소스맵을 사용한다.
    .pipe(sourcemaps.write())

    // 목적지(destination)을 설정
    .pipe(gulp.dest(dist + '/css'))

    /**
    * SCSS 컴파일을 수행한 후 browserSync 로 브라우저에 반영
    */
    .pipe(browserSync.reload(
        {stream : true}
    ));
});

gulp.task('css:minify', function () {
   gulp
   .src(paths.css)
   .pipe(css({compatibility: 'ie8'}))
   .pipe(concat('css-minify.css'))
   .pipe(gulp.dest(dist+'/css'))
   .pipe(browserSync.reload(
       {stream : true}
   ));
});

gulp.task('image:compile', function () {
   gulp
   .src(paths.image)
   .pipe(changed(dist+'/images'))
   .pipe(imagemin())
   .pipe(gulp.dest(dist+'/images'))
   .pipe(browserSync.reload(
       {stream : true}
   ));
});

/**
* ==============================+
* @task : browserSync
* ==============================+
*/
gulp.task('browserSync', ['html', 'ejs', 'js:combine', 'scss:compile', 'css:minify', 'image:compile'], function () {
    return browserSync.init({
        port : 3333,
        server: {
            baseDir: './project/dist/'
        }
    });
});

gulp.task('watch', function () {
    gulp.watch('./**/*.html', ['html']);
    gulp.watch('./**/*.ejs', ['ejs']);
    gulp.watch(paths.js, ['js:combine']);
    gulp.watch(paths.scss, ['scss:compile']);
    gulp.watch(paths.css, ['css:minify']);
    gulp.watch(paths.image, ['image:compile']);
});

// gulp 를 실행하면 default 로 js:combine task, scss:compile task 그리고 watch task 를 실행하도록 한다.
gulp.task('default', ['clean', 'browserSync','watch']);
