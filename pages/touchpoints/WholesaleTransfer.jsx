import React, { useEffect } from "react";
import TouchpointStageLayout from "@/components/touchpoints/TouchpointStageLayout";

export default function WholesaleTransfer() {
  useEffect(() => {
    document.title = "touchpoints | TraceGuard";
  }, []);

  return (
    <TouchpointStageLayout
      title="Wholesale Transfer"
      intro="Nigeria's wholesale and distribution tier is where most supply chain integrity breaks down. TraceGuard tracks every custody change, split shipment, and re-aggregation event — making diversion and grey-market routing visible."
      highlights={[
        { line1: "Every split and transfer recorded", line2: "Custody integrity preserved at every handoff" },
      ]}
      prev={{ to: "/touchpoints/port-of-entry", label: "Port of Entry" }}
      sections={[
        {
          heading: "De-aggregation",
          body: "When a distributor splits a pallet to send partial inventory to multiple outlets, a de-aggregation event breaks the parent binding. Each child item is released for independent tracking before being re-bound.",
        },
        {
          heading: "Re-aggregation",
          body: "Released items are re-bound into new case or pallet structures for onward transfer. The backend creates a new aggregation graph with a new custodian identity — ensuring child ownership is always exact.",
        },
        {
          heading: "Custody Change Recording",
          body: "Every transfer event records the sending partner, receiving partner, transfer location, timestamp, and operator identity. The ownership history is preserved indefinitely in the immutable trace ledger.",
        },
        {
          heading: "Diversion Signal Detection",
          body: "When goods appear in a geographic zone inconsistent with the authorised distribution route, the anomaly engine raises a diversion signal. NAFDAC field teams can be alerted for targeted inspection.",
        },
      ]}
      capabilities={[
        { title: "Inventory Management", subtitle: "De-aggregate and re-aggregate with precision" },
        { title: "Route Compliance", subtitle: "Diversion signals flagged automatically" },
      ]}
      next={{
        to: "/touchpoints/retail-receipt",
        title: "Retail Receipt",
        subtitle: "Completing the authorised chain at pharmacy level",
      }}
    />
  );
}
