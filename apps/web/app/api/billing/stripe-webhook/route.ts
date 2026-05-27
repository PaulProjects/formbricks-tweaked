import { NextResponse } from "next/server";

export const POST = () => NextResponse.json({ error: "Billing is not available" }, { status: 404 });
