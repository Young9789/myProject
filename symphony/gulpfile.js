'use strict';

// Gulp
var gulp = require('gulp'),
	$ = require('gulp-load-plugins')(),
	BrowserSync = require('browser-sync'),
	del = require('del'),
	sprity = require('sprity'),
	browserify = require('browserify'),
	vinylSource = require('vinyl-source-stream'),
	vinylBuffer = require("vinyl-buffer"),
	options = {};

/*\
- Build Path Variables
\*/
options.path = {
	localCss: '../css/',
	buildCss: 'css/',
	distCss: '/css/',

	localJs: '../js/',
	buildJs: 'js/',
	distJs: '/js/',

	localImg: '../images/',
	buildImg: '../images/',
	distImg: '/images/',

	buildHtmlImg: 'images/'
};

options.imagemin = {
	interlaced: true,
	progressive: true,
	optimizationLevel: 5
};

/*\
- build된 파일들 삭제
\*/
var tempCount = 0;
gulp.task('clean', function ( callback ) {
	del([
		'build/',
		'src/**/_spr_**.less',
		'npm-debug.log'
	]).then(paths => {
		console.log('Deleted files and folders:\n', paths.join('\n'));
		callback();
	});
});

/*\
Markup
- HTML Include
- HTML Hint ( disalbes )
- Replace Path (CSS,JS,Image URL)
\*/
gulp.task('markup:page', function () {
	return gulp.src(['src/html/**/*.html', '!src/html/include/_*.html'])
		.pipe($.plumber())
		.pipe($.changed('build'))
		.pipe($.lbInclude({
			root: 'src/html/'
		}))
		.pipe($.filter([
			'**/*',
			'!include/**/*.html'
		]))
		.pipe($.replace(options.path.localImg, options.path.buildHtmlImg))
		.pipe($.replace(options.path.localCss, options.path.buildCss))
		.pipe($.replace(options.path.localJs, options.path.buildJs))
		.pipe($.htmlhint({
			htmlhintrc: '.htmlhintrc'
		}))
		.pipe($.htmlhint.reporter())
		.pipe($.htmlBeautify({
			"indent_size": 1,
			"indent_char": "	"
		}))
		.pipe(gulp.dest('build/'));
});

/*\
Markup
- HTML Include file change
- HTML Hint ( disalbes )
- Replace Path (CSS,JS,Image URL)
\*/
gulp.task('markup:include', function () {
	console.log('changeInclude');
	return gulp.src(['src/html/**/*.html', '!src/html/include/_*.html'])
		.pipe($.plumber())
		.pipe($.lbInclude({
			root: 'src/html/'
		}))
		.pipe($.filter([
			'**/*',
			'!include/**/*.html'
		]))
		.pipe($.replace(options.path.localImg, options.path.buildImg))
		.pipe($.replace(options.path.localCss, options.path.buildCss))
		.pipe($.replace(options.path.localJs, options.path.buildJs))
		.pipe($.htmlhint({
			htmlhintrc: '.htmlhintrc'
		}))
		.pipe($.htmlhint.reporter())
		.pipe($.htmlBeautify({
			"indent_size": 1,
			"indent_char": "	"
		}))
		.pipe(gulp.dest('build/'));
});

/*\
Style
- Less 프리프로세서 처리
- Autoprefix 처리
- CSS Lint
\*/
gulp.task('style:page', function () {
	return gulp.src(['src/less/**/*.less','!src/less/**/_*.less'])
		.pipe($.plumber())
		.pipe($.changed('build/css/'))
		.pipe($.newer('build/css/'))
		.pipe($.replace(options.path.localImg, options.path.buildImg))
		// .pipe($.sourcemaps.init())
		.pipe($.less())
		/*.pipe($.csslint({
			csslint: '.csslintrc'
		}))
		.pipe($.csslint.formatter())*/
		.pipe($.autoprefixer({
			browsers: [
				'> 1%',
				'last 2 versions',
				'Android > 2.3'
			],
			cascade: false
		}))
		.pipe(gulp.dest('build/css/'))
		.pipe($.rename({
			suffix: ".min"
		}))
		.pipe($.cleanCss())
		// .pipe($.sourcemaps.write('../_sourcemaps'))
		.pipe(gulp.dest('build/css/'));
});

