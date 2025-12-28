import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

import { Outlet } from 'react-router-dom';
import { useTenant } from '@/auth/tenant';

export default function AppLayout() {
  const { selectedTenantId } = useTenant();
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-1 flex-col">
          <div
            key={selectedTenantId || 'no-tenant'}
            className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6"
          >
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
