// Placeholder — connects to Supabase when credentials are configured
export async function GET() {
  return Response.json({ inquiries: [] });
}
export async function POST(request) {
  const body = await request.json();
  return Response.json({ inquiry: { ...body, id: crypto.randomUUID(), status: "pending" } });
}
export async function PATCH(request) {
  const body = await request.json();
  return Response.json({ inquiry: body });
}
