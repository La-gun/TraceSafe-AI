import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { question, history = [] } = await req.json();

    // Fetch only what we need (limits aligned with slice usage)
    const [reports, alerts, batches, scanEvents] = await Promise.all([
      base44.asServiceRole.entities.ConsumerReport.list('-created_date', 50),
      base44.asServiceRole.entities.DiversionAlert.list('-created_date', 50),
      base44.asServiceRole.entities.Batch.list('-created_date', 50),
      base44.asServiceRole.entities.ScanEvent.list('-created_date', 80),
    ]);

    const today = new Date().toISOString().split('T')[0];

    const conversationHistory = history
      .map(m => `${m.role === 'user' ? 'Inspector' : 'AI'}: ${m.content}`)
      .join('\n');

    const prompt = `You are an AI assistant for NAFDAC (Nigeria's food and drug regulator) field inspectors.
You have access to live supply chain intelligence data. Answer questions concisely and accurately using markdown formatting.
Today's date is ${today}.

CONSUMER REPORTS (incidents reported by consumers):
${JSON.stringify(reports)}

DIVERSION ALERTS:
${JSON.stringify(alerts)}

BATCHES:
${JSON.stringify(batches)}

SCAN EVENTS (recent):
${JSON.stringify(scanEvents)}

Guidelines:
- Format lists with bullet points, use **bold** for important items
- For recalls/counterfeits, be direct and urgent in tone
- Use Nigerian state names and supply chain terminology familiar to NAFDAC inspectors
- If no data matches a query, say so clearly rather than guessing
- Keep answers concise but thorough — inspectors are in the field

${conversationHistory ? `Conversation so far:\n${conversationHistory}\n\n` : ''}Inspector question: ${question}

Provide a clear, structured answer:`;

    const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });

    return Response.json({ answer, success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});