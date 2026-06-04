import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { syncCustomer } from '@/lib/crmDb';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert into users
    const insertRes = await query(
      `INSERT INTO users (username, email, password, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING id, username, email`,
      [username, email.toLowerCase(), hashedPassword]
    );

    const newUser = insertRes.rows[0];

    // Sync with CRM customers
    await syncCustomer({
      full_name: username,
      email: email,
    });

    // Create auth token
    const token = signToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: 'customer'
    });

    const response = NextResponse.json({
      success: true,
      user: { id: newUser.id, username: newUser.username, email: newUser.email }
    });

    // Set auth cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

    return response;
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
