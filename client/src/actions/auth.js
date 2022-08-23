import {
  AUTH,
  ADOPT,
  DONATE,
  PULL_DONATION,
  PULL_DONATION_EXTERNAL,
  ERROR_AUTH,
  LOADING_AUTH,
} from "../utils/actionTypes";
import * as api from "../api/index.js";

export const signin = (formData, router) => async (dispatch) => {
  try {
    dispatch({ type: LOADING_AUTH });
    const { data } = await api.signIn(formData);
    dispatch({ type: AUTH, data });
    router("/");
  } catch (error) {
    dispatch({ type: ERROR_AUTH });
    console.log(error);
  }
};

export const signup = (formData, router) => async (dispatch) => {
  try {
    dispatch({ type: LOADING_AUTH });
    const { data } = await api.signUp(formData);
    dispatch({ type: AUTH, data });
    router("/");
  } catch (error) {
    dispatch({ type: ERROR_AUTH });
    console.log(error);
  }
};

export const adoptCampaign = (id) => async (dispatch) => {
  const user = JSON.parse(localStorage.getItem("profile"));
  try {
    const { data } = await api.adoptCampaign(id, user?.token);
    dispatch({ type: ADOPT, data: data.result });
  } catch (error) {
    console.log(error);
  }
};

export const donateToCampaign = (donationData) => async (dispatch) => {
  try {
    const { data } = await api.donateToCampaign(donationData);
    dispatch({ type: DONATE, data: data.result });
  } catch (error) {
    console.log(error);
  }
};

export const pullDonationFromCampaign = (pullData) => async (dispatch) => {
  try {
    const { data } = await api.pullDonationFromCampaign(pullData);
    dispatch({ type: PULL_DONATION, data: data.result });
  } catch (error) {
    console.log(error);
  }
};

export const pullDonationFromExternal = (pullData) => async (dispatch) => {
  try {
    const { data } = await api.pullDonationFromExternal(pullData);
    dispatch({ type: PULL_DONATION_EXTERNAL, data: data.result });
  } catch (error) {
    console.log(error);
  }
};

export const pullAllCampaignDonations = (pullData) => async (dispatch) => {
  try {
    const { data } = await api.pullAllCampaignDonations(pullData);
    dispatch({ type: PULL_DONATION, data: data.result });
  } catch (error) {
    console.log(error);
  }
};

export const createCampaign = (campaignId) => async (dispatch) => {
  try {
    await api.createCampaign(campaignId);
  } catch (error) {
    console.log(error);
  }
};
