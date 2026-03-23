import React, { useEffect } from "react";
import TouchpointStageLayout from "@/components/touchpoints/TouchpointStageLayout";

export default function PortOfEntry() {
  useEffect(() => {
    document.title = "touchpoints | TraceSafe AI";
  }, []);

  return (
    <TouchpointStageLayout
      title="Port of Entry"
      intro="Nigeria's ports and border crossings are critical chokepoints in the pharmaceutical supply chain. A single verified port receipt event anchors the entire authorised import chain — and products that skip this checkpoint surface as chain anomalies."
      highlights={[
        { line1: "One tap verifies the entire shipment", line2: "Apapa, Tin Can, and inland border checkpoints" },
      ]}
      prev={{ to: "/touchpoints/manufacture", label: "Manufacture" }}
      sections={[
        {
          heading: "Parent Tag Tap",
          body: "Customs or port operators tap the shipment or pallet parent tag with a standard NFC-enabled device. A single tap resolves all linked child items via the aggregation graph — no need to scan every unit individually.",
        },
        {
          heading: "Customs Status Propagation",
          body: "The backend verifies the parent object, records the port receipt event with timestamp and operator identity, and propagates a derived arrival status to all linked child items simultaneously.",
        },
        {
          heading: "Exception Handling",
          body: "Seal breaks, quantity mismatches, hold orders, or customs flags are written as separate exception events in the trace ledger — creating a transparent audit record for NAFDAC and border enforcement teams.",
        },
        {
          heading: "Import Channel Assurance",
          body: "Every shipment arriving through an authorised importer is stamped with a verified port-of-entry event. Products that bypass this checkpoint are immediately flagged as having an incomplete chain of custody.",
        },
      ]}
      capabilities={[
        { title: "Shipment Receipt", subtitle: "Parent-level NFC tap at port" },
        { title: "Exception Recording", subtitle: "Seal breaks & holds logged immediately" },
      ]}
      next={{
        to: "/touchpoints/wholesale-transfer",
        title: "Wholesale Transfer",
        subtitle: "De-aggregate and re-assign inventory to distributors",
      }}
    />
  );
}
