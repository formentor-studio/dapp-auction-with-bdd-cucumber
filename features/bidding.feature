Feature: Auction bidding

   Buyers bid for items on sale
   Scenario: Bids higher than reserve price are accepted
    Given Auction with reserve price 200000
    When A buyer make a bid for 205000
    Then Bid for 205000 is accepted

   Scenario: Bid lower than reserve price are rejected
    Given Auction with reserve price 200000
    When A buyer make a bid for 195000
    Then Bid is rejected due to "Bid amount must be greater than reserve"

   Scenario: Bids higher than current bid more the minimun increment are accepted
    Given Auction with current bid equals to 200000 and auctioneer increments price 5000
    When A buyer make a bid for 205000
    Then Bid for 205000 is accepted

   Scenario: Bids lower than current bid more the minimun increment must be rejected
    Given Auction with current bid equals to 200000 and auctioneer increments price 5000
    When A buyer make a bid for 203000
    Then Bid is rejected due to "Bid amount does not reach highest bid"

   Scenario: Bids made before the end of the auction are accepted
    Given Auction with waiting time equals to 5 minutes
    And 3 minutes have passed since the last bid
    When A buyer make a bid
    Then Bid is accepted

   Scenario: Bids made after the end of auction must be rejected
    Given Auction with waiting time equals to 5 minutes
    And 6 minutes have passed since the last bid
    When A buyer make a bid
    Then Bid is rejected due to "Auction is ended"
   
