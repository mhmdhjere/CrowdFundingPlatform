import { Routes, Route, useLocation } from "react-router-dom";
import Auth from "./components/Auth/Auth";
import FundDetails from "./modules/crowdFunds/Details";
import FundList from "./modules/crowdFunds/Campaigns";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import Adopts from "./modules/crowdFunds/Adopts";
import Donations from "./modules/crowdFunds/Donations";
import MyCampaigns from "./modules/crowdFunds/MyCampaigns";

const App = () => {
  const location = useLocation();

  useEffect(() => {}, [location]);

  return (
    <Routes>
      <Route path="/" exact element={<FundList />} />
      <Route path="/fund/:id" exact element={<FundDetails />} />
      <Route path="/auth" exact element={<Auth />} />
      <Route path="/adopts" exact element={<Adopts />} />
      <Route path="/donations" exact element={<Donations />} />
      <Route path="/my-campaigns" exact element={<MyCampaigns />} />
    </Routes>
  );
};

export default App;
