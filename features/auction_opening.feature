Feature: Auction opening

   The auctioneer opens the auction by announcing a reserve for the item on sale.
   Scenario: Auctioned items must be shown and described in detail
    When Open auction for "Porsche 550 RS Spyder 1954"
    Then Smart contract for Auction of "Porsche 550 RS Spyder 1954" must be created

   Scenario: Auction of items with not suitable description must be rejected
    When Open auction for "Car"
    Then Smart contract for Auction rejected due to "Poor description"
   
   Scenario: Auctioned items must have reserve price
    When Open auction and reserve price is 3000000
    Then Smart contract created with reserve price of 3000000

   Scenario: Auctions with reserve equals to 0 must be rejected
    When Open auction and reserve price is 0
    Then Smart contract for Auction rejected due to "Reserve must be greater than 0"