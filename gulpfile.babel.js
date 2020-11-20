import { src, dest, series, parallel, watch as watchGulp } from "gulp"
import sass from 'gulp-sass'
import babel from 'gulp-babel'
import uglify from 'gulp-uglify'
import concat from 'gulp-concat'
import autoprefixer from 'gulp-autoprefixer'
import clean from 'gulp-clean-css'
import browserSync from 'browser-sync'
import size from 'gulp-size'
import twig from 'gulp-twig'
import del from 'del'
import plumber from 'gulp-plumber'

const sync = browserSync.create();
const reload = sync.reload;
const config = {
    paths: {
        src: {
            html: './src/views/pages/*.twig',
            img: './src/img/**/**.*',
            fonts: './src/fonts/**/**.*',
            css: './src/css/**.*',
            sass: ['src/sass/app.scss'],
            js: 'src/js/**.*',
            jsLib: 'src/js/modules/**.*'
        },
        dist: {
            main: './dist',
            css: './dist/assets/css',
            js: './dist/assets/js',
            img: './dist/assets/img',
            fonts: './dist/assets/fonts',
            css: './dist/assets/css',
            html: './dist'
        }
    }
};

// define functions
const server = done => {
    sync.init({
        injectChanges: true,
        server: config.paths.dist.main
    });
    done()
}

const sassGulp = () => {
    return src(config.paths.src.sass)
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(clean())
        .pipe(size({
            title: '=======*** CSS ***=======',
            showFiles: true
        }))
        .pipe(plumber.stop())
        .pipe(dest(config.paths.dist.css))
        .pipe(sync.stream())
}

const jsGulp = done => {
    src(config.paths.src.js)
        .pipe(babel())
        // .pipe(concat('app.js'))
        .pipe(size())
        .pipe(uglify())
        .pipe(dest(config.paths.dist.js))
    reload()
    done()
}

const htmlGulp = done => {
    src(config.paths.src.html)
        .pipe(twig({
            base: '/',
            errorLogToConsole: true,
            data: {
                title: 'Gulp and Twig',
                benefits: [
                    'Fast',
                    'Flexible',
                    'Secure'
                ]
            }
        }))
        .pipe(size({
            title: '=======*** HTML ***=======',
            showFiles: true
        }))
        .pipe(dest(config.paths.dist.html));
    reload()
    done()

}

const staticGulp = done => {
    src(config.paths.src.fonts)
        .pipe(dest(config.paths.dist.fonts))

    src(config.paths.src.img)
        .pipe(dest(config.paths.dist.img))

    src(config.paths.src.css)
        .pipe(dest(config.paths.dist.css))

    src(config.paths.src.jsLib)
        .pipe(dest(config.paths.dist.js))

    reload()
    done()
}

const cleanGulp = () => del([config.paths.dist.main])

// watch

const watchFiles = () => {
    watchGulp('src/sass/**/*.*', sassGulp)
    watchGulp('src/js/**/*.js', series(jsGulp, staticGulp))
    watchGulp('src/views/**/*.twig', htmlGulp);
}

// exports 
exports.watch = series(cleanGulp, parallel(sassGulp, jsGulp, staticGulp, htmlGulp), server, watchFiles)