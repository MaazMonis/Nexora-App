import { pool } from '@/lib/db';
import BespokeClient from './BespokeClient';

export const revalidate = 0;

export default async function BespokePage() {
  const bespokeCategories = [
    "Bespoke Rings",
    "Bespoke Necklaces",
    "Bespoke Bracelets",
    "Bespoke Earrings",
    "Custom Sets"
  ];
  const res = await pool.query(
    'SELECT * FROM bespoke_collections WHERE category = ANY($1) ORDER BY id DESC',
    [bespokeCategories]
  );
  const items = res.rows;

  return (
    <div className="page-content">
      <BespokeClient initialItems={items} />
    </div>
  );
}
