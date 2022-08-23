const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Campaign = require("../models/campaign");
const User = require("../models/user");
const secret = "test";

const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser)
      return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "1h",
    });

    res.status(200).json({ result: oldUser, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const signup = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });
    const token = jwt.sign({ email: result.email, id: result._id }, secret, {
      expiresIn: "1h",
    });

    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(error);
  }
};
const getUserDonations = async (req, res) => {
  const user = await User.findOne({ _id: req.userId });
  res.status(200).json({ result: user.donations });
};

const adoptCampaign = async (req, res) => {
  const user = await User.findOne({ _id: req.userId });
  const { id } = req.params;
  var campaign = await Campaign.findOne({ campaignId: id });
  const index = user.adopts.findIndex(
    (campaignId) => campaignId === String(id)
  );

  if (index == -1) {
    user.adopts.push(id);
    campaign.adopters.push(req.userId);
  } else {
    user.adopts = user.adopts.filter((campaignId) => campaignId !== id);
    campaign.adopters = campaign.adopters.filter(
      (userId) => userId !== req.userId
    );
  }
  const updatedUser = await User.findByIdAndUpdate(req.userId, user, {
    new: true,
  });

  const updatedCampaign = await Campaign.findByIdAndUpdate(
    campaign._id,
    campaign,
    {
      new: true,
    }
  );
  res.status(200).json({ result: updatedUser });
};

const donateToCampaign = async (req, res) => {
  const user = await User.findOne({ _id: req.userId });
  const { from, ethValue, campaignId } = req.body;
  const donation = {
    account: from.toLowerCase(),
    contribution: ethValue,
    id: campaignId,
  };

  const index = user.donations.findIndex(
    (element) =>
      element.account == String(from).toLowerCase() &&
      element.id == String(campaignId)
  );

  // need to fix when key already exists
  if (index == -1) {
    user.donations.push(donation);
  } else {
    user.donations[index].contribution += parseFloat(ethValue);
  }
  await User.findByIdAndUpdate(req.userId, user);
  res.status(200).json({ result: user.donations });
};

const pullDonationFromCampaign = async (req, res) => {
  const user = await User.findOne({ _id: req.userId });
  const { from, campaignId } = req.body;
  const index = user.donations.findIndex(
    (element) =>
      element.account == String(from) && element.id == String(campaignId)
  );

  if (index > -1) {
    user.donations.splice(index, 1);
  }

  await User.findByIdAndUpdate(req.userId, user);
  res.status(200).json({ result: user.donations });
};

const pullDonationFromExternal = async (req, res) => {
  const { from, campaignId } = req.body;
  User.find({})
    .then((data) => {
      data.map(async (user, k) => {
        const index = user.donations.findIndex(
          (element) =>
            element.account == String(from) && element.id == String(campaignId)
        );
        if (index > -1) {
          user.donations.splice(index, 1);
        }
        await User.findByIdAndUpdate(req.userId, user);
      });
    })
    .catch((error) => {
      console.log(error);
    });
  const user = await User.findOne({ _id: req.userId });
  res.status(200).json({ result: user.donations });
};

const pullAllCampaignDonations = async (req, res) => {
  const { campaignId } = req.body;
  User.find({})
    .then((data) => {
      data.map(async (user, k) => {
        const newDonations = user.donations.filter(
          (donation) => donation.id !== String(campaignId)
        );
        user.donations = newDonations;
        const newUser = await User.findByIdAndUpdate(user._id, user, {
          new: true,
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
  res.status(200).json({ result: "success" });
};

const getUserCreatedCampaigns = async (req, res) => {
  const user = await User.findOne({ _id: req.userId });
  res.status(200).json({ result: user.campaignsCreated });
};

const createCampaign = async (req, res) => {
  const user = await User.findOne({ _id: req.userId });
  const { id } = req.params;
  await Campaign.create({
    campaignId: id,
    createdAt: new Date().toISOString(),
  });
  user.campaignsCreated.push(id);
  await User.findByIdAndUpdate(req.userId, user, {
    new: true,
  });

  res.status(200).json({ result: "Successfully created campaign" });
};

module.exports = {
  signin,
  signup,
  adoptCampaign,
  donateToCampaign,
  createCampaign,
  pullDonationFromCampaign,
  pullDonationFromExternal,
  pullAllCampaignDonations,
  getUserCreatedCampaigns,
  getUserDonations,
};
