require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.8",
  networks: {
    // hardhat: {
    //   chainId: 1337,
    // },
    goerli: {
      url: "https://goerli.infura.io/v3/89b7dd3599cd42c3b2f7c961f2067df1",
      accounts: [
        "25ee8b105508719c573ffb9791f3e3f906256305cf5e188a5263c86674b17d33",
      ],
    },
  },
};
