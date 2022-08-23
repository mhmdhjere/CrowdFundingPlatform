const express = require("express");
const router = express.Router();
const Campaign = require("../models/campaign");
const User = require("../models/user");

const getCampaignAdopters = async (req, res) => {
  const { id } = req.params;
  try {
    const campaign = await Campaign.findOne({ campaignId: id });
    const adopters = await Promise.all(
      campaign.adopters.map((adopterId) => {
        return User.findById(adopterId);
      })
    );
    let adoptersList = [];
    adopters.map((adopter) => {
      const { _id, name } = adopter;
      adoptersList.push({ _id, name });
    });
    res.status(200).json(adoptersList);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  getCampaignAdopters,
  router,
};
