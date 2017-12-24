const gulp = require('gulp');
const gulpNewer = require('gulp-newer');
const gulpSass = require('gulp-sass');
const gulpPug = require('gulp-pug');
const gulpSize = require('gulp-size');
const gulpUtil = require('gulp-util');
const mergeStream = require('merge-stream');

const directories = {
  sass: {
    src: 'src/**/*.sass',
    dest: 'build'
  },
  pug: {
    src: 'src/**/*.pug',
    dest: 'build'
  },
  sync: {
    'src/**/*.!(sass|pug)': 'build'
  }
}

gulp.task('sync', function() {
  let streamList = [];

  for (let source in directories.sync) {
    let destination = directories.sync[source];

    let stream = gulp.src(source)
      .pipe(gulpNewer({
        dest: destination
      }))
      .pipe(gulpSize({
        title: 'Sync',
        showFiles: true,
        showTotal: false
      }))
      .pipe(gulp.dest(destination));

    streamList.push(stream);
  }

  return mergeStream.apply(mergeStream, streamList);
});

gulp.task('deps', function() {
  return gulp.src(directories.deps)
    .pipe(gulpNewer({
      dest: directories.sync.dest
    }))
    .pipe(gulpSize({
      title: 'Sync',
      showFiles: true,
      showTotal: false
    }))
    .pipe(gulp.dest(directories.sync.dest));
});

gulp.task('sass', function() {
  return gulp.src(directories.sass.src)
    .pipe(gulpNewer({
      dest: directories.sass.dest,
      ext: '.css'
    }))
    .pipe(gulpSass().on('error', function(err) {
      gulpUtil.log(err);
      this.emit('end');
    }))
    .pipe(gulpSize({
      title: 'Sass',
      showFiles: true,
      showTotal: false
    }))
    .pipe(gulp.dest(directories.sass.dest));
});

gulp.task('pug', function() {
  return gulp.src(directories.pug.src)
    .pipe(gulpNewer({
      dest: directories.pug.dest,
      ext: '.html'
    }))
    .pipe(gulpPug({
      pretty: true
    }).on('error', function(err) {
      gulpUtil.log(err);
      this.emit('end');
    }))
    .pipe(gulpSize({
      title: 'Pug',
      showFiles: true,
      showTotal: false
    }))
    .pipe(gulp.dest(directories.pug.dest));
});

gulp.task('build', ['sync', 'pug', 'sass']);

gulp.task('watch', function() {
  gulp.watch(Object.keys(directories.sync), ['sync']);
  gulp.watch(directories.sass.src, ['sass']);
  gulp.watch(directories.pug.src, ['pug']);
});
