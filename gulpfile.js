const gulp = require('gulp');
const gutil = require("gulp-util");
const webpack = require("webpack");
const fs = require('fs');

require('dotenv').config();

const env = (process.env.NODE_ENV === 'production') ? 'production' : 'development';

const isProduction = (env === 'production');
const isDevelopment = (env === 'development');

const webpackConfig = require(`./webpack.${env}.js`);

const outputPath = __dirname + '/dist';
const outputFn = isDevelopment ? 'lib-dev.js' : 'lib.js';

webpackConfig.output.path = outputPath;
webpackConfig.output.filename = outputFn;

gulp.task("webpack:build", function (callback) {
  const compiler = webpack(Object.create(webpackConfig));
  compiler.run(function (err, stats) {
    if (err) throw new gutil.PluginError("webpack:build", err);
    gutil.log("[webpack:build]", stats.toString({
      colors: true
    }));
    callback();
  });
});

gulp.task('build', gulp.series('webpack:build'), (done) => {
  done();
});

gulp.task("watch", gulp.series('build', () => {
  return gulp.watch(["src/**/*.js"], gulp.series('build'));
}));

gulp.task('default', gulp.series('watch'));
