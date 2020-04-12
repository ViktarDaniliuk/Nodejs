require('dotenv').config();
const path = require('path');
const serve = require('koa-static');
const koa = require('koa');
const koaBody = require('koa-body');
const app = new koa();
const Pug = require('koa-pug');
const bodyParser = require('koa-bodyparser');
const session = require('koa-generic-session');
const flash = require('koa-connect-flash');

const PORT = process.env.PORT;

const pug = new Pug({
   viewPath: './source/template/pages',
   basedir: './source/template',
   app: app
});

app.use(
   koaBody({
      formidable: {
         uploadDir: './public/img/products',
         keepExtensions: true
      },
      multipart: true
   })
)

app.use(serve(path.join(__dirname, '/public')));

app.use(bodyParser({
   formidable:{uploadDir: './public/img/products'},
   multipart: true,
   urlencoded: true
}));

app.keys = ['keys'];

app.use(session());

app.use(flash());

app.use(require('./routes/index').routes());

app.use(async (ctx, next) => {
   await ctx.render('error', { message: ctx.response.message, error: ctx.req.err });
});

app.listen(PORT, function() {
   console.log(`Сервер запущен на https://localhost:${PORT}`);
});