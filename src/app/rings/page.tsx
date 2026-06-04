import { pool } from '@/lib/db';
import RingsClient from './RingsClient';

export const revalidate = 0;

export default async function RingsPage() {
  const ringCategories = [
    "Engagement Rings",
    "Bridal Rings",
    "Wedding Rings",
    "Diamond Rings",
    "Luxury Rings"
  ];
  const res = await pool.query(
    "SELECT * FROM jewelry WHERE category = ANY($1) ORDER BY id DESC",
    [ringCategories]
  );
  const initialJewelry = res.rows;

  return (
    <div className="page-content">
      <RingsClient initialJewelry={initialJewelry} />
    </div>
  );
}
