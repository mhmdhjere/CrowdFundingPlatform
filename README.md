# CrowdFundingPlatform
Crowd funding platform using blockchain technology, React and Node.js: 

# MongoDB setup:
Go to [MongoDB cloud](https://cloud.mongodb.com/),
make a new cluster and copy the connection link into the .env file in server folder.

Here is a tutorial: 
[How to Connect Node.js App to MongoDB](https://www.youtube.com/watch?v=bhiEJW5poHU&t=657s)

# Blockchain setup:
You can either connect locally or to a testnet.
* Local connection: ```server/hardhat.conifg.js``` should look like this:
```javascript
require("@nomiclabs/hardhat-waffle");
module.exports = {
  solidity: "0.8.8",
  networks: {
    hardhat: {
      chainId: 1337,
    },
  },
};
```
* Tesnet connection:
In order to connect to a testnet you will need a "node infrastructure provider", you can get an API Key to use from [Infura](https://infura.io/) or [Alchemy](https://alchemy.com/) (There are others but these are recommended).

Here are two tutorials: [Infura account connection](https://www.youtube.com/watch?v=0nzWrW5920A)
or [How to get Alchemy API Key](https://www.youtube.com/watch?v=tfggWxfG9o0).

In this case ```server/hardhat.conifg.js``` should look like this:
```javascript
require("@nomiclabs/hardhat-waffle");
module.exports = {
  solidity: "0.8.8",
  networks: {
    goerli: {
      url: "https://goerli.infura.io/v3/89b7dd3599cd42c3b2f7c961f2067df1",
      accounts: [
        "646004a01abfd42d07df28cf239a0b6b74ba8d96809cd788f32f710247ed33cd",
      ],
    },
  },
};

```

The testnet name here is ```gerli```, you can choose any other available testnet, the ```url``` should be replaced with the API key you got from Infura or Alchemy, in the ```accounts``` you should specify the private key(s) of the account(s) that you are willing to use for deploying your contract.


# Server side setup: 

First of all you have to specify the port the node.js server will run on, (default is 5000), you can set it in ```server/.env``` file.

To start run these commands in order (replace testnet_name with the name of testnet you use):
```shell
npm install
npx hardhat run scripts/deployCrowdFunding.js --network testnet_name
npm start
```

In case you want to run it locally then (testname_name = localhost) and you have to run your own local node after ```npm install```
By using the command:
```npx hardhat node```



After running the command: 
```npx hardhat run scripts/deployCrowdFunding.js --network testnet_name``` 

You will get a similar output like this:
```CrowdFunding address:  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512```

Keep the address to use it in the client side.


# Client side setup: 
Copy the contract address you have got from server side and save it in ```client/.env``` file.
Copy from the server the file ```server/artifacts/contracts/CrowdFunding.json``` and paste it into ```client/src/contract/abis```

Then run these commands in order:
```shell
npm install
npm start
```

