import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import AdminDashboard from '@/app/admin/AdminDashboard';
import AdminLogin from '@/app/admin/AdminLogin';

export const revalidate = 0;

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  const isAuthenticated = token ? verifyToken(token) !== null : false;

  return (
    <>
      {isAuthenticated ? <AdminDashboard /> : <AdminLogin />}
    </>
  );
}
