import { getStore } from "@netlify/blobs";

export const config = { path: "/api/save-weapons" };

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) {
    return Response.json(
      { error: "服务器未设置管理员密码，请在 Netlify 后台添加环境变量 ADMIN_PASSWORD" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!body || body.password !== adminPw) {
    return Response.json({ error: "管理员密码错误" }, { status: 401 });
  }

  if (!Array.isArray(body.weapons)) {
    return Response.json({ error: "数据格式错误：weapons 必须是数组" }, { status: 400 });
  }

  const clean = body.weapons.map((w) => {
    const out = {
      name: String(w.name || "").slice(0, 40),
      cat: String(w.cat || "").slice(0, 20),
      img: String(w.img || "🔫").slice(0, 8),
      desc: String(w.desc || "").slice(0, 200),
      updatedAt: String(w.updatedAt || "").slice(0, 10),
      codes: Array.isArray(w.codes)
        ? w.codes
            .map((c) => {
              const code = {
                code: String(c.code || "").trim().slice(0, 64),
                desc: String(c.desc || "").slice(0, 60),
              };
              if (c.tag) code.tag = String(c.tag).slice(0, 10);
              if (c.value) code.value = String(c.value).slice(0, 16);
              return code;
            })
            .filter((c) => c.code)
        : [],
    };
    if (w.icon) out.icon = String(w.icon).slice(0, 200);
    return out;
  }).filter((w) => w.name);

  const store = getStore({ name: "delta", consistency: "strong" });
  await store.setJSON("weapons", clean);

  return Response.json({ ok: true, count: clean.length });
};
