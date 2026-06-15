import { getStore } from "@netlify/blobs";
import { weapons as seedWeapons, weaponIcons, categories } from "./_seed.mjs";

export const config = { path: "/api/weapons" };

export default async () => {
  const store = getStore({ name: "delta", consistency: "strong" });

  let weapons = await store.get("weapons", { type: "json" });
  if (!weapons || !Array.isArray(weapons) || weapons.length === 0) {
    weapons = seedWeapons;
  }

  let counts = await store.get("counts", { type: "json" });
  if (!counts || typeof counts !== "object") counts = {};

  const enriched = weapons.map((w) => ({
    ...w,
    icon: w.icon || weaponIcons[w.name] || null,
    copies: (w.codes || []).reduce((sum, c) => sum + (counts[c.code] || 0), 0),
  }));

  return Response.json(
    { weapons: enriched, categories, counts },
    { headers: { "Cache-Control": "no-store" } }
  );
};
