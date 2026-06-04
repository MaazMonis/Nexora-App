import { pool } from '@/lib/db';
import DiamondClient from './DiamondClient';

export const revalidate = 0;

export default async function DiamondPage() {
  const diamondCategories = [
    "Solitaire",
    "Halo",
    "Vintage",
    "Three-Stone",
    "Modern Luxury"
  ];
  const res = await pool.query(
    "SELECT * FROM products WHERE category = ANY($1) ORDER BY id DESC",
    [diamondCategories]
  );
  const initialDiamonds = res.rows;

  return (
    <div className="page-content">
      <DiamondClient initialDiamonds={initialDiamonds} />
    </div>
  );
}
