import React from "react";
import { useTracking } from "../Conetxt";
import Table from "./Table";

/**
 * Profile component showing the connected user's address and their shipments.
 */
const Profile = () => {
  const { currentAccount, myShipments } = useTracking();

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
      {currentAccount ? (
        <>
          <p className="mb-4">
            <strong>Address:</strong> {currentAccount}
          </p>
          <h3 className="text-xl font-semibold mb-2">My Shipments</h3>
          <Table shipments={myShipments} />
        </>
      ) : (
        <p>Please connect your wallet to view your shipments.</p>
      )}
    </div>
  );
};

export default Profile;
