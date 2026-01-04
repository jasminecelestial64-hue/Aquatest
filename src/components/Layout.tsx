import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
    children: React.ReactNode;
    activeView: 'home' | 'settings' | 'history';
    onNavigate: (view: 'home' | 'settings' | 'history') => void;
}

export const Layout = ({ children, activeView, onNavigate }: LayoutProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-background overflow-hidden relative">
            <Sidebar
                activeView={activeView}
                onNavigate={onNavigate}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />
            <main className="flex-1 overflow-auto relative transition-all duration-300 ease-in-out">
                {/* Animated ripple effects - now at 50% opacity color */}
                <div className="absolute top-10 left-1/4 w-32 h-32 rounded-full bg-cyan-300/50 animate-[ripple_4s_ease-out_infinite] pointer-events-none" />
                <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-blue-300/50 animate-[ripple_6s_ease-out_infinite_2s] pointer-events-none" />
                <div className="absolute bottom-1/4 left-1/3 w-36 h-36 rounded-full bg-sky-300/50 animate-[ripple_5s_ease-out_infinite_1s] pointer-events-none" />

                {/* Decorative water-themed icons - all at opacity-50 */}
                <div className="absolute top-12 right-12 opacity-50 pointer-events-none hidden lg:block animate-[float_6s_ease-in-out_infinite]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                        <path d="M12 2v10" />
                        <path d="M18.42 4.61a2.1 2.1 0 0 1 2.97 2.97L12 17l-9.39-9.42a2.1 2.1 0 0 1 2.97-2.97" />
                    </svg>
                </div>

                <div className="absolute bottom-20 left-10 opacity-50 pointer-events-none hidden lg:block animate-[float_7s_ease-in-out_infinite_1s]">
                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                        <path d="M17.5 19c.7-1.3 1.5-2.6 1.5-4.5 0-2.8-2-5.4-4-7.6-1.5-1.7-3-3.9-3-6.9 0 3-1.5 5.2-3 6.9-2 2.2-4 4.8-4 7.6 0 1.9.8 3.2 1.5 4.5" />
                        <path d="M12 11c1 1.5 1.5 3 1.5 4.5" />
                    </svg>
                </div>

                {/* Center-focused additional icons */}
                <div className="absolute top-1/2 left-1/3 opacity-50 pointer-events-none hidden lg:block animate-[float_8s_ease-in-out_infinite_0.5s]">
                    <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
                        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-4-4-4-6.5c0 2.5-2 4.9-4 6.5s-3 3.5-3 5.5a7 7 0 0 0 7 7z" />
                    </svg>
                </div>

                <div className="absolute top-1/3 right-1/3 opacity-50 pointer-events-none hidden lg:block animate-[float_5s_ease-in-out_infinite_1.5s]">
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                </div>

                <div className="absolute top-[45%] left-1/2 opacity-50 pointer-events-none hidden lg:block animate-[float_10s_ease-in-out_infinite_1s]">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-200">
                        <path d="M12 3a9 9 0 0 0-9 9c0 5 9 12 9 12s9-7 9-12a9 9 0 0 0-9-9Z" />
                    </svg>
                </div>

                <div className="absolute bottom-1/3 left-1/2 opacity-50 pointer-events-none hidden lg:block animate-[float_9s_ease-in-out_infinite]">
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-sky-300">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" />
                    </svg>
                </div>

                {/* Logo-like decorative element in top-leftish */}
                <div className="absolute top-1/4 left-10 opacity-50 pointer-events-none hidden lg:block">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                    </svg>
                </div>

                {children}
            </main>
        </div>
    );
};
