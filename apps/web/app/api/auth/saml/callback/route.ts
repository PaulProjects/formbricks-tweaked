import { NextResponse } from "next/server";

export const POST = () => NextResponse.json({ error: "SAML SSO is not available" }, { status: 404 });
