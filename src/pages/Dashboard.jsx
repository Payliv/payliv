import React from 'react';
import PartnerDashboard from '@/pages/partner/PartnerDashboard';
import { useProfile } from '@/contexts/ProfileContext';
import PageLoader from '@/components/PageLoader';
import SellerDashboard from '@/components/dashboard/SellerDashboard';

export default function Dashboard() {
  const { profile, loadingProfile } = useProfile();

  if (loadingProfile) {
    return <PageLoader />;
  }

  if (profile?.role === 'partner') {
    return <PartnerDashboard />;
  }

  return <SellerDashboard />;
}