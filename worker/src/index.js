function splitCsv(value) {
  if (!value) return [];
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function resolveIceServers(env) {
  if (env.ICE_SERVERS_JSON) {
    try {
      const parsed = JSON.parse(env.ICE_SERVERS_JSON);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Ignore invalid JSON and fallback to env-based defaults.
    }
  }

  const ice = [];
  const stunUrls = splitCsv(env.STUN_SERVERS || "stun:stun.l.google.com:19302");
  if (stunUrls.length > 0) {
    ice.push({ urls: stunUrls });
  }

  const turnUrls = splitCsv(env.TURN_URLS);
  if (turnUrls.length > 0 && env.TURN_USERNAME && env.TURN_CREDENTIAL) {
    ice.push({
      urls: turnUrls,
      username: env.TURN_USERNAME,
      credential: env.TURN_CREDENTIAL,
    });
  }

  return ice;
}

function wsTemplateFromRequest(request) {
  const url = new URL(request.url);
  const wsProto = url.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProto}//${url.host}/ws/{room}`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/config") {
      const body = {
        publicBaseUrl: env.PUBLIC_BASE_URL || "",
        wsUrl: env.PUBLIC_WS_URL || wsTemplateFromRequest(request),
        iceServers: resolveIceServers(env),
      };
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    if (url.pathname.startsWith("/ws/")) {
      const roomId = decodeURIComponent(url.pathname.slice(4));
      if (!roomId) {
        return new Response("Missing room id", { status: 400 });
      }

      if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }

      const doId = env.ROOM.idFromName(roomId);
      const stub = env.ROOM.get(doId);

      const upstreamUrl = new URL("https://room.internal/ws");
      upstreamUrl.searchParams.set("room", roomId);
      return stub.fetch(new Request(upstreamUrl.toString(), request));
    }

        // SPA fallback: /room/{id} and unknown app routes should resolve to index.html.
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) {
          return assetResponse;
        }

        if (request.method === "GET") {
          // Fetch root asset and return it directly to avoid redirecting /room/{id} -> /.
          const indexResponse = await env.ASSETS.fetch(new Request(new URL("/", url), request));
          const headers = new Headers(indexResponse.headers);
          headers.delete("location");
          return new Response(indexResponse.body, {
            status: 200,
            headers,
          });
        }

        return assetResponse;
  },
};

export class RoomSignalingDO {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Expected websocket", { status: 426 });
    }

    const existing = this.state.getWebSockets();
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    if (existing.length >= 2) {
      server.accept();
      server.send(JSON.stringify({ type: "full" }));
      server.close(1008, "Room full");
      return new Response(null, { status: 101, webSocket: client });
    }

    this.state.acceptWebSocket(server);
    server.send(JSON.stringify({ type: "joined" }));

    const sockets = this.state.getWebSockets();
    if (sockets.length === 2) {
      for (const ws of sockets) {
        ws.send(JSON.stringify({ type: "ready" }));
      }
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, message) {
    let rawText = "";
    if (typeof message === "string") {
      rawText = message;
    } else {
      rawText = new TextDecoder().decode(message);
    }

    let msg;
    try {
      msg = JSON.parse(rawText);
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON payload" }));
      return;
    }

    if (msg.type === "join") {
      return;
    }

    if (msg.type !== "signal") {
      ws.send(JSON.stringify({ type: "error", message: `Unsupported type: ${msg.type || "unknown"}` }));
      return;
    }

    const peers = this.state.getWebSockets().filter((socket) => socket !== ws);
    if (peers.length === 0) {
      ws.send(JSON.stringify({ type: "error", message: "No peer connected yet" }));
      return;
    }

    peers[0].send(JSON.stringify({ type: "signal", data: msg.data }));
  }

  async webSocketClose(ws) {
    const remaining = this.state.getWebSockets();
    const peers = remaining.filter((socket) => socket !== ws);
    if (peers.length === 1) {
      peers[0].send(JSON.stringify({ type: "peer-left" }));
    }

    if (peers.length === 0) {
      await this.state.storage.deleteAll();
    }
  }

  webSocketError(ws) {
    try {
      ws.close(1011, "WebSocket error");
    } catch {
      // Ignore close failures on already-closed sockets.
    }
  }
}
