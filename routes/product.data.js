const express = require('express');
const { ObjectId } = require('mongodb');
const { productBrands, allProducts, getCollection } = require('../db/mongodb.collection');
const router = express.Router();
const {removeWhiteSpace} = require('../utilities/regex-function');

const resultShape = {
    deviceImage: 1,
    brand: 1,
    price: 1,
    others: 1,
    device: 1,
    _id: 1,
    activity: 1,
    core: 1
};

// get product related brand
async function relBrands(device) {
    const collect = await getCollection(productBrands);
    if (/all/i.test(device)) {
        const relatedBrands = collect.find({ product: { $exists: true } }).toArray();
        return (relatedBrands);
    }
    const relatedBrands = collect.find({ product: { $in: [device] } }).toArray();
    return (relatedBrands);
};

// get products Data
router.get(`/productBrands`, async (req, res) => {
    const collect = await getCollection(productBrands);
    const result = await collect.find({}).toArray();
    return res.send(result)
});

// get product
router.get(`/products`, async (req, res) => {

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

    const { device, brand, activity, discount, search } = reqQuery;

    const filter = {
        $and: [
            { device: device },
            { brand: brand },
            { activity: !activity ? { $exists: true } : activity },
            { 'price.discount': discount !== 'false' ? { $gt: 0 } : { $exists: true } },
            { 'others.model': search !== 'null' ? { $regex: new RegExp(search.split('').join('\\s*'), 'i') } : { $exists: true } }
        ]
    };

    const result = await collect.find(filter, { projection: resultShape }).toArray();

    return res.send({ products: result, relatedBrands });
});

// post product
router.post(`/allProducts`, async (req, res) => {
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
router.get(`/product/:brand/:device/:id`, async (req, res) => {

    const collect = await getCollection(allProducts);

    const { id, brand, device } = req.params;

    const returnShape = {
        _id:0,
        activity:0,
        core:0
    }

    const product = await collect.findOne({
        _id: new ObjectId(id),
        brand,
        device
    },{projection:returnShape});

    return res.send(product);
});

// get cart products
router.get(`/cart-products/`, async (req, res) => {

    const cartArr = JSON.parse(req.query.productsId).map(item => new ObjectId(item));

    const query = { _id: { $in: cartArr } };

    const collect = await getCollection(allProducts);

    const product = await collect.find(query, { projection: resultShape }).toArray();

    return res.send(product);
});

module.exports = router