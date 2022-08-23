import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" });

API.interceptors.request.use((req) => {
  if (localStorage.getItem("profile")) {
    req.headers.Authorization = `Bearer ${
      JSON.parse(localStorage.getItem("profile")).token
    }`;
  }

  return req;
});

export const adoptCampaign = (id) => API.patch(`/user/${id}/adoptCampaign`);
export const signIn = (formData) => API.post("/user/signin", formData);
export const signUp = (formData) => API.post("/user/signup", formData);
export const donateToCampaign = (donationData) =>
  API.post("/user/donate", donationData);
export const pullDonationFromCampaign = (pullData) =>
  API.post("/user/pull", pullData);
export const pullDonationFromExternal = (pullData) =>
  API.post("/user/extPull", pullData);
export const pullAllCampaignDonations = (pullData) =>
  API.post("/user/pullAll", pullData);
export const getUserDonations = () => API.get(`/user/getUserDonations`);
export const getUserCreatedCampaigns = () => API.get(`/user/getUserCampaigns`);
export const createCampaign = (campaignId) =>
  API.post(`/user/${campaignId}/createCampaign`, campaignId);

export const getCampaignAdopters = (id) =>
  API.get(`/campaign/${id}/getAdopters`);
