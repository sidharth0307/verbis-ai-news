const express = require("express");
const { getAssets, updateAssets } = require("../controllers/assetController");
const upload = require("../middleware/uploads");
const router = express.Router();


router.get("/", getAssets);
router.put("/", 
  upload.fields([
    { name: 'logo', maxCount: 1 }, 
    { name: 'fallbackBanner', maxCount: 1 }
  ]), 
  updateAssets
);

module.exports = router;