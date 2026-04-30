import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { AlertTriangle, LogOut, PanelLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

export type DashboardLayoutMenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  helperText?: string;
};

type DashboardLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  menuItems: DashboardLayoutMenuItem[];
  activeItem: string;
  onItemSelect: (id: string) => void;
  adminOnly?: boolean;
};

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 220;
const MAX_WIDTH = 420;

export default function DashboardLayout({
  children,
  title,
  subtitle,
  menuItems,
  activeItem,
  onItemSelect,
  adminOnly = false,
}: DashboardLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="spiritual-background min-h-screen flex items-center justify-center p-6">
        <div className="quiz-card w-full max-w-md text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Acesso protegido
          </p>
          <h1 className="mt-4 text-3xl text-foreground">Entre para continuar</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Esta área administrativa utiliza autenticação do projeto e só pode ser acessada por usuários autorizados.
          </p>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="mt-6 w-full"
          >
            Fazer login
          </Button>
        </div>
      </div>
    );
  }

  if (adminOnly && user.role !== "admin") {
    return (
      <div className="spiritual-background min-h-screen flex items-center justify-center p-6">
        <div className="quiz-card w-full max-w-lg text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Permissão necessária
          </p>
          <h1 className="mt-4 text-3xl text-foreground">Acesso restrito</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Sua conta está autenticada, mas ainda não possui perfil administrativo para visualizar esta área.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => setLocation("/")}>Voltar ao site</Button>
            <Button variant="outline" onClick={() => void window.location.reload()}>
              Atualizar permissão
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent
        title={title}
        subtitle={subtitle}
        menuItems={menuItems}
        activeItem={activeItem}
        onItemSelect={onItemSelect}
        setSidebarWidth={setSidebarWidth}
      >
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  menuItems: DashboardLayoutMenuItem[];
  activeItem: string;
  onItemSelect: (id: string) => void;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  title,
  subtitle,
  menuItems,
  activeItem,
  onItemSelect,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const selectedItem = menuItems.find((item) => item.id === activeItem) ?? menuItems[0];

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = event.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <div className="spiritual-background flex min-h-screen w-full">
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-sidebar-border/80 bg-sidebar/95 backdrop-blur" disableTransition={isResizing}>
          <SidebarHeader className="border-b border-sidebar-border/70 px-3 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-white/80 transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Alternar navegação"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              {!isCollapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-foreground">{title}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {subtitle || "Painel administrativo protegido"}
                  </p>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4">
            <div className="mb-4 rounded-2xl border border-border/60 bg-white/70 p-3 shadow-sm group-data-[collapsible=icon]:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Diagnóstico Espiritual
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                Visualize a operação real do funil, os compradores e a evolução dos diagnósticos em um só lugar.
              </p>
            </div>

            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = item.id === activeItem;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onItemSelect(item.id)}
                      tooltip={item.label}
                      className="h-auto min-h-12 rounded-2xl px-3 py-3"
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="min-w-0 text-left group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-sm font-medium">{item.label}</p>
                        {item.helperText ? (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.helperText}</p>
                        ) : null}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border/70 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-white/75 px-2 py-2 text-left transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring group-data-[collapsible=icon]:justify-center">
                  <Avatar className="h-10 w-10 border border-border/60">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {(user?.name?.charAt(0) || user?.email?.charAt(0) || "A").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <p className="truncate text-sm font-semibold text-foreground">{user?.name || "Administrador"}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{user?.email || "Conta autenticada"}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => void logout()} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div
          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/20 ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile ? (
          <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/70 bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-xl border border-border/70 bg-white/80" />
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedItem?.label ?? title}</p>
                <p className="text-xs text-muted-foreground">{selectedItem?.helperText ?? subtitle}</p>
              </div>
            </div>
          </div>
        ) : null}

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </div>
  );
}
