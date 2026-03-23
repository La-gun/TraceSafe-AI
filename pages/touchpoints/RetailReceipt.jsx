import React, { useEffect } from "react";
import TouchpointStageLayout from "@/components/touchpoints/TouchpointStageLayout";

export default function RetailReceipt() {
  useEffect(() => {
    document.title = "touchpoints | TraceSafe AI";
  }, []);

  return (
    <TouchpointStageLayout
      title="Retail Receipt"
      intro="The pharmacy, hospital, or registered retail outlet is the last gatekeeper before a product reaches the end user. A retail receipt event completes the authorised chain and enables NAFDAC to verify that distribution followed the expected route."
      highlights={[
        { line1: "Authorised chain completed at the pharmacy", line2: "Every outlet registered, every batch tracked" },
      ]}
      prev={{ to: "/touchpoints/wholesale-transfer", label: "Wholesale Transfer" }}
      sections={[
        {
          heading: "Receipt Confirmation",
          body: "Retail operators — pharmacies, hospitals, or registered outlets — scan received stock to confirm receipt and trigger a retail receipt event. This completes the authorised chain from manufacturer to point of sale.",
        },
        {
          heading: "Outlet Registration",
          body: "Each retail outlet is registered in the partner master data with location, license status, and operator identity. Scans from unregistered outlets are automatically flagged as suspicious in the NAFDAC console.",
        },
        {
          heading: "Authorised Chain Completion",
          body: "The retail receipt event is the final link in the authorised chain before end-user verification. Products that reach consumers without a retail receipt event are classified as having an incomplete provenance chain.",
        },
        {
          heading: "Anomaly Alerts",
          body: "If a product arrives at a retail outlet that was not part of the expected distribution route — or if stock appears in an unregistered location — the anomaly engine generates an immediate alert for NAFDAC review.",
        },
      ]}
      capabilities={[
        { title: "Stock Verification", subtitle: "NFC tap confirms authorised receipt" },
        { title: "Outlet Registration", subtitle: "Licensed outlets tracked in partner master data" },
      ]}
      next={{
        to: "/touchpoints/end-user-verify",
        title: "End-User Verify",
        subtitle: "Consumer tap confirms authenticity in seconds",
      }}
      nextLinkLabel="Final Stage"
    />
  );
}
