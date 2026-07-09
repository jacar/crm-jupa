'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/store/use-sidebar';
import {
  LayoutDashboard,
  Users,
  Building2,
  Target,
  TrendingUp,
  FileText,
  Receipt,
  Package,
  Calendar,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  Activity,
  Phone,
  BrainCircuit,
  Archive,
  FolderOpen,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Contactos', href: '/contacts' },
  { icon: Building2, label: 'Empresas', href: '/companies' },
  { icon: Target, label: 'Leads', href: '/leads' },
  { icon: TrendingUp, label: 'Propuestas', href: '/opportunities' },
  { icon: FileText, label: 'Presupuestos', href: '/quotes' },
  { icon: Receipt, label: 'Facturas', href: '/invoices' },
  { icon: Package, label: 'Materiales', href: '/materials' },
  { icon: Archive, label: 'Inventario', href: '/inventory' },
  { icon: Activity, label: 'Actividades', href: '/activities' },
  { icon: Calendar, label: 'Calendario', href: '/calendar' },
  { icon: BarChart3, label: 'Reportes', href: '/reports' },
  { icon: FolderOpen, label: 'Archivos Drive', href: '/drive' },
  { icon: BrainCircuit, label: 'Búsqueda IA', href: '/ai-search' },
  { icon: Bell, label: 'Notificaciones', href: '/notifications' },
  { icon: Phone, label: 'WhatsApp', href: '/whatsapp' },
  { icon: Settings, label: 'Configuración', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background transition-all duration-300',
        isOpen ? 'w-64' : 'w-16',
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {isOpen && (
          <Link href="/dashboard" className="text-lg font-bold hover:text-primary transition-colors">
            CRM Jupa
          </Link>
        )}
        <button onClick={toggle} className="rounded-lg p-1.5 hover:bg-accent">
          <ChevronLeft className={cn('h-5 w-5 transition-transform', !isOpen && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
