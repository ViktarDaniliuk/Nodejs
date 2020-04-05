module.exports.post = async (ctx, next) => {
   const storage = require('../storage/storage');
   const product = {};
   const path = ctx.request.files.photo.path;
   
   product.src = `./img/products/${path.slice(path.lastIndexOf('\\') + 1)}`;
   product.name = ctx.request.body.name;
   product.price = ctx.request.body.price;
   storage.setProducts(product);
   
   ctx.flash('msgfile', 'Продукт добавлен успешно.');
   ctx.redirect('/admin');
};