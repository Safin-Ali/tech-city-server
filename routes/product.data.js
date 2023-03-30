const express = require('express');
const { ObjectId } = require('mongodb');
const { productBrands, allProducts, getCollection } = require('../db/mongodb.collection');
const productRoute = express.Router();

const removeWhiteSpace = (str) => str.replace(/\s+/gi, '');

// get product related brand
async function relBrands(device) {
    const collect = await getCollection(productBrands);
    if(/all/i.test(device)){
        const relatedBrands = collect.find({ product: {$exists: true} }).toArray();
        return (relatedBrands);
    }
    const relatedBrands = collect.find({ product: { $in: [device] } }).toArray();
    return (relatedBrands);
};

// get products Data
productRoute.get(`/productBrands`, async (req, res) => {
    const collect = await getCollection(productBrands);
    const result = await collect.find({}).toArray();
    return res.send(result)
});

// get product
productRoute.get(`/products`, async (req, res) => {

    const reqQuery = req.query;

    const relatedBrands = await relBrands(reqQuery.device);

    Object.keys(reqQuery).map(qr => {
        // remove all space in string
        const replacedText = removeWhiteSpace(reqQuery[qr]);

        if (replacedText === 'all' || replacedText === `''`) {
            return reqQuery[qr] = { $exists: true };
        }

        return reqQuery[qr] = replacedText;
    });

    const collect = await getCollection(allProducts);

    const { device, brand, activity, discount,search } = reqQuery;

    const filter = {
        $and: [
            { device: device },
            { brand: brand },
            { activity: activity },
            { 'price.discount': discount !== 'false' ? { $gt: 0 } :  { $exists: true } },
            {'others.model': search !== 'null' ? {$regex:new RegExp(search.split('').join('\\s*'), 'i')} : { $exists: true } }
        ]
    };

    // res.send(filter)

    const result = await collect.find(filter).toArray();

    return res.send({ products: result, relatedBrands });

});

// post product
productRoute.post(`/allProducts`, async (req, res) => {
    const data = req.body;

    const collect = await getCollection(allProducts);

    // checking item exist or not
    const filter = {
        "others.model": data.others.model,
        device: data.device,
        brand: data.brand
    };
    const checkExist = await collect.countDocuments(filter) > 0;
    if (checkExist) return res.send('exist');
    const result = await collect.insertOne(data);
    return res.send(result)
});

// get product by _ID
productRoute.get(`/product/:brand/:device/:id`, async (req, res) => {

    const collect = await getCollection(allProducts);

    const {id,brand,device} = req.params;

    const product = await collect.findOne({ _id: ObjectId(id), brand, device});

    return res.send(product);
});

// get cart products
productRoute.get(`/cart-products/`, async (req, res) => {

    const cartArr = JSON.parse(req.query.productsId).map(item => ObjectId(item))

    const query = { _id: {$in: cartArr}};

    const collect = await getCollection(allProducts);

    const product = await collect.find(query).toArray();

    return res.send(product);
});

module.exports = { productRoute, removeWhiteSpace };