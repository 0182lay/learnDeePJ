import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const baseLinks = [
    { to: "/", label: "ໜ້າຫຼັກ" },
    { to: "/courses", label: "ຄອສຮຽນ" },
  ];

  const roleLinks = isAuthenticated && user
    ? user.role === "student"
      ? [{ to: "/dashboard/student", label: "Dashboard" }]
      : user.role === "teacher"
      ? [{ to: "/dashboard/teacher", label: "Dashboard" }, { to: "/dashboard/teacher/create", label: "ສ້າງຄອສ" }]
      : [{ to: "/dashboard/admin", label: "Dashboard" }, { to: "/dashboard/admin/create", label: "ສ້າງຄອສ" }]
    : [];

  const links = [...baseLinks, ...roleLinks];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const roleBadge = user?.role === "admin" ? "ແອດມິນ" : user?.role === "teacher" ? "ຜູ້ສອນ" : "ນັກຮຽນ";

  return (
    <nav className="sticky top-0 z-50 glass border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold">LearnLao</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border px-3 py-1.5 hover:bg-muted transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">{user.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/20 text-secondary font-medium">{roleBadge}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate(user.role === "student" ? "/dashboard/student" : user.role === "teacher" ? "/dashboard/teacher" : "/dashboard/admin")}>
                  <User className="h-4 w-4 mr-2" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> ອອກຈາກລະບົບ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">ເຂົ້າສູ່ລະບົບ</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">ລົງທະບຽນ</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-card p-4 space-y-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="block text-sm font-medium text-muted-foreground hover:text-primary" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {isAuthenticated ? (
              <Button variant="destructive" size="sm" className="flex-1" onClick={handleLogout}>ອອກຈາກລະບົບ</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="flex-1" asChild><Link to="/login">ເຂົ້າສູ່ລະບົບ</Link></Button>
                <Button size="sm" className="flex-1" asChild><Link to="/register">ລົງທະບຽນ</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
