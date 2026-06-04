import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const res = await query('SELECT id, username, email, profile_image FROM users WHERE id = $1', [decoded.id]);
    const user = res.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { username, email, currentPassword, newPassword, profileImage } = await request.json();

    // Fetch user to verify current password if password change is requested
    const userRes = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = userRes.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update fields
    let updatedUsername = username || user.username;
    let updatedEmail = email || user.email;
    let updatedProfileImage = profileImage !== undefined ? profileImage : user.profile_image;
    let hashedPassword = user.password;

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password required to set new password' }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
      }
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // Update user in DB
    await query(
      'UPDATE users SET username = $1, email = $2, password = $3, profile_image = $4 WHERE id = $5',
      [updatedUsername, updatedEmail, hashedPassword, updatedProfileImage, decoded.id]
    );

    return NextResponse.json({ 
      success: true, 
      user: { username: updatedUsername, email: updatedEmail, profileImage: updatedProfileImage } 
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
