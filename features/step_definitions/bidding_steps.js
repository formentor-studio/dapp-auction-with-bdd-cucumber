const assert = require('assert');
const { Given, When, Then, Before } = require('cucumber')
const { abi, bytecode } = require('../../build/Auction')
const ganache = require('ganache-cli'); // Mockup of eth network
const web3 = new (require('web3'))(ganache.provider());

let state = {
    auction: undefined,
    error: undefined
}

Before(() => {
    state.auction = undefined
    state.error = undefined
})
/**
 * Scenario: Bids higher than reserve price are accepted
 */
 
// Given Auction with reserve price 200000
Given('Auction with reserve price {int}', async function (reservePrice) {
    state.auction = await createAuction( { name: "Awesome super car", reservePrice, timeoutPeriod: 120 } )
});
       
// When A buyer make a bid for 195000
When('A buyer make a bid for {int}', async function (amount) {
    assert.ok(state.auction.options.address)

    try {
        const accounts = await web3.eth.getAccounts()
        await bid(state.auction, accounts[1], amount)
    } catch ( e ) {
        state.error = e.message
    }
});

// Then Bid for 205000 is accepted
Then('Bid for {int} is accepted', async function (amount) {
    assert.ok(!state.error)
    
    let highBidder
    let highBid
    // Capture last 'Bid' event
    state.auction.getPastEvents('Bid' , { fromBlock: 0, toBlock: 'latest' } , (error, events) => {
        assert.ok(!error)
        assert.ok( events.length > 0 )

        const index = events.length - 1
        highBidder = events[index].returnValues.highBidder
        highBid = events[index].returnValues.highBid
    })

    const accounts = await web3.eth.getAccounts()
    assert.equal(highBidder, accounts[1])
    assert.equal(highBid, amount)
});

/**
 * Scenario: Bid lower than reserve price are rejected
 */
       
// Then Bid is rejected due to "Bid must be greater than reserve"
Then('Bid is rejected due to {string}', function (error) {
    assert.ok(state.error)
    assert.ok(state.error.indexOf(error) > 0)
});
       
/**
 * Scenario: Bids higher than current bid more the minimun increment are accepted
 */

 // Given Auction with current bid equals to 200000 and auctioneer increments price 5000
Given('Auction with current bid equals to {int} and auctioneer increments price {int}', async function (highBid, increment) {

    // Create auction
    state.auction = await createAuction( { name: "Awesome super car", reservePrice: 1, minIncrement: increment, timeoutPeriod: 120 } )

    const accounts = await web3.eth.getAccounts()
    await bid( state.auction,  accounts[1], highBid )
});

/**
 * Scenario: Bids lower than current bid more the minimun increment must be rejected
 */

       
/**
 * Scenario: Bids made before the end of the auction are accepted
 */

 // Given Auction with waiting time equals to 5 minutes
Given('Auction with waiting time equals to {int} minutes', async function ( timeoutPeriod ) {
    // unit of "timeoutPeriod" is seconds
    state.auction = await createAuction( { name: "Awesome super car", reservePrice: 1, timeoutPeriod } )
});
       
// And 3 minutes have passed since the last bid
Given('{int} minutes have passed since the last bid', function (time) {
    pause(time)
});
       
// When A buyer make a bid
When('A buyer make a bid', async function () {
    assert(state.auction)

    const accounts = await web3.eth.getAccounts()
    try {
        await bid( state.auction,  accounts[1], 10 )
    } catch( e ) {
        state.error = e.message
    }
});
       
// Then Bid is accepted
Then('Bid is accepted', function () {
    assert.ok(!state.error)
});
       
/**
 * Scenario: Bids made after the end of auction must be rejected
 */

      
// Helper functions
async function createAuction( { name, reservePrice, minIncrement, timeoutPeriod } ) {
    const accounts = await web3.eth.getAccounts()

    const deploy = new web3.eth.Contract(JSON.parse(abi))
    .deploy({
        data: bytecode,
        arguments: [name, ( reservePrice || 1 ), ( minIncrement || 0 ), ( timeoutPeriod || 0 )]
    })
    const gas = await estimateGas(deploy)
    let auction
    try {
       auction = await deploy.send({
            from: accounts[0],
            gas
        })
    } catch (e) {
        state.error = e.message
    }

    return auction
}

async function bid( auction, account, amount ) {
    const method = auction.methods.bid(amount)
    const gas = await estimateGas(method)
    
    const balance = await auction.methods.balanceOf(account).call()
    const value = amount - parseInt(balance)
    await method.send({
        from: account,
        gas: gas,
        value: value
    })
}

function pause(seconds) {
    const millis = 1000*seconds
	const dt = new Date();
	while ((new Date()) - dt <= millis) {  }
}

async function estimateGas(deploy) {
    let gas = await deploy.estimateGas()
    gas = parseInt(gas)
    gas += parseInt(gas*2.5)

    return gas
}