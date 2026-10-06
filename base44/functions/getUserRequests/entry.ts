import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { session_id } = await req.json();

    if (!session_id) {
      return Response.json({ error: "Missing session_id" }, { status: 400 });
    }

    // Fetch all requests for this session
    const requests = await base44.asServiceRole.entities.AccessRequest.filter(
      { session_id },
      "-requested_at",
      100
    );

    if (!requests || requests.length === 0) {
      return Response.json({ success: true, requests: [] });
    }

    // Fetch messages for each request in parallel
    const requestIds = requests.map(r => r.request_id);
    const messageResults = await Promise.all(
      requestIds.map(rid =>
        base44.asServiceRole.entities.AccessRequestMessage.filter(
          { request_id: rid },
          "created_at",
          100
        ).catch(() => [])
      )
    );

    // Group messages by request_id
    const messagesByRequest = {};
    requestIds.forEach((rid, i) => {
      messagesByRequest[rid] = messageResults[i] || [];
    });

    // Attach messages to requests
    const result = requests.map(r => ({
      ...r,
      messages: messagesByRequest[r.request_id] || []
    }));

    return Response.json({ success: true, requests: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});