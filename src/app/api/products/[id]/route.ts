import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id = '' } = await params;
  try {
    const { title, description, price, image, status, category, features, subdescription, price_subdescription } = await request.json();
    const res = await pool.query(
      `UPDATE products SET title = $1, description = $2, price = $3, image = $4, status = $5, category = $6, features = $7, subdescription = $8, price_subdescription = $9
       WHERE id = $10 RETURNING *`,
      [title, description, price, image, status, category, features, subdescription, price_subdescription, id]
    );
    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product: res.rows[0] });
  } catch (err) {
    console.error('Error updating product:', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id = '' } = await params;
  try {
    const res = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
