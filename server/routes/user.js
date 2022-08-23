const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.js");
const {
  signin,
  signup,
  adoptCampaign,
  donateToCampaign,
  pullDonationFromCampaign,
  pullDonationFromExternal,
  pullAllCampaignDonations,
  getUserCreatedCampaigns,
  createCampaign,
  getUserDonations,
} = require("../controllers/user.js");

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/donate", auth, donateToCampaign);
router.post("/pull", auth, pullDonationFromCampaign);
router.post("/extPull", auth, pullDonationFromExternal);
router.post("/pullAll", auth, pullAllCampaignDonations);
router.post("/:id/createCampaign/", auth, createCampaign);
router.get("/getUserCampaigns", auth, getUserCreatedCampaigns);
router.get("/getUserDonations", auth, getUserDonations);
router.patch("/:id/adoptCampaign", auth, adoptCampaign);

module.exports = router;
