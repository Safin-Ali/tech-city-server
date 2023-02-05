const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { default: axios } = require('axios');

// middleware
app.use(cors());
app.use(express.json());

// connect mongoDB
const uri = `mongodb+srv://${process.env.mongoDBUser}:${process.env.mongoDBPass}@cluster01.rhyj5nw.mongodb.net/test`;
const client = new MongoClient(uri);

async function main() {
    try {
        const TechCity = client.db(`tech-city`);
        const categories = TechCity.collection(`productCategories`);
        const additionalImages = TechCity.collection(`additionalImages`);
        const productBrands = TechCity.collection(`productBrands`);
        const categoryFeildSchema = TechCity.collection(`categoryFeildSchema`);
        const allProducts = TechCity.collection(`AllProducts`);

        // commin function

        // 01. provide others brands by device name
        const othersBrand = async (brandName, deviceName) => {
            const query = { brandName: { $ne: brandName }, product: { $in: [deviceName] } };
            const result = await productBrands.find(query).toArray();
            return result;
        };

        app.get(`/`, (req, res) => {
            return res.send('Welcome Tech-City APIs')
        });

        app.get(`/categories`, async (req, res) => {
            const result = await categories.find({}).toArray();
            return res.send(result)
        });

        app.get(`/additionalImgs`, async (req, res) => {
            const result = await additionalImages.findOne({});
            return res.send(result)
        });

        app.get(`/productBrands`, async (req, res) => {
            const result = await productBrands.find({}).toArray();
            return res.send(result)
        });

        app.get(`/caregorySchema/:device`, async (req, res) => {
            const device = req.params.device;
            const result = await categoryFeildSchema.findOne({ device: device });
            return res.send(result)
        });

        // get product by deviceName
        app.get(`/products/:device`, async (req, res) => {
            const device = req.params.device;
            const products = await allProducts.find({ device: device }).toArray();
            const relatedBrands = await productBrands.find({ product: { $in: [device] } }).toArray();
            return res.send({ relatedBrands, products });
        });

        // get product by brand and device name
        app.get(`/products/:brand/:device`, async (req, res) => {
            const reqParams = req.params;

            const filter = { device: reqParams.device, brand: reqParams.brand };

            const products = await allProducts.find(filter).toArray();

            const relatedBrands = await othersBrand(reqParams.brand, reqParams.device);

            return res.send({ relatedBrands, products });

        });

        // post product
        app.post(`/allProducts`, async (req, res) => {
            const data = req.body;
            // checking item exist or not
            const filter = {
                "others.model": data.others.model,
                device: data.device,
                brand: data.brand
            };
            const checkExist = await allProducts.countDocuments(filter) > 0;
            if (checkExist) return res.send('exist');
            const result = await allProducts.insertOne(data);
            return res.send(result)
        });
    }
    catch (e) {
        console.log(e.message)
    }
};


main(); // call databage

app.listen(port, () => {
    console.log(`Tech-City APIs Run on ${port}`)
})