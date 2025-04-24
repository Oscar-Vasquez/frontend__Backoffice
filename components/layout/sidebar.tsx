"use client";

import Icon from "@/components/icon";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import { page_routes } from "@/lib/routes-config";
import { ChevronRight, ChevronsUpDown, Sparkles } from "lucide-react";
import Logo from "./logo";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NavUser } from './nav-user';
import { AuthService } from "@/app/services/auth.service";
import { OperatorTypesService } from "@/app/services/operator-types.service";
import { PERMISSIONS } from "@/app/config";
import { Skeleton } from "@/components/ui/skeleton";

export default function Sidebar() {
  const pathname = usePathname();
  const { toggleSidebar, isMobile } = useSidebar();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isMobile) toggleSidebar();
  }, [pathname]);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setIsLoading(true);
        const operator = AuthService.getOperatorData();
        console.log('👤 Datos del operador para sidebar:', operator);
        
        // Check if user is admin
        const roleToCheck = operator?.role?.toLowerCase() || '';
        if (roleToCheck === 'admin' || 
            roleToCheck === 'administrator' || 
            roleToCheck === 'administrador' ||
            roleToCheck.includes('admin')) {
          console.log('✅ Usuario es administrador, mostrando todas las opciones en sidebar');
          setIsAdmin(true);
          setPermissions({
            [PERMISSIONS.HOME]: true,
            [PERMISSIONS.TRACKING]: true,
            [PERMISSIONS.BILLING]: true,
            [PERMISSIONS.INVOICES]: true,
            [PERMISSIONS.CLIENTS]: true,
            [PERMISSIONS.OPERATORS]: true,
            [PERMISSIONS.OPERATOR_TYPES]: true,
            [PERMISSIONS.PLANS]: true,
            [PERMISSIONS.BRANCHES]: true,
            [PERMISSIONS.EMAILS]: true,
          });
          setIsLoading(false);
          return;
        }
        
        // Get permissions for non-admin users
        console.log('🔍 Obteniendo permisos para sidebar');
        const userPermissions = await OperatorTypesService.getOperatorPermissions();
        console.log('📋 Permisos obtenidos para sidebar:', userPermissions);
        setPermissions(userPermissions);
      } catch (error) {
        console.error('❌ Error al cargar permisos para sidebar:', error);
        // En caso de error, mostrar solo el Dashboard
        setPermissions({ [PERMISSIONS.HOME]: true });
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, []);

  // Función para verificar si un elemento del menú debe mostrarse
  const shouldShowMenuItem = (item: any) => {
    // Si es admin, mostrar todo
    if (isAdmin) return true;
    
    // Si no tiene permiso definido, mostrar
    if (!item.permission) return true;
    
    // Verificar si el usuario tiene el permiso requerido
    return permissions[item.permission] === true;
  };

  // Filtrar las rutas según los permisos
  const filteredRoutes = page_routes.map(routeGroup => {
    // Filtrar los elementos de cada grupo
    const filteredItems = routeGroup.items.filter(item => {
      // Si tiene subelementos, verificar si al menos uno debe mostrarse
      if (item.items?.length) {
        const hasVisibleSubItems = item.items.some(subItem => shouldShowMenuItem(subItem));
        return hasVisibleSubItems;
      }
      
      // Si no tiene subelementos, verificar si debe mostrarse
      return shouldShowMenuItem(item);
    });
    
    // Devolver el grupo con los elementos filtrados
    return {
      ...routeGroup,
      items: filteredItems
    };
  }).filter(routeGroup => routeGroup.items.length > 0); // Eliminar grupos vacíos

  if (isLoading) {
    return (
      <SidebarContainer collapsible="icon">
        <SidebarHeader className="h-16 items-center justify-center">
          <Logo className="me-2" />
        </SidebarHeader>
        <SidebarContent className="overflow-hidden">
          <div className="flex flex-col gap-4 p-4">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </SidebarContent>
      </SidebarContainer>
    );
  }

  return (
    <SidebarContainer collapsible="icon">
      <SidebarHeader className="h-16 items-center justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
                <SidebarMenuButton>
                  <Logo className="me-2 group-data-[collapsible=icon]:me-0" />
                  <div className="truncate font-semibold group-data-[collapsible=icon]:hidden">
                   
                  </div>
                </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <ScrollArea>
          {filteredRoutes.map((route, key) => (
            <SidebarGroup key={key}>
              <SidebarGroupLabel>{route.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {route.items.map((item, key) => (
                    <SidebarMenuItem key={key}>
                      {item.items?.length ? (
                        <Collapsible className="group/collapsible">
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.title}>
                              {item.icon && <Icon name={item.icon} className="size-4" />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items
                                .filter(subItem => shouldShowMenuItem(subItem))
                                .map((subItem, key) => (
                                <SidebarMenuSubItem key={key}>
                                  <SidebarMenuSubButton
                                    isActive={pathname === subItem.href}
                                    asChild>
                                    <Link
                                      href={subItem.href}
                                      target={subItem.newTab ? "_blank" : ""}>
                                      {subItem.icon && (
                                        <Icon name={subItem.icon} className="size-4" />
                                      )}
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          isActive={pathname === item.href}>
                          <Link href={item.href} target={item.newTab ? "_blank" : ""}>
                            {item.icon && <Icon name={item.icon} className="size-4" />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                      {item.isComing ? (
                        <SidebarMenuBadge className="opacity-50">Coming</SidebarMenuBadge>
                      ) : null}
                      {item.isNew ? (
                        <SidebarMenuBadge className="text-green-500 dark:text-green-200">
                          New
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>
	  <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </SidebarContainer>
  );
}
