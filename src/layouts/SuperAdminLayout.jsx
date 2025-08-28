import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import SuperAdminSidebar from '@/components/superadmin/SuperAdminSidebar';
import Header from '@/components/Header';
import NetworkStatusIndicator from '@/components/NetworkStatusIndicator';
import DashboardFooter from '@/components/DashboardFooter';
import { useProfile } from '@/contexts/ProfileContext';

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { networkError } = useProfile();

  return (
    <div className={cn(
      "min-h-screen bg-background lg:grid transition-[grid-template-columns] duration-300 ease-in-out",
      isSidebarCollapsed ? "lg:grid-cols-[80px_1fr]" : "lg:grid-cols-[288px_1fr]",
    )}>
      <SuperAdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isSidebarCollapsed}
      />
      <div className="flex flex-col min-w-0">
        <Header
          setSidebarOpen={setSidebarOpen}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
        {networkError && <NetworkStatusIndicator />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};

export default SuperAdminLayout;