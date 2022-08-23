// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// Errors
error NotDonator();
error NotOwner();
error CampaignIsClosed();
error OutOfBoundsIndex();
error CampaignHasNotReachedDonationGoal();
error CampaignHasReachedDonationGoal();
error DonationValueBelowMinimum();
error IllegalParameters();
error IllegalDonation();
error NeglectedCampaign();
error PullAllDonationNotAllowed();
error IllegalPullDonation();
error pullDonationExternalNotAllowed();

// Campaign Struct
struct Campaign {
    // Variables
    string campaignName;
    string description;
    address ownerID;
    uint256 endDate;
    uint256 solidityEndDate;
    uint256 donationGoal;
    uint256 raisedAmount;
    uint256 campaignID;
    bool active;
}

struct CampaignDonations {
    address[] donatorAddresses;
    mapping(address => uint256) donations;
}

// CrowdFundingPlatform
contract CrowdFunding {
    // Events
    event Returns(uint256);
    // Variables
    Campaign[] public campaigns;
    uint256 public projectCount;
    CampaignDonations[] donations;
    uint256 public constant MINIMUM_DONATION_VALUE = 5000000000000000;

    // Methods
    function createCampaign(
        string memory _campaignName,
        string memory _description,
        int256 _endDate,
        int256 _donationGoal
    )
        public
        legalParameters(
            _campaignName,
            _description,
            _endDate / 1000,
            _donationGoal
        )
    {
        campaigns.push(
            Campaign({
                campaignName: _campaignName,
                description: _description,
                ownerID: msg.sender,
                endDate: uint(_endDate),
                solidityEndDate: uint(_endDate) / 1000,
                donationGoal: uint(_donationGoal),
                campaignID: projectCount,
                active: true,
                raisedAmount: 0
            })
        );
        // this line adds a new mapping to the array
        donations.push();
        projectCount++;
        emit Returns(projectCount - 1);
    }

    function Donate(int256 campaignID)
        public
        payable
        legalIndex(campaignID)
        legalDonation(uint(campaignID))
    {
        Campaign storage campaign = campaigns[uint(campaignID)];
        CampaignDonations storage campaignDonations = donations[
            uint(campaignID)
        ];
        campaign.raisedAmount += msg.value;
        if (campaignDonations.donations[msg.sender] == 0) {
            campaignDonations.donatorAddresses.push(msg.sender);
        }
        campaignDonations.donations[msg.sender] += msg.value;
    }

    function pullDonation(int256 campaignID, int256 _pullDonationAmount)
        public
        legalIndex(campaignID)
        legalPullDonation(uint(campaignID))
        isPositive(_pullDonationAmount)
    {
        uint256 pullDonationAmount = uint(_pullDonationAmount);
        // pull the donation
        Campaign storage campaign = campaigns[uint(campaignID)];
        CampaignDonations storage campaignDonations = donations[
            uint(campaignID)
        ];

        if (pullDonationAmount > campaignDonations.donations[msg.sender]) {
            pullDonationAmount = campaignDonations.donations[msg.sender];
        }

        (bool success, ) = payable(msg.sender).call{value: pullDonationAmount}(
            ""
        );
        require(success, "Transfer failed.");
        // delete donation from campaign donators history
        if (pullDonationAmount == campaignDonations.donations[msg.sender]) {
            for (
                uint index = 0;
                index < campaignDonations.donatorAddresses.length;
                index++
            ) {
                if (campaignDonations.donatorAddresses[index] == msg.sender) {
                    campaignDonations.donatorAddresses[
                        index
                    ] = campaignDonations.donatorAddresses[
                        campaignDonations.donatorAddresses.length - 1
                    ];
                    campaignDonations.donatorAddresses.pop();
                    break;
                }
            }
        }
        campaign.raisedAmount -= pullDonationAmount;
        campaignDonations.donations[msg.sender] -= pullDonationAmount;
    }

    function pullAllCampaignDonations(int256 campaignID)
        public
        legalIndex(campaignID)
        legalPullAllDonation(uint(campaignID))
    {
        Campaign storage campaign = campaigns[uint(campaignID)];
        CampaignDonations storage campaignDonations = donations[
            uint(campaignID)
        ];
        address donatorAddress;
        bool success;
        for (
            uint index = campaignDonations.donatorAddresses.length - 1;
            index > 0;
            index--
        ) {
            donatorAddress = campaignDonations.donatorAddresses[index];
            (success, ) = payable(donatorAddress).call{
                value: campaignDonations.donations[donatorAddress]
            }("");
            require(success, "Transfer failed.");
            campaign.raisedAmount -= campaignDonations.donations[
                donatorAddress
            ];
            campaignDonations.donations[donatorAddress] = 0;
            campaignDonations.donatorAddresses.pop();
        }
        donatorAddress = campaignDonations.donatorAddresses[0];
        // TODO: check double spending problem
        (success, ) = payable(donatorAddress).call{
            value: campaignDonations.donations[donatorAddress]
        }("");
        require(success, "Transfer failed.");
        campaign.raisedAmount -= campaignDonations.donations[donatorAddress];
        campaignDonations.donations[donatorAddress] = 0;
        campaignDonations.donatorAddresses.pop();
    }

    function pullDonationExternal(int256 campaignID, address donatorAddress)
        public
        legalIndex(campaignID)
        legalPullDonationExternal(uint(campaignID), donatorAddress)
    {
        CampaignDonations storage campaignDonations = donations[
            uint(campaignID)
        ];
        Campaign storage campaign = campaigns[uint(campaignID)];
        (bool success, ) = payable(donatorAddress).call{
            value: campaignDonations.donations[donatorAddress]
        }("");
        require(success, "Transfer failed.");
        campaign.raisedAmount -= campaignDonations.donations[donatorAddress];
        campaignDonations.donations[donatorAddress] = 0;
        for (
            uint index = 0;
            index < campaignDonations.donatorAddresses.length;
            index++
        ) {
            if (campaignDonations.donatorAddresses[index] == donatorAddress) {
                campaignDonations.donatorAddresses[index] = campaignDonations
                    .donatorAddresses[
                        campaignDonations.donatorAddresses.length - 1
                    ];
                campaignDonations.donatorAddresses.pop();
                break;
            }
        }
    }

    function closeCampaign(int256 campaignID)
        public
        payable
        legalIndex(campaignID)
        onlyOwner(campaignID)
        legalCloseCampaign(uint(campaignID))
    {
        Campaign storage campaign = campaigns[uint(campaignID)];
        (bool success, ) = payable(campaign.ownerID).call{
            value: campaign.raisedAmount
        }("");
        require(success, "Transfer failed.");
        campaign.active = false;
    }

    function getDonatorAddress(int256 campaignID, int256 index)
        public
        view
        indexInBound(campaignID)
        returns (address)
    {
        return donations[uint(campaignID)].donatorAddresses[uint(index)];
    }

    function getNumberOfDonaters(int256 campaignID)
        public
        view
        indexInBound(campaignID)
        returns (uint256)
    {
        return donations[uint(campaignID)].donatorAddresses.length;
    }

    function getDonatorDonation(int256 campaignID, address userAddress)
        public
        view
        indexInBound(campaignID)
        returns (uint256)
    {
        CampaignDonations storage campaignDonations = donations[
            uint(campaignID)
        ];
        return campaignDonations.donations[userAddress];
    }

    modifier indexInBound(int256 campaignID) {
        if ((campaignID < 0) || (campaignID >= int(campaigns.length))) {
            revert OutOfBoundsIndex();
        }
        _;
    }

    modifier legalIndex(int256 campaignID) {
        if ((campaignID < 0) || (campaignID >= int(campaigns.length))) {
            revert OutOfBoundsIndex();
        }
        uint campaignInBoundID = uint256(campaignID);
        Campaign memory campaign = campaigns[campaignInBoundID];
        if (campaign.active == false) {
            revert CampaignIsClosed();
        }
        _;
    }

    modifier onlyOwner(int256 campaignID) {
        if (msg.sender != campaigns[uint(campaignID)].ownerID)
            revert NotOwner();
        _;
    }

    modifier legalDonation(uint256 campaignID) {
        if (msg.value < MINIMUM_DONATION_VALUE)
            revert DonationValueBelowMinimum();
        if (campaigns[campaignID].solidityEndDate < block.timestamp)
            revert CampaignIsClosed();
        if (msg.sender == campaigns[campaignID].ownerID)
            revert IllegalDonation();
        _;
    }

    modifier legalParameters(
        string memory _campaignName,
        string memory _description,
        int256 _endDate,
        int256 _donationGoal
    ) {
        if (bytes(_campaignName).length <= 0) revert IllegalParameters();
        if (bytes(_description).length <= 0) revert IllegalParameters();
        if ((_endDate <= 0) || (_donationGoal <= 0)) revert IllegalParameters();
        if (uint(_endDate) < block.timestamp) revert IllegalParameters();
        _;
    }

    modifier legalPullDonation(uint256 campaignID) {
        if (donations[campaignID].donations[msg.sender] == 0) {
            revert NotDonator();
        }
        if (campaigns[campaignID].active == false) {
            revert CampaignIsClosed();
        }
        // campaign has not yet reached the end date
        if (campaigns[campaignID].solidityEndDate > block.timestamp) {
            if (
                campaigns[campaignID].raisedAmount >=
                campaigns[campaignID].donationGoal
            ) {
                revert CampaignHasReachedDonationGoal();
            }
        }
        // campaign in 3 month period after the end date
        if (
            (block.timestamp > campaigns[campaignID].solidityEndDate) &&
            (block.timestamp - campaigns[campaignID].solidityEndDate <=
                90 seconds)
        ) {
            if (
                campaigns[campaignID].raisedAmount >=
                campaigns[campaignID].donationGoal
            ) {
                revert CampaignHasReachedDonationGoal();
            }
        }
        _;
    }

    modifier legalPullAllDonation(uint256 campaignID) {
        if (campaigns[campaignID].active == false) {
            revert CampaignIsClosed();
        }
        // campaign has not yet reached the end date
        if (campaigns[campaignID].solidityEndDate > block.timestamp) {
            revert PullAllDonationNotAllowed();
        }
        // campaign in 3 month period after the end date
        if (
            block.timestamp - campaigns[campaignID].solidityEndDate <=
            90 seconds
        ) {
            if (
                campaigns[campaignID].raisedAmount >=
                campaigns[campaignID].donationGoal
            ) {
                revert PullAllDonationNotAllowed();
            }
        }
        _;
    }

    modifier legalPullDonationExternal(
        uint256 campaignID,
        address donatorAddress
    ) {
        if (campaigns[campaignID].active == false) {
            revert CampaignIsClosed();
        }
        if (donations[campaignID].donations[donatorAddress] == 0) {
            revert NotDonator();
        }
        // campaign has not yet reached the end date
        if (campaigns[campaignID].solidityEndDate > block.timestamp) {
            revert pullDonationExternalNotAllowed();
        }
        // campaign in 3 month period after the end date
        if (
            block.timestamp - campaigns[campaignID].solidityEndDate <=
            90 seconds
        ) {
            if (
                campaigns[campaignID].raisedAmount >=
                campaigns[campaignID].donationGoal
            ) {
                revert pullDonationExternalNotAllowed();
            }
        }
        _;
    }

    modifier legalCloseCampaign(uint256 campaignID) {
        if (
            (block.timestamp > campaigns[campaignID].solidityEndDate) &&
            (block.timestamp - campaigns[campaignID].solidityEndDate >
                90 seconds)
        ) {
            revert NeglectedCampaign();
        }
        if (
            campaigns[campaignID].raisedAmount <
            campaigns[campaignID].donationGoal
        ) {
            revert CampaignHasNotReachedDonationGoal();
        }
        _;
    }

    modifier isPositive(int256 num) {
        if (num <= 0) revert IllegalParameters();
        _;
    }
}
