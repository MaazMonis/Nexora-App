import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await pool.query('SELECT * FROM themes WHERE id = $1', [id]);
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ theme: res.rows[0] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { title, description, price, status, category, image, features, subdescription, price_subdescription } = await request.json();
    const res = await pool.query(
      `UPDATE themes SET title=$1, description=$2, price=$3, status=$4, category=$5, image=$6, features=$7, subdescription=$8, price_subdescription=$9 WHERE id=$10 RETURNING *`,
      [title, description, price, status, category, image, features, subdescription, price_subdescription, id]
    );
    return NextResponse.json({ theme: res.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await pool.query('DELETE FROM themes WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
