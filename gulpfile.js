"use strict";
/*общие*/
const gulp          = require('gulp');
const browserSync   = require('browser-sync');
const gulpif        = require('gulp-if');
const plumber       = require('gulp-plumber');
const rename        = require('gulp-rename');
const combine       = require('stream-combiner2').obj;

/*styles*/
const sass          = require('gulp-sass');
const autoprefixer  = require('gulp-autoprefixer');
const sourcemaps    = require('gulp-sourcemaps');
const csso          = require('gulp-csso');

/*js*/
const uglify        = require('gulp-uglify-es').default;
const babel         = require('gulp-babel');

/*html*/
const htmlmin       = require('gulp-htmlmin');
const fileinclude   = require('gulp-file-include')
const useref        = require('gulp-useref');
const ejs           = require('gulp-ejs');

// Автоперезагрузка при изменении файлов в папке `dist`:
// Принцип: меняем файлы в `/src`, они обрабатываются и переносятся в `dist` и срабатывает автоперезагрузка.

const IsDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV ==='development';

// Это таск нужен только при локальной разработке.
gulp.task('livereload', () => {
    browserSync.create();

    browserSync.init({
        server: {
            baseDir: 'dist'
        },
        files: [
            'dist/**/*.*'
        ]
    });
});

gulp.task('styles', () => {
    gulp.src('src/sass/**/[^_]*.+(sass|scss)')
        .pipe(plumber())
        .pipe(gulpif(IsDevelopment, sourcemaps.init()))
        .pipe(sass())
        .pipe(autoprefixer(['last 50 versions']))
        .pipe(gulpif(IsDevelopment, sourcemaps.write()))
        .pipe(gulpif(!IsDevelopment, csso({
            restructure: true,
            sourceMap: true,
            debug: true
        })))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('js', () => {
    gulp.src('src/js/**/*.js')
        .pipe(plumber())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulpif(!IsDevelopment, uglify()))
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('ejs', () => {
    gulp.src('src/**/*.ejs')
        .pipe(ejs())
        .pipe(rename({
                extname: '.html'
        }))
        .pipe(fileinclude())
        .pipe(useref())
        .pipe(gulpif(!IsDevelopment, htmlmin({
            collapseWhitespace: true
        })))
        .pipe(gulp.dest('./dist'));
});

gulp.task('html', () => {
    gulp.src('src/**/[^_]*.(html|php)')
        .pipe(fileinclude())
        .pipe(useref())
        .pipe(gulpif(!IsDevelopment, htmlmin({
            collapseWhitespace: true
        })))
        .pipe(gulp.dest('./dist'));
});

gulp.task('html:build', () => {
    gulp.src('src/**/_*.+(html|php)')
    .pipe(fileinclude())
    .pipe(useref())
    .pipe(gulpif(!IsDevelopment, htmlmin({
        collapseWhitespace: true
    })))
});

// Отслеживание изменений в файлах, нужно только при локальной разработке
gulp.task('watch', () => {
    gulp.watch('src/sass/**/*.+(sass|scss)', ['styles']);
    gulp.watch('src/**/*.ejs', ['ejs']);
    gulp.watch('src/**/*.+(html|php)', ['html:build', 'html']);
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/js/**/*.json', ['json']);
});

gulp.task('default', ['styles', 'html:build', 'ejs', 'html', 'js',  'livereload', 'watch']);
gulp.task('prod', ['styles', 'html:build', 'ejs', 'html', 'js']);
