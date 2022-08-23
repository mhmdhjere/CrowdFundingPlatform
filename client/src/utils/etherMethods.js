import { ethers } from "ethers";

export const convertEth = (bigNum) => {
  return ethers.utils.formatEther(bigNum);
};

export const getRemainingTime = (date) => {
  const converted = ethers.BigNumber.from(date).toString();
  return Math.ceil(
    (Number(converted) - new Date().getTime()) / 1000 / 60 / 60 / 24
  );
};
export const getRemainingTimeInSeconds = (date) => {
  const converted = ethers.BigNumber.from(date).toString();
  return Math.ceil(
    (Number(converted) - new Date().getTime()) / 1000
  );
}
export const convertBigNumber = (bigNum) => {
  return ethers.BigNumber.from(bigNum).toString();
};

export const convertToWei = (eth) => {
  return ethers.utils.parseEther(eth);
};

export const unixToLocaleDate = (timeStamp) => {
  const dateObject = new Date(timeStamp);
  return `${
    dateObject.toLocaleString("en-US", { month: "long" }) +
    " " +
    dateObject.toLocaleString("en-US", { day: "numeric" }) +
    "," +
    " " +
    dateObject.toLocaleString("en-US", { year: "numeric" })
  }`;
};

export const getCampaignStatus = (
  active,
  endDate,
  raisedAmount,
  donationGoal
) => {
  let remainingTime = getRemainingTimeInSeconds(endDate);
  if (!active) {
    return "Closed";
  }
  if (remainingTime <= -90) {
    return "Neglected";
  }
  let raised = parseFloat(convertEth(raisedAmount));
  let goal = parseFloat(convertEth(donationGoal));

  if (raised >= goal) {
    return "Goal reached";
  }
  if (remainingTime <= 0) {
    if (raised < goal) {
      return "Goal not reached";
    }
  } else {
    return "Active";
  }
};
