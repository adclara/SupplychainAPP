/**
 * Home Page
 * @description Landing page that redirects to login or dashboard
 */

import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export default function HomePage() {
  // In production, check auth state and redirect accordingly
  // For now, redirect to login
  redirect(ROUTES.LOGIN);
}
