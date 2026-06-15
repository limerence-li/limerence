export const config = { path: "/api/login" };

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

  return Response.json({ ok: true });
};
