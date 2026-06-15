import { getStore } from "@netlify/blobs";

export const config = { path: "/api/copy" };

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }

  const code = String((body && body.code) || "").trim().slice(0, 64);
  if (!code) return Response.json({ error: "缺少改枪码" }, { status: 400 });

  const store = getStore({ name: "delta", consistency: "strong" });
  let counts = await store.get("counts", { type: "json" });
  if (!counts || typeof counts !== "object") counts = {};

  counts[code] = (counts[code] || 0) + 1;
  await store.setJSON("counts", counts);

  return Response.json({ code, count: counts[code] });
};
