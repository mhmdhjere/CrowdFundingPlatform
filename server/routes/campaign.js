const express = require("express");

const {
  getCampaignAdopters,
} = require("../controllers/campaign.js");

const router = express.Router();
const auth = require("../middleware/auth.js");


router.get("/:id/getAdopters", getCampaignAdopters);

module.exports = router;
