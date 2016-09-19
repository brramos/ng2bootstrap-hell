/// <binding />

const gulp = require('gulp');
const del = require('del');
const typescript = require('gulp-typescript');
const tscConfig = require('./tsconfig.json');
const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');
const tsconfig = require('tsconfig-glob');

var tsProject = typescript.createProject('tsconfig.json');

// source files
var sourcePaths = {
    root: 'Scripts',
    rootAllFiles: 'Scripts/**/*',
    ts: 'Scripts/app/**/*.ts',
    excludeTS: '!Scripts/app/**/*.ts',

    libs: [
        'node_modules/core-js/client/shim.min.js',
        'node_modules/zone.js/dist/zone.js',
        'node_modules/reflect-metadata/Reflect.js',
        'node_modules/systemjs/dist/system.src.js',
        'node_modules/typescript/lib/typescript.js',
        'node_modules/ng2-bootstrap/bundles/ng2-bootstrap.min.js',
        'node_modules/moment/moment.js'
    ],

    lib_angular: [
        'node_modules/@angular/**'    
    ],

    lib_rxjs:[
        'node_modules/rxjs/**'
    ]
};

var targetPaths = { 
    root: 'wwwroot',
    rootAllFiles: 'wwwroot/**/*',
    app: 'wwwroot/app',
    lib: 'wwwroot/lib',

    lib_angular: 'wwwroot/lib/@angular/',
    lib_rxjs: 'wwwroot/lib/rxjs/'
};

// clean the contents of the distribution directory
gulp.task('clean', function () {
    return del(targetPaths.rootAllFiles);
});

// copy static assets - i.e. non TypeScript compiled source
gulp.task('copy:assets', ['clean'], function () {
    return gulp.src([sourcePaths.rootAllFiles, sourcePaths.excludeTS])
      .pipe(gulp.dest(targetPaths.root));
});

// copy dependencies
gulp.task('copy:libs', ['clean'], function () {

    gulp.src(sourcePaths.lib_angular).pipe(gulp.dest(targetPaths.lib_angular));
    gulp.src(sourcePaths.lib_rxjs).pipe(gulp.dest(targetPaths.lib_rxjs));
    return gulp.src(sourcePaths.libs).pipe(gulp.dest(targetPaths.lib));

});

// linting
gulp.task('tslint', function () {
    return gulp.src(sourcePaths.ts)
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

// TypeScript compile
gulp.task('compile', ['clean', 'tsconfig-glob'], function () {

    return tsProject
    .src(tscConfig.files)
    .pipe(sourcemaps.init())
    .pipe(typescript(tsProject))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(targetPaths.app));
    
});

// update the tsconfig files based on the glob pattern
gulp.task('tsconfig-glob', function () {
    return tsconfig({
        configPath: '.',
        indent: 2
    });
});

// Run browsersync for development
gulp.task('watch', function () {
    gulp.watch([sourcePaths.rootAllFiles], ['build']);
});

gulp.task('build', [ 'compile', 'copy:libs', 'copy:assets']);
//DISABLED linting => gulp.task('build', ['tsconfig-glob', 'tslint', 'compile', 'copy:libs', 'copy:assets']);
gulp.task('default', ['build']);

