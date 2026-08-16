// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/*
 * @title Tracking
 * @dev A simple supply chain tracking smart contract. It allows a sender to create a
 * shipment by providing the receiver address along with shipment details and a
 * deposit equal to the shipment price. The sender can start the shipment once it
 * has been created. The receiver can complete the shipment and trigger a
 * transfer of the deposit back to the sender when the shipment arrives. The
 * contract stores all shipments in a mapping indexed by an incrementing ID and
 * provides helper functions to fetch all shipments or shipments associated with
 * the caller. Shipments transition through three states: Pending (created but
 * not yet started), InTransit (shipment has started) and Completed (shipment
 * has been delivered).
 */
contract Tracking {
    /// @notice The possible states that a shipment can be in.
    enum Status {
        Pending,
        InTransit,
        Completed
    }

    /// @notice Struct representing a shipment record.
    struct Shipment {////missing:-uint256 deliveryTime in here;
        address sender;        // The account that created the shipment
        address receiver;      // The intended receiver of the shipment
        string pickup;         // Description of the pickup location
        string destination;    // Description of the destination location
        uint256 pickupTime;    // Timestamp when shipment was created
        uint256 arrivalTime;   // Timestamp when shipment was completed
        uint256 distance;      // Distance of the shipment in arbitrary units
        uint256 price;         // Deposit price for the shipment
        Status status;         // Current status of the shipment
        bool paid;             // Whether the deposit has been refunded
    }

    /// @notice Mapping of shipment IDs to shipment records.
    mapping(uint256 => Shipment) private _shipments;////why used here private, rather than public?

    /// @notice Mapping of address to list of shipment IDs associated with that address.
    mapping(address => uint256[]) private _shipmentsOf;////why used here private, rather than public?

    /// @notice Tracks the number of shipments created. Used to assign new IDs.
    uint256 public shipmentCount;

    /// @notice Event emitted when a new shipment is created.
    event ShipmentCreated(uint256 indexed id, address indexed sender, address indexed receiver, uint256 price);

    /// @notice Event emitted when a shipment has started.
    event ShipmentStarted(uint256 indexed id, address indexed sender);

    /// @notice Event emitted when a shipment has been completed.
    event ShipmentCompleted(uint256 indexed id, address indexed receiver);

    /// @dev Fallback function to receive Ether. Needed for the contract to accept deposits.
    receive() external payable {}
////no constructor used here; for shipmentCount=0; initialization.
    /**
     * @notice Create a new shipment.
     * @param _receiver The address of the person receiving the shipment.
     * @param _pickup Description of the pickup location.
     * @param _destination Description of the destination location.
     * @param _distance An arbitrary measure of distance for informational purposes.
     * @param _price The required deposit for the shipment. Must match the value sent.
     *
     * Requirements:
     * - `msg.value` must equal `_price` to lock the deposit in the contract.
     */
     ////in every Function daulat used 'public' word as return, but here used 'external';
    function createShipment(
        address _receiver,
        string memory _pickup,
        string memory _destination,
        uint256 _distance,
        uint256 _price
    ) external payable {////uses here public payable
        require(_receiver != address(0), "Receiver cannot be zero address");
        require(msg.value == _price, "Deposit must equal price");

        uint256 id = shipmentCount;
        _shipments[id] = Shipment({
            sender: msg.sender,
            receiver: _receiver,
            pickup: _pickup,
            destination: _destination,
            pickupTime: block.timestamp,
            arrivalTime: 0,
            distance: _distance,
            price: _price,
            status: Status.Pending,
            paid: false
        });
        _shipmentsOf[msg.sender].push(id);
        _shipmentsOf[_receiver].push(id);
        shipmentCount += 1;

        emit ShipmentCreated(id, msg.sender, _receiver, _price);////misssed here _pickupTime and _distance
    }

    /**
     * @notice Mark a shipment as started. Only the sender can start their shipment.
     * @param _id The ID of the shipment to start.
     */
     ////daulat used here 3-4 parameter pass in the fuction;
    function startShipment(uint256 _id) external {
        Shipment storage s = _shipments[_id];
        require(s.sender == msg.sender, "Only sender can start shipment");
        require(s.status == Status.Pending, "Shipment already started or completed");

        s.status = Status.InTransit;
        emit ShipmentStarted(_id, msg.sender);
    }

    /**
     * @notice Complete a shipment. Only the designated receiver can complete their shipment.
     * @param _id The ID of the shipment to complete.
     *
     * Emits a {ShipmentCompleted} event.
     */
     ////a lot of missed more here from daulat's
    function completeShipment(uint256 _id) external {
        Shipment storage s = _shipments[_id];
        require(s.receiver == msg.sender, "Only receiver can complete shipment");
        require(s.status == Status.InTransit, "Shipment is not in transit");
        require(!s.paid, "Shipment already completed");

        s.status = Status.Completed;
        s.arrivalTime = block.timestamp;
        s.paid = true;

        // Return the deposit back to the sender now that the shipment is complete
        payable(s.sender).transfer(s.price);

        emit ShipmentCompleted(_id, msg.sender);
    }

    /**
     * @notice Retrieve a shipment by ID.
     * @param _id The ID of the shipment to retrieve.
     */
    function getShipment(uint256 _id) external view returns (Shipment memory) {
        return _shipments[_id];
    }

    /**
     * @notice Retrieve all shipments. Useful for admins or analytics. Be careful with gas consumption.
     */
    function getAllShipments() external view returns (Shipment[] memory) {
        Shipment[] memory shipments = new Shipment[](shipmentCount);
        for (uint256 i = 0; i < shipmentCount; i++) {
            shipments[i] = _shipments[i];
        }
        return shipments;
    }

    /**
     * @notice Retrieve all shipments associated with the caller (as sender or receiver).
     */
    function getMyShipments() external view returns (Shipment[] memory) {
        uint256[] storage ids = _shipmentsOf[msg.sender];
        Shipment[] memory shipments = new Shipment[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            shipments[i] = _shipments[ids[i]];
        }
        return shipments;
    }
}