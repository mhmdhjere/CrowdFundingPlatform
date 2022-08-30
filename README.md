# CrowdFundingPlatform
Crowd funding platform using blockchain technology & React:



# Server side setup: 

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
Copy the contract address you have got from server side and save it in ```client/utils/constants.js```.
Copy from the server the file ```server/artifacts/contracts/CrowdFunding.json``` and paste it into ```client/src/contract/abis```

Then run these commands in order:
```shell
npm install
npm start
```

