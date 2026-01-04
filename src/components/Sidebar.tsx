
import { Home, Settings, History, LogOut, Menu, X, Droplets, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "next-themes";

interface SidebarProps {
    activeView: 'home' | 'settings' | 'history';
    onNavigate: (view: 'home' | 'settings' | 'history') => void;
    className?: string;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export const Sidebar = ({ activeView, onNavigate, className, isCollapsed, onToggleCollapse }: SidebarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { logout } = useAuth();
    const { theme, setTheme } = useTheme();

    const NavItem = ({ view, icon: Icon, label }: { view: 'home' | 'settings' | 'history'; icon: any; label: string }) => (
        <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 transition-all rounded-lg overflow-hidden",
                        activeView === view
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm font-semibold"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                        isCollapsed ? "px-2 justify-center" : "px-4"
                    )}
                    onClick={() => {
                        onNavigate(view);
                        setIsOpen(false);
                    }}
                >
                    <Icon className={cn("h-5 w-5 shrink-0", isCollapsed ? "mx-auto" : "")} />
                    {!isCollapsed && <span className="font-medium truncate">{label}</span>}
                    {activeView === view && !isCollapsed && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-white shrink-0" />
                    )}
                </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
        </Tooltip>
    );

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-gradient-to-b from-cyan-100/80 to-blue-200/50 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 shadow-xl border-r border-cyan-200 dark:border-slate-800 relative overflow-hidden transition-all duration-300">
            {/* Header / Logo Section */}
            <div className={cn("p-6 transition-all duration-300", isCollapsed ? "p-4 flex flex-col items-center" : "")}>
                <div className={cn("flex items-center gap-3 transition-all duration-300", isCollapsed ? "mb-0" : "mb-6")}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg flex items-center justify-center text-white shrink-0">
                        <Droplets className="h-6 w-6 fill-current drop-shadow-sm" />
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h1 className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100 truncate">AquaTest</h1>
                        </div>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/40 dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            <span className="mr-1">💧</span>
                            AquaTest is a smart web-based tool designed to analyze water samples for ammonia presence using AI-powered image recognition.
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation at bottom */}
            <nav className={cn("mt-auto px-4 py-4 space-y-2 transition-all duration-300", isCollapsed ? "px-2" : "px-4")}>
                <NavItem view="home" icon={Home} label="Dashboard" />
                <NavItem view="history" icon={History} label="History" />
                <NavItem view="settings" icon={Settings} label="Settings" />

                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-lg overflow-hidden",
                                isCollapsed ? "px-2 justify-center" : "px-4"
                            )}
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                            {theme === 'dark' ? (
                                <Sun className={cn("h-5 w-5 shrink-0 text-amber-500", isCollapsed ? "mx-auto" : "")} />
                            ) : (
                                <Moon className={cn("h-5 w-5 shrink-0 text-blue-600", isCollapsed ? "mx-auto" : "")} />
                            )}
                            {!isCollapsed && <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                        </Button>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">Toggle Theme</TooltipContent>}
                </Tooltip>

                <Separator className="my-4 bg-cyan-100/50" />

                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg overflow-hidden",
                                isCollapsed ? "px-2 justify-center" : "px-4"
                            )}
                            onClick={() => logout()}
                        >
                            <LogOut className={cn("h-5 w-5 shrink-0", isCollapsed ? "mx-auto" : "")} />
                            {!isCollapsed && <span className="font-medium">Logout</span>}
                        </Button>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
                </Tooltip>
            </nav>

            {/* Decorative water illustration at bottom */}
            {!isCollapsed && (
                <div className="mt-auto p-4 opacity-20 pointer-events-none select-none">
                    <svg viewBox="0 0 200 100" className="w-full h-auto text-cyan-600">
                        <path fill="currentColor" d="M0 50 Q 50 20 100 50 T 200 50 V 100 H 0 Z" />
                        <path fill="currentColor" fillOpacity="0.5" d="M0 60 Q 50 30 100 60 T 200 60 V 100 H 0 Z" />
                    </svg>
                </div>
            )}
        </div>
    );
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isLg = windowWidth >= 1024;

    return (
        <TooltipProvider>
            {/* Collapse Toggle Button - Vertically Centered on the edge */}
            <div
                className="fixed top-1/2 -translate-y-1/2 z-[50] transition-all duration-300"
                style={{
                    left: isLg
                        ? (isCollapsed ? '96px' : '304px')
                        : (isOpen ? '288px' : '0px')
                }}
            >
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={() => {
                                if (!isLg) {
                                    setIsOpen(!isOpen);
                                } else {
                                    onToggleCollapse();
                                }
                            }}
                            size="icon"
                            variant="secondary"
                            className={cn(
                                "h-10 w-10 border-cyan-200 bg-white shadow-xl hover:bg-cyan-50 hover:text-cyan-600 group transition-all",
                                (!isOpen && !isLg) ? "rounded-r-xl border-l-[0px]" : "rounded-full border"
                            )}
                        >
                            {(isCollapsed && isLg) || (!isOpen && !isLg) ? (
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:scale-110" />
                            ) : (
                                <ChevronLeft className="h-5 w-5 transition-transform group-hover:scale-110" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {(isCollapsed && isLg) || (!isOpen && !isLg) ? "Expand Sidebar" : "Collapse Sidebar"}
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* Mobile Menu Button - Removed redundant button */}

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out lg:translate-x-0 lg:static rounded-r-3xl my-0 lg:my-4 ml-0 lg:ml-4 lg:h-[calc(100vh-2rem)] shadow-2xl lg:shadow-soft",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    isCollapsed ? "w-20" : "w-72",
                    className
                )}
            >
                <SidebarContent />
            </aside>
        </TooltipProvider>
    );
};


