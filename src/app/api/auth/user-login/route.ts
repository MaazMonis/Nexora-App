import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const res = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = res.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      const token = signToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'customer'
      });

      const response = NextResponse.json({
        success: true,
        user: { id: user.id, username: user.username, email: user.email }
      });

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
