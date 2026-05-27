import { NextResponse } from "next/server";

export const GET = () => NextResponse.json({ error: "SAML SSO is not available" }, { status: 404 });
