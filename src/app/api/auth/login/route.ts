import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const res = await query('SELECT * FROM users WHERE username = $1', [username]);
    const user = res.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      const token = signToken({ 
        id: user.id,
        username: user.username,
        role: 'admin' 
      });
      
      const response = NextResponse.json({ success: true, user: { username: user.username, email: user.email } });
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 1 day
      });
      
      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
