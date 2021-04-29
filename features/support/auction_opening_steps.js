const assert = require('assert').strict;
const { Given, When, Then } = require('@cucumber/cucumber');
const { abi, bytecode } = require('../../build/Auction')
const ganache = require('ganache-cli'); // Mockup of eth network
const web3 = new (require('web3'))(ganache.provider());

let state = {
    auction: undefined,
    error: undefined
}
/**
 * Scenario: Auctioned items must be shown and described in detail
 */

// When Open auction for "Porsche 550 RS Spyder 1954"
When('Open auction for {string}', async function (name) {
    const accounts = await web3.eth.getAccounts()
    try {
        const deploy = new web3.eth.Contract(JSON.parse(abi))
        .deploy({
            data: bytecode,
            arguments: [name, 1, 0, 0]
        })
        const gas = await estimateGas(deploy)

        state.auction = await deploy.send({
            from: accounts[0],
            gas
        })
    } catch (e) {
        state.error = e.message
    }
});

// Then Smart contract for Auction of "Porsche 550 RS Spyder 1954" must be created
Then('Smart contract for Auction of {string} must be created', async function (name) {
    assert.ok(state.auction)
    assert.ok(state.auction.options.address)
    const actual_name = await state.auction.methods.name().call()
    assert.equal(actual_name, name)
});

/**
 * Scenario: Auction of items with not suitable description must be rejected
 */

// Then Smart contract for Auction rejected due to "Poor description"
Then('Smart contract for Auction rejected due to {string}', function (error) {
    assert.ok(state.error)
    assert.ok(state.error.indexOf(error) > 0)
});

/**
 * Scenario: Auctioned items must have reserve price
 */

// When Open auction and reserve price is 3000000
When('Open auction and reserve price is {int}', async function (reserve) {
    const accounts = await web3.eth.getAccounts()

    try {

        const deploy = new web3.eth.Contract(JSON.parse(abi))
        .deploy({
            data: bytecode,
            arguments: ["Awesome super car", reserve, 0, 0]
        })
        const gas = await estimateGas(deploy)

        state.auction = await deploy.send({
            from: accounts[0],
            gas
        })
    } catch (e) {
        state.error = e.message
    }
});

// Then Smart contract created with reserve price of 3000000
Then('Smart contract created with reserve price of {int}', async function (reserve) {
    assert.ok(state.auction)
    assert.ok(state.auction.options.address)
    const actual_reserve = parseInt(await state.auction.methods.reservePrice().call())
    assert.equal(actual_reserve, reserve)
});

// Helper functions
async function estimateGas(deploy) {
    let gas = await deploy.estimateGas()
    gas = parseInt(gas)
    gas += parseInt(gas/4)

    return gas
}
