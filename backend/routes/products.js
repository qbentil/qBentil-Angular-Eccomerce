const express = require('express');
const router = express.Router();



// Database
const {database} = require('../config/helpers')

/* GET ALL PRODUCTS */
router.get('/', function(req, res){
  
  includes(res); //INCLUDE CORS Headers

  
  let page = (req.query.page != undefined && req.query.page != 0) ? req.query.page: 1; // set current page number
  const limit = (req.query.limit != undefined && req.query.limit != 0) ? req.query.limit: 10; // set limit of items per page

  let startValue;
  let endValue;

  if (page > 0)
  {
    startValue = (page * limit) - limit;
    endValue = page * limit;
  }else
  {
    startValue = 0;
    endValue = 10;
  }

  database.table('products as p')
  .join([{
    table: 'categories as c',
    on: 'c.id = p.cat_id'
  }])
  .withFields ([
    'c.title as category',
    'p.title as name',
    'p.price',
    'p.description',
    'p.quantity',
    'p.image',
    'p.id'
  ])
  .slice(startValue, endValue)
  .sort({id: .1})
  .getAll()
  .then(prods =>{
    if(prods.length > 0)
    {
      res.status(200).json({
        count: prods.length,
        products: prods
      })
    }else{
      res.status(404).json({message: 'No products found.'});
    }
  }).catch(err => console.log(err));

  
});


/* GET SINGLE PRODUCT */
router.get('/:proid', function(req, res){

  includes(res); //INCLUDE CORS Headers
  let productId = req.params.proid; // get product id from params
  
  database.table('products as p')
  .join([{
    table: 'categories as c',
    on: 'c.id = p.cat_id'
  }])
  .withFields ([
    'c.title as category',
    'p.title as name',
    'p.price',
    'p.quantity',
    'p.description',
    'p.image',
    'p.images',
    'p.id'
  ])
  .filter({'p.id' : productId})
  .get()
  .then(prod =>{
    if(prod)
    {
      res.status(200).json(prod)
    }else{
      res.status(404).json({message: `No record found for product with ID ${productId}.`});
    }
  }).catch(err => console.log(err));

  
})


/* GET ALL PRODUCTS IN A PARTICULAR CATEGORY */
router.get('/category/:catName', function(req, res){
  includes(res); //INCLUDE CORS Headers
  
  const category = req.params.catName;  //Get category name from params
  
  let page = (req.query.page != undefined && req.query.page != 0) ? req.query.page: 1; // set current page number
  const limit = (req.query.page != undefined && req.query.page != 0) ? req.query.limit: 10; // set limit of items per page

  let startValue;
  let endValue;

  if (page > 0)
  {
    startValue = (page * limit) - limit;
    endValue = page * limit;
  }else
  {
    startValue = 0;
    endValue = 10;
  }

  database.table('products as p')
  .join([{
    table: 'categories as c',
    on: `c.id = p.cat_id WHERE c.title LIKE '%${category}%'`
  }])
  .withFields ([
    'c.title as category',
    'p.title as name',
    'p.price',
    'p.quantity ',
    'p.description',
    'p.image as image',
    'p.id'
  ])
  .slice(startValue, endValue)
  .sort({id: .1})
  .getAll()
  .then(prods =>{
    if(prods.length > 0)
    {
      res.status(200).json({
        count: prods.length,
        products: prods
      })
    }else{
      res.status(404).json({message: `No products found in ${category} category`});
    }
  }).catch(err => console.log(err));

  
});

module.exports = router;


function includes(res)
{
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200")
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type, Authorization, Origin, X-Requested-with, Accept");
  res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" );  
}