/*\
Images
- Image Sprite
- Image Compress
\*/
gulp.task('image:spriteCommon', function () {
	return sprity.src({
			src: 'src/images/_spr_common/*.png',
			name: '_spr_common',
			style: '_spr_common.less',
			prefix: 'spr_common',
			processor: 'less',
			template: 'src/images/_spr_common/template.hbs',
			cssPath: '../images/',
			dimension: [{
				ratio: 1, dpi: 72
			}]
		})
		.pipe($.if('*.png', $.imagemin(options.imagemin)))
		.pipe($.if('*.png', gulp.dest('./build/images/'), gulp.dest('src/less/')))
});
gulp.task('image:sprite', ['image:spriteCommon']); //스프라이트 이미지가 많아질 경우를 대비함
gulp.task('image:page', function () {
	return gulp.src(['src/images/**/*.{png,jpg,gif,ico}', '!src/images/**/_spr*/*.{png,jpg,gif,ico}'])
		.pipe($.plumber())
		.pipe($.newer('./build/images/'))
		.pipe($.imagemin(options.imagemin))
		.pipe(gulp.dest('./build/images/'));
});

/*\
Script
- eslint
- new js directory
\*/
gulp.task('script:page', function () {

	return gulp.src(['src/js/**/*.js', '!src/js/plugins.js', '!src/js/_*.js'])
		.pipe($.plumber())
		.pipe($.changed('build/js/'))
		.pipe($.newer('./build/js/'))
		// .pipe($.sourcemaps.init())
		.pipe($.eslint())
		.pipe($.eslint.format())
		.pipe($.eslint.failOnError())
		.pipe(gulp.dest('./build/js/'))
		.pipe($.uglify())
		.pipe($.rename({
			suffix: ".min"
		}))
		// .pipe($.sourcemaps.write('../_sourcemaps'))
		.pipe(gulp.dest('./build/js/'));
});
gulp.task('script:plugins', function () {
	return browserify("src/js/plugins.js")
		.bundle()
		.pipe(vinylSource('plugins.js'))
		.pipe(vinylBuffer())
		.pipe(gulp.dest('./build/js/'))
		// .pipe($.sourcemaps.init())
		.pipe($.uglify())
		.pipe($.rename({
			suffix: ".min"
		}))
		// .pipe($.sourcemaps.write('../_sourcemaps'))
		.pipe(gulp.dest('./build/js/'));
});

/*\
watch
- watch files and build
\*/
options.watchInterval = 500;
gulp.task('watch', ['build'], function () {
	gulp.watch(['src/html/*.html'], {
		interval: options.watchInterval
	}, ['markup:page']);

	gulp.watch(['src/html/include/_*.html'], {
		interval: options.watchInterval
	}, ['markup:include']);

	gulp.watch(['src/less/**/*.less'], {
		interval: options.watchInterval
	}, ['style:page']);

	gulp.watch(['src/js/**/*.js'], {
		interval: options.watchInterval
	}, ['script:page']);

	gulp.watch(['src/images/_spr_common/*.png'], {
		interval: options.watchInterval
	}, ['image:spriteCommon']);

	gulp.watch(['src/images/**/*.{png,jpg,gif}'], {
		interval: options.watchInterval
	}, ['image:page']);
});

/*\
build
- runSequence
\*/
gulp.task('build', ['clean'], function (cb) {
	var runSequence = require('run-sequence');
	runSequence(
		'image:sprite',
		[
			'markup:page',
			'style:page',
			'image:page',
			'script:page',
			'script:plugins'
		], cb);
});

/*\
run serve
\*/
gulp.task('serve', ['watch'], function () {
	var browserSync = BrowserSync.create();
	var reload = browserSync.reload;

	browserSync.watch(['build/**/*.html','src/include/_*.html']).on('change', reload);
	browserSync.watch('build/**/*.css').on('change', reload);
	browserSync.watch('build/**/*.{png,gif,jpg}').on('change', reload);
	browserSync.watch('build/**/*.js').on('change', reload);

	browserSync.init({
		server: {
			baseDir: './build/',
			directory: true,
			index: 'index.html'
		},
		startPath: '/index.html'
	});

});


/*\
default task
\*/
gulp.task('default', ['serve']);
