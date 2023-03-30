require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

// connect mongoDB
const uri = `mongodb+srv://${process.env.mongoDBUser}:${process.env.mongoDBPass}@cluster01.rhyj5nw.mongodb.net/test`;
const client = new MongoClient(uri);

const categories =(`productCategories`);
const additionalImages =(`additionalImages`);
const productBrands =(`productBrands`);
const categoryFeildSchema =(`categoryFeildSchema`);
const servicesData =(`servicesData`);
const allProducts =(`AllProducts`);

async function getCollection (collectionName) {
    try{
        const TechCity = client.db(`tech-city`);
        const collection = TechCity.collection(collectionName);
        return collection;
    }
    catch (e) {
        console.log(e.message)
    }
};

module.exports = {
    categories,
    additionalImages,
    productBrands,
    categoryFeildSchema,
    servicesData,
    allProducts,
    getCollection
}