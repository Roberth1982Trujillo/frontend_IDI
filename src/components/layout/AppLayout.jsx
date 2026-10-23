import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../context/AuthContext';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={user ? () => setSidebarOpen((prev) => !prev) : null} />

      <div className="flex-1 flex">
        {user && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

        <main className={`flex-1 transition-all ${user ? 'lg:pl-72' : ''} p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
