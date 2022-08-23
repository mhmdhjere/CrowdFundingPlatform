const main = async () => {
    const CrowdFundingFactory = await hre.ethers.getContractFactory(
      "CrowdFunding"
    );
    const CrowdFundingContract = await CrowdFundingFactory.deploy();
  
    await CrowdFundingContract.deployed();
  
    console.log("CrowdFunding address: ", CrowdFundingContract.address);
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  };
  
  runMain();
  