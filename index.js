const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const dotenv = require('dotenv').config();
const cors = require('cors');
const {MongoClient} = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());

// connect mongoDB
const uri = `mongodb+srv://${process.env.mongoDBUser}:${process.env.mongoDBPass}@cluster01.rhyj5nw.mongodb.net/test`;
const client = new MongoClient(uri);

async function main () {
    try{
        const TechCity = client.db(`tech-city`);
        const categories = TechCity.collection(`product-categories`);
    }
    catch(e){
        console.log(e.message)
    }
}


main(); // call databage

app.listen(port,()=>{
    console.log(`Tech-City APIs Run on ${port}`)
})