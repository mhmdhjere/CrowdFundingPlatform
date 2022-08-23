import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import { ContractABI, ContractAddress } from "../utils/constants";

export const CampaignsContext = React.createContext();

const { ethereum } = window;

export const CampaignsProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getContractByProvider = () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        ContractAddress,
        ContractABI,
        provider
      );
      return contract;
    } catch (err) {
      throw err;
    }
  };

  const getContractBySigner = () => {
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      window.ethereum.enable();
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        ContractAddress,
        ContractABI,
        signer
      );
      return contract;
    } catch (err) {
      throw err;
    }
  };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  function showError(msg = "") {
    return Swal.fire({
      icon: "error",
      title: "Oops...",
      text: msg ? msg : "Something went wrong!",
    });
  }
  window.ethereum.on("accountsChanged", function (accounts) {
    setCurrentAccount(accounts[0]);
    // window.location.reload();
  });

  useEffect(() => {
    checkIfWalletIsConnect();
  }, []);

  return (
    <CampaignsContext.Provider
      value={{
        connectWallet,
        getContractByProvider,
        getContractBySigner,
        showError,
        currentAccount,
        isLoading,
      }}
    >
      {children}
    </CampaignsContext.Provider>
  );
};
