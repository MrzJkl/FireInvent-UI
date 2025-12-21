'use client';

import * as React from 'react';
import {
  IconBrandProducthunt,
  IconBuildingStore,
  IconDashboard,
  IconFlame,
  IconPackage,
  IconUser,
  IconUsers,
  IconUserCircle,
  IconWashMachine,
  IconPlug,
  IconBuilding,
  IconChevronDown,
} from '@tabler/icons-react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { useAuthorization } from '@/auth/permissions';
import { useTranslation } from 'react-i18next';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: IconDashboard,
    },
    {
      title: 'productPlural',
      url: '/app/products',
      icon: IconPackage,
    },
    {
      title: 'personPlural',
      url: '/app/persons',
      icon: IconUser,
    },
  ],
  masterData: [
    {
      title: 'productTypePlural',
      url: '/app/productTypes',
      icon: IconBrandProducthunt,
    },
    {
      title: 'manufacturerPlural',
      url: '/app/manufacturers',
      icon: IconBuilding,
    },
    {
      title: 'maintenanceTypePlural',
      url: '/app/maintenanceTypes',
      icon: IconWashMachine,
    },
    {
      title: 'departmentPlural',
      url: '/app/departments',
      icon: IconUsers,
    },
    {
      title: 'storageLocationPlural',
      url: '/app/storageLocations',
      icon: IconBuildingStore,
    },
  ],
  navSecondary: [
    {
      title: 'users.label',
      url: '/app/users',
      icon: IconUserCircle,
    },
    {
      title: 'apiIntegrations.label',
      url: '/app/api-integrations',
      icon: IconPlug,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { canAccessApiIntegrations, canAccessUsers } = useAuthorization();
  const { t } = useTranslation();
  const [masterOpen, setMasterOpen] = React.useState(true);

  const navSecondary = React.useMemo(
    () =>
      data.navSecondary.filter((item) => {
        if (item.url === '/app/api-integrations')
          return canAccessApiIntegrations;
        if (item.url === '/app/users') return canAccessUsers;
        return true;
      }),
    [canAccessApiIntegrations, canAccessUsers],
  );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/app">
                <IconFlame className="size-5!" />
                <span className="text-base font-semibold">FireInvent</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              variant="outline"
              className="justify-between"
              onClick={() => setMasterOpen((o) => !o)}
            >
              <span>{t('masterData', { defaultValue: 'Stammdaten' })}</span>
              <IconChevronDown
                className={cn(
                  'transition-transform',
                  masterOpen ? 'rotate-0' : '-rotate-90',
                )}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
          {masterOpen &&
            data.masterData.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{t(item.title)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
