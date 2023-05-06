const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()
const productRoutes = require('./routes/product.data');
const { categories, getCollection, servicesData, additionalImages, filterOption } = require('./db/mongodb.collection');
const stripe = require("stripe")(process.env.stripe_secret_key);

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static('assets'));

// product data fetching router
app.use(`/api`, productRoutes);

// test root
app.get(`/`, (req, res) => {
    return res.send('Welcome Tech-City APIs')
});

// get category device name
app.get(`/api/categories`, async (req, res) => {
    const collect = await getCollection(categories);
    const result = await collect.find({}).toArray();
    return res.send(result)
});

// get services Data
app.get(`/api/servicesData`, async (req, res) => {
    const collect = await getCollection(servicesData)
    const result = await collect.find({}).toArray();
    return res.send(result)
});

// get all additional vector images url
app.get(`/api/additionalImgs`, async (req, res) => {
    const collect = await getCollection(additionalImages)
    const result = await collect.findOne({});
    return res.send(result)
});
app.get(`/api/filter-options`, async (req, res) => {
    const collect = await getCollection(filterOption)
    const result = await collect.findOne({});
    return res.send(result)
});

app.post(`/api/payment-intent`, async (req, res) => {
    const amount = req.body.amount;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount*100,
        currency: "usd",
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});

app.listen(port, () => {
    console.log(`Tech-City APIs Run on ${port}`)
})