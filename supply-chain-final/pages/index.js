import React from "react";
import Head from "next/head";
import { TrackingProvider, useTracking } from "../Conetxt";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import Form from "../Components/Form";
import Table from "../Components/Table";
import StartShipment from "../Components/StartShipment";
import CompleteShipment from "../Components/CompleteShipment";
import GetShipment from "../Components/GetShipment";
import Services from "../Components/Services";
import Profile from "../Components/Profile";

// Helper component to consume context inside the provider
const HomeContent = () => {
  const { allShipments } = useTracking();
  return (
    <div className="max-w-7xl mx-auto px-4">
      <Form />
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">All Shipments</h2>
        <Table shipments={allShipments} />
      </div>
      <Profile />
      <StartShipment />
      <CompleteShipment />
      <GetShipment />
      <Services />
    </div>
  );
};

export default function Home() {
  return (
    <TrackingProvider>
      <Head>
        <title>Supply Chain DApp</title>
        <meta
          name="description"
          content="Decentralized supply chain management application using Ethereum"
        />
      </Head>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 bg-gray-50 pb-12">
          <HomeContent />
        </main>
        <Footer />
      </div>
    </TrackingProvider>
  );
}
