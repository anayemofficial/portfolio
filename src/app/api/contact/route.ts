import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields (name, email, subject, message) are required.' },
        { status: 400 }
      );
    }

    const web3formsAccessKey = process.env.WEB3FORMS_ACCESS_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (web3formsAccessKey && web3formsAccessKey.trim() !== '') {
      const formData = new FormData();
      formData.append('access_key', web3formsAccessKey.trim());
      formData.append('name', name);
      formData.append('email', email);
      formData.append('subject', `[Portfolio Inquiry] ${subject}`);
      formData.append('message', message);
      formData.append('from_name', name);

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const resText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(resText);
      } catch (parseErr) {
        console.error('Web3Forms returned non-JSON text:', resText);
        throw new Error('Web3Forms API returned invalid response format.');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Web3Forms submission was not successful.');
      }
    } else if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Portfolio Contact <onboarding@resend.dev>',
          to: 'anayem.official@gmail.com',
          reply_to: email,
          subject: `[Portfolio Inquiry] ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to send via Resend');
      }
    } else {
      console.log('--- NEW CONTACT FORM SUBMISSION ---');
      console.log(`From: ${name} (${email})`);
      console.log(`Subject: ${subject}`);
      console.log(`Message:\n${message}`);
      console.log('-----------------------------------');
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been received! Thank you for reaching out.',
    });
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong while sending your message.' },
      { status: 500 }
    );
  }
}
