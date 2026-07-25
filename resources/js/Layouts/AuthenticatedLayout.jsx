import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Navbar,
    NavbarContent,
    NavbarItem,
    Button,
    User,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Input,
    Avatar,
    Badge,
    Switch,
    Tooltip
} from "@heroui/react";

// Icons
const SearchIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

const NotificationIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12.02 2.90991C8.70997 2.90991 6.01997 5.59991 6.01997 8.90991V11.7999C6.01997 12.4099 5.75997 13.3399 5.44997 13.8599L4.29997 15.7699C3.58997 16.9499 4.07997 18.2599 5.37997 18.2599H18.66C19.96 18.2599 20.45 16.9499 19.74 15.7699L18.59 13.8599C18.28 13.3399 18.02 12.4099 18.02 11.7999V8.90991C18.02 5.60991 15.32 2.90991 12.02 2.90991Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M13.87 3.2C13.56 3.11 13.24 3.04 12.91 3C11.95 2.88 11.03 2.97 10.17 3.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M15.02 19.06C15.02 20.71 13.67 22.06 12.02 22.06C10.37 22.06 9.02 20.71 9.02 19.06" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

export const MoonIcon = (props) => {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...props}
        >
            <path
                d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
                fill="currentColor"
            />
        </svg>
    );
};

export const SunIcon = (props) => {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...props}
        >
            <g fill="currentColor">
                <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
                <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
            </g>
        </svg>
    );
};

const DashboardIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M2 10C2 6.22876 2 4.34315 3.17157 3.17157C4.34315 2 6.22876 2 10 2H14C17.7712 2 19.6569 2 20.8284 3.17157C22 4.34315 22 6.22876 22 10V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V10Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 2V22" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const ParentsIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const UsersIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ClassesIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 13H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ScheduleIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M8 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const CoachIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const StaffIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const AttendanceIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const InvoiceIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const PayrollIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ReportIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M18 20V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 20V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const DocsIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M7 3H16C17.1046 3 18 3.89543 18 5V21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 7H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 15H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const TaskIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <polyline points="9 11 12 14 22 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const PaymentIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const RoomIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const PackageIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M21 16.89l-9 5.11-9-5.11v-9.78l9-5.11 9 5.11z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="3.27" y1="6.96" x2="12" y2="12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="22.73" y1="6.96" x2="12" y2="12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const SettingsIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const ActivityIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const LogIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SidebarItem = ({ href, icon: Icon, label, active, badge, collapsed }) => (
    <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${
            active
                ? 'bg-primary/10 text-primary'
                : 'text-default-500 hover:bg-default-100 hover:text-foreground'
        } ${collapsed ? 'justify-center' : ''}`}
    >
        {Icon && (
            <Tooltip content={collapsed ? label : null} placement="right">
                <span className="flex items-center">
                    <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-default-400 group-hover:text-default-600'}`} />
                </span>
            </Tooltip>
        )}
        {!collapsed && <span className="font-medium flex-1 truncate">{label}</span>}
        {!collapsed && badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
                active ? 'bg-primary text-white' : 'bg-default-100 text-default-600'
            }`}>
                {badge}
            </span>
        )}
    </Link>
);

export default function AuthenticatedLayout({ user: userProp, header, children }) {
    const page = usePage();
    const { url } = page;
    const user = userProp || page.props?.auth?.user || {};
    const [collapsed, setCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === "undefined") return false;
        const storedTheme = window.localStorage.getItem("theme");
        if (storedTheme === "dark") return true;
        if (storedTheme === "light") return false;
        return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
    });

    const toggleSidebar = () => setCollapsed(!collapsed);

    useEffect(() => {
        if (typeof document === "undefined") return;
        document.documentElement.classList.toggle("dark", isDarkMode);
        window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    return (
        <div className="flex h-screen w-full bg-background">
            {/* Sidebar */}
            <aside
                className={`${
                    collapsed ? 'w-20' : 'w-64'
                } bg-content1 border-r border-divider flex flex-col fixed inset-y-0 z-50 transition-all duration-300 ease-in-out`}
            >
                <div className={`h-16 flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-6'} border-b border-divider`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                         {/* Placeholder Logo */}
                        <div className="w-8 h-8 min-w-[2rem] bg-foreground rounded-full flex items-center justify-center text-background font-bold">A</div>
                        {!collapsed && <span className="text-xl font-bold text-foreground whitespace-nowrap">Academy</span>}
                    </div>
                    {!collapsed && (
                        <Button isIconOnly variant="light" size="sm" onPress={toggleSidebar}>
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Button>
                    )}
                </div>

                {collapsed && (
                    <div className="flex justify-center py-2 border-b border-divider/50">
                        <Button isIconOnly variant="light" size="sm" onPress={toggleSidebar}>
                             <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6">
                    {/* Dashboard Section */}
                    <div>
                        <SidebarItem
                            href={user?.role === 'Coach' ? route('coach.dashboard') : route('dashboard')}
                            icon={DashboardIcon}
                            label="Dashboard"
                            active={url.startsWith('/dashboard') || url.startsWith('/coach/dashboard')}
                            collapsed={collapsed}
                        />
                    </div>

                    {user?.role === 'Admin' && (
                        <>
                            {/* Academic Section */}
                            <div>
                                {!collapsed && (
                                    <div className="px-4 mb-2 text-xs font-semibold text-default-400 uppercase tracking-wider whitespace-nowrap">
                                        Academic
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <SidebarItem
                                        href={route('admin.students.index')}
                                        icon={UsersIcon}
                                        label="Students"
                                        active={url.startsWith('/admin/students')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.parents.index')}
                                        icon={ParentsIcon}
                                        label="Parents"
                                        active={url.startsWith('/admin/parents')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.classes.index')}
                                        icon={ClassesIcon}
                                        label="Classes"
                                        active={url.startsWith('/admin/classes')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.schedules.generator')}
                                        icon={ScheduleIcon}
                                        label="Schedules"
                                        active={url.startsWith('/admin/schedules')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.attendances.index')}
                                        icon={AttendanceIcon}
                                        label="Attendance"
                                        active={url.startsWith('/admin/attendances')}
                                        collapsed={collapsed}
                                    />
                                </div>
                            </div>

                            {/* Management Section */}
                            <div>
                                {!collapsed && (
                                    <div className="px-4 mb-2 text-xs font-semibold text-default-400 uppercase tracking-wider whitespace-nowrap">
                                        Management
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <SidebarItem
                                        href={route('admin.coaches.index')}
                                        icon={CoachIcon}
                                        label="Coaches"
                                        active={url.startsWith('/admin/coaches')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.users.index')}
                                        icon={StaffIcon}
                                        label="Users / Staff"
                                        active={url.startsWith('/admin/users')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.rooms.index')}
                                        icon={RoomIcon}
                                        label="Rooms"
                                        active={url.startsWith('/admin/rooms')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.packages.index')}
                                        icon={PackageIcon}
                                        label="Packages"
                                        active={url.startsWith('/admin/packages')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.tasks.index')}
                                        icon={TaskIcon}
                                        label="Tasks"
                                        active={url.startsWith('/admin/tasks')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.docs.index')}
                                        icon={DocsIcon}
                                        label="Docs"
                                        active={url.startsWith('/admin/docs')}
                                        collapsed={collapsed}
                                    />
                                </div>
                            </div>

                            {/* Finance Section */}
                            <div>
                                {!collapsed && (
                                    <div className="px-4 mb-2 text-xs font-semibold text-default-400 uppercase tracking-wider whitespace-nowrap">
                                        Finance
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <SidebarItem
                                        href={route('admin.invoices.index')}
                                        icon={InvoiceIcon}
                                        label="Invoices"
                                        active={url.startsWith('/admin/invoices')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.payments.index')}
                                        icon={PaymentIcon}
                                        label="Payments"
                                        active={url.startsWith('/admin/payments')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.payrolls.index')}
                                        icon={PayrollIcon}
                                        label="Payrolls"
                                        active={url.startsWith('/admin/payrolls')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.notifications.index')}
                                        icon={NotificationIcon}
                                        label="Notifications"
                                        active={url.startsWith('/admin/notifications')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.announcements.index')}
                                        icon={NotificationIcon}
                                        label="Announcements"
                                        active={url.startsWith('/admin/announcements')}
                                        collapsed={collapsed}
                                    />
                                </div>
                            </div>

                            {/* Reports Section */}
                            <div>
                                {!collapsed && (
                                    <div className="px-4 mb-2 text-xs font-semibold text-default-400 uppercase tracking-wider whitespace-nowrap">
                                        Analytics
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <SidebarItem
                                        href={route('admin.reports.index')}
                                        icon={ReportIcon}
                                        label="Reports"
                                        active={url.startsWith('/admin/reports')}
                                        collapsed={collapsed}
                                    />
                                </div>
                            </div>

                            {/* System & Settings Section */}
                            <div>
                                {!collapsed && (
                                    <div className="px-4 mb-2 text-xs font-semibold text-default-400 uppercase tracking-wider whitespace-nowrap">
                                        System & Settings
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <SidebarItem
                                        href={route('admin.settings.company')}
                                        icon={SettingsIcon}
                                        label="Company Profile"
                                        active={url.startsWith('/admin/settings/company')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.settings.services')}
                                        icon={SettingsIcon}
                                        label="External Services"
                                        active={url.startsWith('/admin/settings/services')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.activity-logs.index')}
                                        icon={ActivityIcon}
                                        label="Activity Logs"
                                        active={url.startsWith('/admin/activity-logs')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('admin.system-logs.index')}
                                        icon={LogIcon}
                                        label="System Logs"
                                        active={url.startsWith('/admin/system-logs')}
                                        collapsed={collapsed}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {user?.role === 'Coach' && (
                        <>
                            {/* Coach Section */}
                            <div>
                                {!collapsed && (
                                    <div className="px-4 mb-2 text-xs font-semibold text-default-400 uppercase tracking-wider whitespace-nowrap">
                                        My Portal
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <SidebarItem
                                        href={user?.role === 'Coach' ? route('coach.schedule.index') : route('coach.schedule.index')}
                                        icon={ScheduleIcon}
                                        label="My Schedule"
                                        active={url.startsWith('/coach/schedule')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={user?.role === 'Coach' ? route('coach.classes.index') : route('coach.classes.index')}
                                        icon={ClassesIcon}
                                        label="My Classes"
                                        active={url.startsWith('/coach/classes')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={user?.role === 'Coach' ? route('coach.students.index') : route('coach.students.index')}
                                        icon={UsersIcon}
                                        label="My Students"
                                        active={url.startsWith('/coach/students')}
                                        collapsed={collapsed}
                                    />
                                    <SidebarItem
                                        href={route('coach.payrolls.index')}
                                        icon={PayrollIcon}
                                        label="My Payroll"
                                        active={url.startsWith('/coach/payrolls')}
                                        collapsed={collapsed}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User Profile at Bottom (Optional, based on first request, but Image shows it top right.
                    I'll keep the sidebar clean and put profile in Topbar as per standard/image) */}
            </aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col ${collapsed ? 'ml-20' : 'ml-64'} min-w-0 transition-all duration-300 ease-in-out`}>
                {/* Topbar */}
                <header className="h-16 bg-content1 border-b border-divider sticky top-0 z-40 px-6 flex items-center justify-between gap-4">
                    {/* Search */}
                    <div className="flex-1 max-w-xl">
                        <Input
                            classNames={{
                                base: "max-w-full sm:max-w-[20rem] h-10",
                                mainWrapper: "h-full",
                                input: "text-small",
                                inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                            }}
                            placeholder="Type to search..."
                            size="sm"
                            startContent={<SearchIcon size={18} />}
                            type="search"
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {user?.role === 'Admin' && (user?.is_coach || user?.coach_profile) && (
                            url.startsWith('/coach') ? (
                                <Button size="sm" color="primary" variant="flat" as={Link} href={route('dashboard')}>
                                    Switch to Admin View
                                </Button>
                            ) : (
                                <Button size="sm" color="secondary" variant="flat" as={Link} href={route('coach.dashboard')}>
                                    Switch to Coach View
                                </Button>
                            )
                        )}

                        <Button isIconOnly variant="light" radius="full">
                            <Badge content="" color="danger" shape="circle" size="sm">
                                <NotificationIcon className="text-default-500 text-xl" />
                            </Badge>
                        </Button>

                        <Tooltip content={isDarkMode ? "Light mode" : "Dark mode"} placement="bottom">
                            <Switch
                                aria-label="Toggle dark mode"
                                size="sm"
                                color="primary"
                                startContent={<SunIcon />}
                                endContent={<MoonIcon />}
                                isSelected={isDarkMode}
                                onValueChange={setIsDarkMode}
                            />
                        </Tooltip>

                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Avatar
                                    isBordered
                                    as="button"
                                    className="transition-transform"
                                    color="primary"
                                    name={user?.name}
                                    size="sm"
                                    src="https://i.pravatar.cc/150?u=a042581f4e29026704d" // Placeholder
                                />
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Profile Actions" variant="flat">
                                <DropdownItem key="profile" className="h-14 gap-2">
                                    <p className="font-semibold">Signed in as</p>
                                    <p className="font-semibold">{user?.email}</p>
                                </DropdownItem>
                                <DropdownItem key="settings" href={route('profile.edit')}>
                                    My Settings
                                </DropdownItem>
                                <DropdownItem key="logout" color="danger" href={route('logout')} method="post" as={Link}>
                                    Log Out
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                     {/* Header Slot (Breadcrumbs/Title) */}
                    {header && (
                        <div className="mb-6">
                            {header}
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}
