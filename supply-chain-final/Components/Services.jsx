import React from "react";

/**
 * Informational component outlining the services provided by the dApp.
 */
const Services = () => {
  const services = [
    {
      title: "Create Shipments",
      description:
        "Easily create shipments with deposit escrow and record them immutably on the blockchain.",
    },
    {
      title: "Real‑Time Tracking",
      description:
        "Track the status of your shipments at a glance – pending, in transit or completed.",
    },
    {
      title: "Start & Complete",
      description:
        "Senders can start shipments once ready and receivers can complete them upon delivery.",
    },
    {
      title: "Transparency",
      description:
        "All transactions are recorded on chain providing complete transparency and trust.",
    },
  ];

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold text-center mb-8">Our Services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
            <p className="text-sm text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
