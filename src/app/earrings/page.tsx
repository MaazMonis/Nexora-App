import { pool } from '@/lib/db';
import EarringClient from './EarringClient';

export const revalidate = 0;

export default async function EarringsPage() {
  const earringCategories = [
    "Earrings",
    "Studs",
    "Hoops",
    "Drops",
    "Chandeliers"
  ];
  const res = await pool.query(
    "SELECT * FROM themes WHERE category = ANY($1) ORDER BY id DESC",
    [earringCategories]
  );
  const initialThemes = res.rows;

  return (
    <div className="page-content">
      <EarringClient initialThemes={initialThemes} />
    </div>
  );
}
