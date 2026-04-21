import React, { useEffect } from "react";
import TouchpointStageLayout from "@/components/touchpoints/TouchpointStageLayout";

export default function Manufacture() {
  useEffect(() => {
    document.title = "touchpoints | TraceGuard";
  }, []);

  return (
    <TouchpointStageLayout
      title="Manufacture"
      intro="The traceability chain begins at the factory floor. Every sellable unit is commissioned with a secure digital identity before it leaves the production line — making counterfeiting structurally difficult."
      highlights={[
        { line1: "Every unit gets a secure digital identity", line2: "before it leaves the production line" },
      ]}
      sections={[
        {
          heading: "Tag Personalisation",
          body: "Each NTAG 424 DNA tag is personalised at the factory with a unique cryptographic identity, item serial, and secure NDEF URL template bound to the product's digital twin in the backend registry.",
        },
        {
          heading: "Batch & Serial Records",
          body: "Production records are created capturing product name, batch number, manufacture date, factory line, shift, and shelf life. These form the master data anchor for all downstream traceability events.",
        },
        {
          heading: "Aggregation Binding",
          body: "Commissioned units are bound to parent case, pallet, and shipment objects. The aggregation graph is locked once packing is complete — enabling single-tap bulk updates at logistics touchpoints.",
        },
        {
          heading: "Key Management",
          body: "Cryptographic keys are provisioned via a KMS/HSM-backed service with per-tenant separation and controlled rotation. No keys ever reside in application code or portable media.",
        },
      ]}
      capabilities={[
        { title: "NFC Tag Commissioning", subtitle: "Unique identity per unit" },
        { title: "Batch Record Creation", subtitle: "Full audit-ready data at source" },
      ]}
      next={{
        to: "/touchpoints/port-of-entry",
        title: "Port of Entry",
        subtitle: "Parent-level tap verifies shipments at customs",
      }}
      nextLinkLabel="Next Stage"
    />
  );
}
