const express = require('express');
const { categoryFeildSchema } = require('../db/mongodb.collection');
const router = express.Router();

// middleware
router.use(cors());
router.use(express.json());

// get development feild schema model Data
router.get(`/caregorySchema/:device`, async (req, res) => {
    const device = req.params.device;
    const result = await categoryFeildSchema.findOne({ device: device });
    return res.send(result)
});

module.exports = router;