import { NavLink } from "react-router-dom";
import { Home, FileText, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar = () => {

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/assignments", icon: FileText, label: "Assignments" },
    { to: "/rankings", icon: Trophy, label: "Rankings" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-xl">E</span>
        </div>
        <span className="font-bold text-xl text-slate-900">English LMS</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export const MobileNav = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/assignments", icon: FileText, label: "Tasks" },
    { to: "/rankings", icon: Trophy, label: "Rank" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center py-3 px-2 z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
              isActive ? "text-indigo-600" : "text-slate-400"
            )
          }
        >
          <item.icon size={20} />
          <span className="text-[10px] font-bold uppercase">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
