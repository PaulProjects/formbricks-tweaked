import { NextResponse } from "next/server";

const notAvailable = () => NextResponse.json({ error: "Contacts API is not available" }, { status: 404 });

export const GET = notAvailable;
export const POST = notAvailable;
export const PUT = notAvailable;
export const DELETE = notAvailable;
export const OPTIONS = notAvailable;
