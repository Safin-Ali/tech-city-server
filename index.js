const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
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
        const additionalImages = TechCity.collection(`additional-images`);

        app.get(`/`,(req,res)=>{            
            return res.send('Welcome Tech-City APIs')
        });

        app.get(`/categories`,async(req,res)=>{
            const result = await categories.find({}).toArray();
            return res.send(result)
        });

        app.get(`/additionalImgs`,async(req,res)=>{
            const result = await additionalImages.findOne({});
            return res.send(result)
        });
    }
    catch(e){
        console.log(e.message)
    }
}


main(); // call databage

app.listen(port,()=>{
    console.log(`Tech-City APIs Run on ${port}`)
})