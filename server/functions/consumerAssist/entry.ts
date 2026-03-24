import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// ── Mock product database ────────────────────────────────────────────────────
const MOCK_PRODUCTS = {
  "NG-TG-00041872": {
    serial: "NG-TG-00041872",
    product_name: "Amoxicillin 500mg",
    batch: "AMX-2026-0341",
    manufacturer: "EmeraPharm Ltd",
    status: "hold",
    expiry: "2027-08-01",
    supply_chain_stage: "wholesale",
    last_scan_location: "Lagos — Apapa Wholesale Hub",
    safety_instructions: [
      "⚠️ This batch is currently under a HOLD order. Do NOT use until clearance is confirmed.",
      "Report this product to NAFDAC immediately on 0800-162-3232.",
      "Keep the product sealed and away from children.",
      "Do not attempt to return it to the seller — await official guidance.",
    ],
  },
  "NG-TG-00091234": {
    serial: "NG-TG-00091234",
    product_name: "Paracetamol 1000mg",
    batch: "PCT-2026-0812",
    manufacturer: "HealthCore Industries",
    status: "authentic",
    expiry: "2028-03-15",
    supply_chain_stage: "retail",
    last_scan_location: "Abuja — Wuse Market Pharmacy",
    safety_instructions: [
      "✅ This product is AUTHENTIC and cleared for use.",
      "Do not exceed the recommended dosage on the package insert.",
      "Store below 30°C, away from direct sunlight and moisture.",
      "Keep out of reach of children. Consult a pharmacist if unsure.",
    ],
  },
  "NG-TG-00055678": {
    serial: "NG-TG-00055678",
    product_name: "Hand Sanitizer 500ml",
    batch: "HS-2026-0045",
    manufacturer: "CleanGuard Nigeria",
    status: "recalled",
    expiry: "2026-12-31",
    supply_chain_stage: "retail",
    last_scan_location: "Kano — Sabon Gari Distribution",
    safety_instructions: [
      "🚨 RECALL ACTIVE — Do NOT use this product.",
      "This batch has been recalled due to a detected formulation issue.",
      "Dispose of safely in a sealed bag and report to NAFDAC: 0800-162-3232.",
      "Visit a NAFDAC office or authorised retailer for a replacement if eligible.",
    ],
  },
};

// ── Simulated LLM-powered label OCR (mock) ─────────────────────────────────
async function extractSerialFromLabel(api, imageUrl) {
  const result = await api.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are an expert at reading product labels on regulated consumer goods.
Examine this product label image and extract the serial number or product ID. 
Serial numbers on our platform follow the format: NG-TG-XXXXXXXX (8 digit number after NG-TG-).
If you cannot find a serial number matching this format, return null.
Return ONLY the serial number string or null — no other text.`,
    file_urls: [imageUrl],
    response_json_schema: {
      type: "object",
      properties: {
        serial_number: { type: "string" },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
        notes: { type: "string" },
      },
    },
  });
  return result;
}

// ── Build WhatsApp-style response message ───────────────────────────────────
function buildWhatsAppMessage(product, querySerial) {
  if (!product) {
    return {
      status: "not_found",
      whatsapp_message: `🔍 *TraceGuard Verification*\n\nSerial: *${querySerial}*\n\n❌ *Product Not Found*\n\nThis serial number is not registered in our system. This may indicate:\n• A counterfeit product\n• Damaged/unreadable tag\n• Product from outside our network\n\n⚠️ *Do not use this product until it can be verified by a pharmacist or NAFDAC officer.*\n\nReport concerns: *0800-162-3232*\n\n_TraceGuard Anti-Counterfeit Platform_`,
      instructions: [
        "This serial number is not in our registry.",
        "Do not use the product until verified by a professional.",
        "Report suspicious products to NAFDAC on 0800-162-3232.",
      ],
    };
  }

  const statusEmoji = {
    authentic: "✅",
    hold: "⚠️",
    recalled: "🚨",
    suspicious: "🔴",
    counterfeit: "🚫",
  }[product.status] || "❓";

  const statusLabel = {
    authentic: "AUTHENTIC — Cleared",
    hold: "ON HOLD — Do Not Use",
    recalled: "RECALLED — Dispose Immediately",
    suspicious: "SUSPICIOUS — Caution",
    counterfeit: "COUNTERFEIT SUSPECTED",
  }[product.status] || "UNKNOWN STATUS";

  const message = `${statusEmoji} *TraceGuard Verification*

📦 *Product:* ${product.product_name}
🔢 *Serial:* ${product.serial}
📋 *Batch:* ${product.batch}
🏭 *Manufacturer:* ${product.manufacturer}
📅 *Expiry:* ${product.expiry}
📍 *Last Seen:* ${product.last_scan_location}
🔗 *Stage:* ${product.supply_chain_stage.replace(/_/g, " ").toUpperCase()}

*Status: ${statusLabel}*

📋 *Safety Instructions:*
${product.safety_instructions.map((s) => `• ${s}`).join("\n")}

_Verified via TraceGuard Anti-Counterfeit Platform_
_Help: 0800-162-3232_`;

  return {
    status: product.status,
    product_name: product.product_name,
    batch: product.batch,
    manufacturer: product.manufacturer,
    expiry: product.expiry,
    supply_chain_stage: product.supply_chain_stage,
    last_scan_location: product.last_scan_location,
    whatsapp_message: message,
    instructions: product.safety_instructions,
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const api = createClientFromRequest(req);
    const body = await req.json();

    const { mode, serial_number, image_url, phone_number } = body;

    let resolvedSerial = serial_number?.trim().toUpperCase();
    let ocrResult = null;

    // Photo mode — extract serial via LLM vision
    if (mode === "photo" && image_url) {
      ocrResult = await extractSerialFromLabel(api, image_url);
      if (ocrResult?.serial_number) {
        resolvedSerial = ocrResult.serial_number.trim().toUpperCase();
      }
    }

    if (!resolvedSerial) {
      return Response.json({
        success: false,
        error: mode === "photo"
          ? "Could not extract a serial number from the label image. Please try a clearer photo or enter the serial manually."
          : "Serial number is required.",
        ocr_result: ocrResult,
      }, { status: 400 });
    }

    // Lookup product (mock DB)
    const product = MOCK_PRODUCTS[resolvedSerial] || null;
    const response = buildWhatsAppMessage(product, resolvedSerial);

    // Simulate a 300ms WhatsApp send delay
    await new Promise((r) => setTimeout(r, 300));

    return Response.json({
      success: true,
      resolved_serial: resolvedSerial,
      ocr_result: ocrResult,
      phone_number: phone_number || null,
      whatsapp_sent: !!phone_number,
      ...response,
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});