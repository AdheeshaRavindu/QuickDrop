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

function isHtmlResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("text/html");
}

const ROOM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_SIGNAL_PAYLOAD_BYTES = 32 * 1024;

function isValidRoomId(roomId) {
  return ROOM_ID_PATTERN.test(roomId);
}

function securityCsp() {
  return [
    "default-src 'self'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline'",
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    "connect-src 'self' ws: wss:",
    "worker-src 'self' blob:",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function applySecurityHeaders(response, { isRoomPage = false } = {}) {
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set(
    "permissions-policy",
    "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
  );
  headers.set("cross-origin-opener-policy", "same-origin");
  headers.set("cross-origin-resource-policy", "same-origin");
  headers.set("x-dns-prefetch-control", "off");

  if (headers.get("content-security-policy") === null) {
    headers.set("content-security-policy", securityCsp());
  }

  if (isRoomPage) {
    headers.set("x-robots-tag", "noindex,follow");
  }

  headers.set("strict-transport-security", "max-age=31536000; includeSubDomains; preload");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
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
      return applySecurityHeaders(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        })
      );
    }

    if (url.pathname === "/health") {
      return applySecurityHeaders(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        })
      );
    }

    if (url.pathname.startsWith("/ws/")) {
      const roomId = decodeURIComponent(url.pathname.slice(4));
      if (!roomId || !isValidRoomId(roomId)) {
        return new Response("Invalid room id", { status: 400 });
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
    const isRoomPage = request.method === "GET" && url.pathname.startsWith("/room/");

    if (assetResponse.status !== 404) {
      if (isHtmlResponse(assetResponse)) {
        return applySecurityHeaders(assetResponse, { isRoomPage });
      }
      return assetResponse;
    }

    if (request.method === "GET") {
      // Fetch root asset and return it directly to avoid redirecting /room/{id} -> /.
      const indexResponse = await env.ASSETS.fetch(new Request(new URL("/", url), request));
      const headers = new Headers(indexResponse.headers);
      headers.delete("location");
      const fallbackResponse = new Response(indexResponse.body, {
        status: 200,
        headers,
      });
      return applySecurityHeaders(fallbackResponse, { isRoomPage: url.pathname.startsWith("/room/") });
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

    if (rawText.length > MAX_SIGNAL_PAYLOAD_BYTES) {
      ws.send(JSON.stringify({ type: "error", message: "Payload too large" }));
      ws.close(1009, "Payload too large");
      return;
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

    const signalType = msg?.data?.type;
    const allowedSignalTypes = new Set(["offer", "answer", "ice-candidate"]);
    if (!allowedSignalTypes.has(signalType)) {
      ws.send(JSON.stringify({ type: "error", message: "Invalid signal type" }));
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
