// Placeholder — connects to Supabase when credentials are configured
// See backend/src/routes/profile.ts for full implementation
export async function GET() {
  return Response.json({ profile: null });
}
export async function POST(request) {
  const body = await request.json();
  return Response.json({ profile: body });
}
export async function PUT(request) {
  const body = await request.json();
  return Response.json({ profile: body });
}
export async function DELETE() {
  return Response.json({ success: true });
}
