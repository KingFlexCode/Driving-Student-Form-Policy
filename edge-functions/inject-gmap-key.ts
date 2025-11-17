export default async (request: Request, context: any) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const key = Deno.env.get("GOOGLE_MAPS_BROWSER_KEY") || "";

  // Replace a placeholder in your HTML like __GMAPS_KEY__
  const out = html.replace(/__GMAPS_KEY__/g, key);

  return new Response(out, {
    status: response.status,
    headers: response.headers,
  });
};
