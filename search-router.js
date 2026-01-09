// search-router.js
export function routeQuery(q) {
  const s = (q || "").toLowerCase().trim();
  const has = (...w) => w.some(x => s.includes(x));

  if (has("plumb", "leak", "clog", "toilet", "drain")) return { url: "plumbing.html" };
  if (has("electric", "outlet", "breaker", "wiring")) return { url: "electricians.html" };
  if (has("carp", "wood", "cabinet", "deck")) return { url: "carpentry.html" };
  if (has("truck", "moving", "delivery")) return { url: "trucking.html" };
  if (has("food", "catering", "chef", "meal")) return { url: "food2.html" };
  if (has("finance", "credit", "bank", "loan")) return { url: "financial-help.html" };

  return { url: "search.html?q=" + encodeURIComponent(q) };
}
