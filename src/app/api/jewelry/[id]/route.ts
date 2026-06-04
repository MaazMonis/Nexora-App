import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { title, description, price, image, status, category, features, subdescription, price_subdescription } = await request.json();
    const res = await pool.query(
      `UPDATE jewelry SET title = $1, description = $2, price = $3, image = $4, status = $5, category = $6, features = $7, subdescription = $8, price_subdescription = $9
       WHERE id = $10 RETURNING *`,
      [title, description, price, image, status, category || 'Jewelry', features, subdescription, price_subdescription, id]
    );
    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ item: res.rows[0] });
  } catch (err) {
    console.error('Error updating jewelry:', err);
    return NextResponse.json({ error: 'Failed to update jewelry' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await pool.query('DELETE FROM jewelry WHERE id = $1 RETURNING *', [id]);
    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Item deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete jewelry' }, { status: 500 });
  }
}
