import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useStats } from "../../hooks/useUsers";

const AppLayout = () => {
  const { data: stats } = useStats();
  const userCount = stats?.overview?.total;

  return (
    <div className="flex min-h-screen bg-base-900">
      <Sidebar userCount={userCount} />
      {/* Main content offset by sidebar width */}
      <div className="flex-1 ml-56 min-h-screen flex flex-col">
        <main className="flex-1 p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
