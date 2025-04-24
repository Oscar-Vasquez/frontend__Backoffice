type PageRoutesType = {
  title: string;
  items: PageRoutesItemType;
};

type PageRoutesItemType = {
  title: string;
  href: string;
  icon?: string;
  permission?: string;
  isComing?: boolean;
  isNew?: boolean;
  newTab?: boolean;
  items?: PageRoutesItemType;
}[];

export const page_routes: PageRoutesType[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Home",
        href: "/dashboard/home",
        icon: "PieChart",
        permission: "home"
      },
    ]
  },
  {
    title: "Hora de Trabajo",
    items: [
      {
        title: "Buscar y facturar", 
        href: "/dashboard/tracking",
        icon: "Search",
        permission: "tracking"
      },
      {
        title: "Cobrar paquete", 
        href: "/dashboard/billing",
        icon: "DollarSign",
        permission: "billing"
      },
    ]
  },
  {
    title: "Ingresos y Pagos",
    items: [
      {
        title: "Facturas", 
        href: "/dashboard/invoices", 
        icon: "Receipt",
        permission: "invoices"
      },
      {
        title: "Pagos",
        href: "/dashboard/debit",
        icon: "CreditCard",
        permission: "debit"
      }
    ]
  },
  {
    title: "Emails",
    items: [
      { 
        title: "Emails", 
        href: "/dashboard/emails", 
        icon: "Mail",
        permission: "emails"
      }
    ]
  },
  {
    title: "Usuarios",
    items: [
      { 
        title: "Clientes", 
        href: "/dashboard/users/clients", 
        icon: "Users",
        permission: "clients"
      },
      { 
        title: "Operadores", 
        href: "/dashboard/users/operator", 
        icon: "UserCog",
        permission: "operators"
      },
      { 
        title: "Tipos de Operadores", 
        href: "/dashboard/operator-types", 
        icon: "Shield",
        permission: "operator_types"
      }
    ]
  },
  {
    title: "Paqueteria",
    items: [
      { 
        title: "Planes", 
        href: "/dashboard/plans", 
        icon: "Package",
        permission: "plans"
      },
      { 
        title: "Sucursales", 
        href: "/dashboard/branches", 
        icon: "Building",
        permission: "branches"
      }
    ]
  },
  {
    title: "Apps",
    items: [
      { 
        title: "Chats", 
        href: "/dashboard/apps/chat", 
        icon: "MessageCircle",
        permission: "emails"
      },
    ]
  },
  {
    title: "Cierre de caja",
    items: [
      {
        title: "Cierre de caja",
        href: "/dashboard/cashClosures",
        icon: "FileText",
        permission: "cashClosures"
      }
    ]
  }
  
];
