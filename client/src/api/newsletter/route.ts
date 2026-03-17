import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Email düzgün deyil" }, { status: 400 });
    }

    // Burda email servisi çağır (Resend, SendGrid, Mailgun və s.)
    // Məsələn: await resend.emails.send({...})

    console.log("Yeni abunə:", email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server xətası" }, { status: 500 });
  }
}