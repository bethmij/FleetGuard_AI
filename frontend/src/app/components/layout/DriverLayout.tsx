/**
 * @module     Client Portal (Driver-Facing Interface)
 * @author     Yuraj Malinda <yurajmalinda123@gmail.com>
 * @description This file is part of the Client (Driver) Portal of FleetGuard AI.
 *              All pages and components in this section were developed by Yuraj Malinda.
 * @date       2026-03-14
 */

import { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { DriverSidebar } from './DriverSidebar';
import { LanguageSwitcher } from '@/app/components/common/LanguageSwitcher';
import { useNavigate, Link } from 'react-router';
import { notificationService } from '@/services/notificationService';
import gpsService from '@/services/gpsService';


interface DriverLayoutProps {
  children: React.ReactNode;
}

export function DriverLayout({ children }: DriverLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationService.getAll()
      .then((data: any) => {
        setUnreadCount(data.unread_count || 0);
      })
      .catch(() => {});

    // ── Background GPS location reporter ────────────────
    const reportGps = () => {
      gpsService.captureAndSend().catch(() => {});
    };
    reportGps(); // Immediate mount count trigger
    const gpsInterval = setInterval(reportGps, 5 * 60000); // 5 minutes cycle
    return () => clearInterval(gpsInterval);
  }, []);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <DriverSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />


            {/* Notifications */}
            <Link to="/driver/notifications">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full relative"
              >
                <Bell className="w-5 h-5 text-slate-700 dark:text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}