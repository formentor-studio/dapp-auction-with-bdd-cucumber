pragma solidity ^0.5.0;

contract Auction {
    address seller;

    string public name;
    uint256 public reservePrice;
    uint256 public minIncrement;
    uint256 public timeoutPeriod;
    uint256 public auctionEnd;

    address highBidder;
    mapping(address => uint256) public balanceOf;

    event Bid(address highBidder, uint256 highBid);

    constructor (
        string memory _name,
        uint256 _reservePrice,
        uint256 _minIncrement,
        uint256 _timeoutPeriod) public {
            require(bytes(_name).length > 10, "Poor description");
            require(_reservePrice > 0, "Reserve must be greater than 0");
            name = _name;
            reservePrice = _reservePrice;
            minIncrement = _minIncrement;
            timeoutPeriod = _timeoutPeriod;
            seller = msg.sender;
            auctionEnd = now + timeoutPeriod;
    }

    function bid(uint256 amount) public payable {
        require(now < auctionEnd, "Auction is ended");
        require(amount >= reservePrice, "Bid amount must be greater than reserve");
        require(amount >= balanceOf[highBidder] + minIncrement, "Bid amount does not reach highest bid");

        balanceOf[msg.sender] += msg.value;
        require(balanceOf[msg.sender] == amount, "Escrowed amount is different of bid");

        highBidder = msg.sender;

        auctionEnd = now + timeoutPeriod;

        emit Bid(highBidder, amount);
    }

}