import type { Metadata } from 'next';
import { ResetPasswordScreen } from '@/components/auth/ResetPasswordScreen';

export const metadata: Metadata = { title: 'New password · RepUp' };

export default function ResetPasswordPage() {
  return <ResetPasswordScreen />;
}
