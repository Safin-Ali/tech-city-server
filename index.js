const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
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
        const servicesData = TechCity.collection(`servicesData`);
        const allProducts = TechCity.collection(`AllProducts`);

        // common function

        // 01. return others brands by device name
        const othersBrand = async (brandName, deviceName) => {
            const query = { brandName: { $ne: brandName }, product: { $in: [deviceName] } };
            const result = await productBrands.find(query).toArray();
            return result;
        };

        // test root
        app.get(`/`, (req, res) => {
            return res.send('Welcome Tech-City APIs')
        });

        // get category device name
        app.get(`/categories`, async (req, res) => {
            const result = await categories.find({}).toArray();
            return res.send(result)
        });

        // get all additional vector images url
        app.get(`/additionalImgs`, async (req, res) => {
            const result = await additionalImages.findOne({});
            return res.send(result)
        });

        // get products Data
        app.get(`/productBrands`, async (req, res) => {
            const result = await productBrands.find({}).toArray();
            return res.send(result)
        });

        // get services Data
        app.get(`/servicesData`, async (req, res) => {
            const result = await servicesData.find({}).toArray();
            return res.send(result)
        });

        // get development feild schema model Data
        app.get(`/caregorySchema/:device`, async (req, res) => {
            const device = req.params.device;
            const result = await categoryFeildSchema.findOne({ device: device });
            return res.send(result)
        });

        // get product by deviceName
        app.get(`/products/:device`, async (req, res) => {
            const device = req.params.device;

            const products = await allProducts.find({ device: device, activity: { $ne: 'upcoming' } }).toArray();

            const upComingProducts = await allProducts.find({ device: device, activity: 'upcoming' }).toArray();

            const relatedBrands = await productBrands.find({ product: { $in: [device] } }).toArray();

            return res.send({ relatedBrands, products, upComingProducts });
        });

        // get product by _ID
        app.get(`/product/:id`, async (req, res) => {
            const prodId = req.params.id;

            const product = await allProducts.findOne({_id: ObjectId(prodId)});

            return res.send(product);
        });

        // get product by brand and device name
        app.get(`/products/:brand/:device`, async (req, res) => {
            const reqParams = req.params;

            const filter = { device: reqParams.device, brand: reqParams.brand, activity: { $ne: 'upcoming' } };

            const upComingfilter = { device: reqParams.device, brand: reqParams.brand, activity: 'upcoming' };

            const products = await allProducts.find(filter).toArray();
            const upComingProducts = await allProducts.find(upComingfilter).toArray();

            const relatedBrands = await othersBrand(reqParams.brand, reqParams.device);

            return res.send({ relatedBrands, products, upComingProducts });

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