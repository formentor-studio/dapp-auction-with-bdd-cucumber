# dapp-auction-with-bdd-cucumber
Example of Dapp designed applying BDD and definition of tests with Cucumber

## Stack
- **Solidity** for smart contracts
- **solcjs** for compilation of smart contracts
- **cucumber** for test definition and execution

## Project setup
```
npm install
```

### Build Dapp smart contracts
```
npm run compile
```

### Launch tests
```
npm test
```

## Structure of the project
**/contracts**  
Sources of smart contracts (solidity code)
  
**/build**  
Json files that contain *abi* and *bytecode* generated in the compilation of smart contracts. Use **npm run compile** for compilation.

**/features**  
Feature files that define user stories

**/features/step_definitions**  
Tests related with features