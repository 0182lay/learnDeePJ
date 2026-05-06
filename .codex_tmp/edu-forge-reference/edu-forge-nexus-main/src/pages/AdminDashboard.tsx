import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, DollarSign, ShieldCheck, CheckCircle, XCircle, Clock, Plus, Settings, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { monthlyRevenue, topCourses } from "@/data/mockData";

const adminStats = [
  { label: "ຜູ້ໃຊ້ທັງໝົດ", value: "12,500", icon: Users, color: "bg-primary/10 text-primary" },
  { label: "ຄອສທັງໝົດ", value: "350", icon: BookOpen, color: "bg-secondary/10 text-secondary" },
  { label: "ລາຍໄດ້ເດືອນນີ້", value: "₭25M", icon: DollarSign, color: "bg-accent/10 text-accent" },
  { label: "ຜູ້ສອນລໍຖ້າ", value: "8", icon: ShieldCheck, color: "bg-destructive/10 text-destructive" },
];

const pendingTeachers = [
  { id: "1", name: "ອ. ພອນສັກ ວິໄລ", email: "phonsak@email.com", subject: "Data Science", date: "2 ມື້ກ່ອນ" },
  { id: "2", name: "ອ. ມະນີຈັນ ສີທາ", email: "manychan@email.com", subject: "ພາສາຈີນ", date: "3 ມື້ກ່ອນ" },
  { id: "3", name: "ອ. ບຸນມີ ແກ້ວມະນີ", email: "bounmy@email.com", subject: "ການເງິນ", date: "5 ມື້ກ່ອນ" },
];

const recentActivity = [
  { action: "ນັກຮຽນໃໝ່ລົງທະບຽນ", detail: "ນາງ ສຸກສາຄອນ", time: "5 ນາທີກ່ອນ" },
  { action: "ຄອສໃໝ່ຖືກສ້າງ", detail: "Vue.js Fundamentals", time: "1 ຊມ ກ່ອນ" },
  { action: "ການຊຳລະເງິນ", detail: "₭200,000 - React Course", time: "2 ຊມ ກ່ອນ" },
  { action: "ຣີວິວໃໝ່", detail: "5 ດາວ - UX/UI Design", time: "3 ຊມ ກ່ອນ" },
];

const allCourses = [
  { id: "1", title: "ພື້ນຖານ React.js", teacher: "ອ. ສົມໃຈ", students: 1250, revenue: "₭1.2M", status: "active" },
  { id: "2", title: "UX/UI Design ດ້ວຍ Figma", teacher: "ອ. ບົວແກ້ວ", students: 890, revenue: "₭950K", status: "active" },
  { id: "3", title: "Digital Marketing", teacher: "ອ. ສຸລິຍາ", students: 420, revenue: "₭500K", status: "active" },
  { id: "4", title: "Python AI", teacher: "Admin", students: 0, revenue: "₭0", status: "draft" },
];

const COLORS = ["hsl(40, 80%, 55%)", "hsl(220, 60%, 35%)", "hsl(160, 50%, 45%)", "hsl(0, 70%, 55%)", "hsl(280, 50%, 50%)"];

const financeData = [
  { label: "ລາຍໄດ້ລວມ", value: "₭113.1M", sub: "6 ເດືອນ" },
  { label: "ຄ່າຄອມມິດຊັ່ນ (20%)", value: "₭22.6M", sub: "ລະບົບໄດ້ຮັບ" },
  { label: "ຈ່າຍຜູ້ສອນ", value: "₭90.5M", sub: "80% ຂອງລາຍໄດ້" },
];

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">ແຜງຄວບຄຸມ Admin</h1>
            <p className="text-muted-foreground">ຍິນດີຕ້ອນຮັບ, {user?.name || "Admin"} — ຈັດການລະບົບທັງໝົດ</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/dashboard/admin/create"><Settings className="h-4 w-4 mr-1" /> ຈັດການຄອສ</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard/admin/create"><Plus className="h-4 w-4 mr-1" /> ສ້າງຄອສໃໝ່</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {adminStats.map((s) => (
            <div key={s.label} className="rounded-xl bg-card card-shadow p-4 space-y-2">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="font-heading text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">ພາບລວມ</TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> ລາຍງານ</TabsTrigger>
            <TabsTrigger value="courses">ຄອສທັງໝົດ</TabsTrigger>
            <TabsTrigger value="teachers">ຜູ້ສອນລໍຖ້າ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-card card-shadow p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-bold">ຜູ້ສອນລໍຖ້າອະນຸມັດ</h2>
                  <Badge variant="destructive">{pendingTeachers.length}</Badge>
                </div>
                <div className="space-y-3">
                  {pendingTeachers.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-xs">{t.name.charAt(3)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.subject} • {t.date}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-accent"><CheckCircle className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><XCircle className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-card card-shadow p-6 space-y-4">
                <h2 className="font-heading font-bold">ກິດຈະກຳລ່າສຸດ</h2>
                <div className="space-y-3">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{a.action}</div>
                        <div className="text-xs text-muted-foreground">{a.detail}</div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6 space-y-6">
            {/* Finance summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {financeData.map((f) => (
                <div key={f.label} className="rounded-xl bg-card card-shadow p-5 space-y-1">
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                  <p className="font-heading text-2xl font-bold text-secondary">{f.value}</p>
                  <p className="text-xs text-muted-foreground">{f.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Revenue chart */}
              <div className="rounded-xl bg-card card-shadow p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold">ລາຍໄດ້ລາຍເດືອນ</h3>
                  <Badge variant="outline" className="text-xs"><TrendingUp className="h-3 w-3 mr-1" /> +28%</Badge>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => [`₭${value.toLocaleString()}`, "ລາຍໄດ້"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                    />
                    <Bar dataKey="revenue" fill="hsl(40, 80%, 55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Students chart */}
              <div className="rounded-xl bg-card card-shadow p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold">ນັກຮຽນໃໝ່ລາຍເດືອນ</h3>
                  <Badge variant="outline" className="text-xs"><Users className="h-3 w-3 mr-1" /> +15%</Badge>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => [value, "ນັກຮຽນ"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                    />
                    <Line type="monotone" dataKey="students" stroke="hsl(160, 50%, 45%)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top courses & pie */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-card card-shadow p-6 space-y-4">
                <h3 className="font-heading font-bold">ຄອສຍອດນິຍົມ</h3>
                <div className="space-y-3">
                  {topCourses.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.students.toLocaleString()} ນັກຮຽນ</p>
                      </div>
                      <span className="text-sm font-bold text-secondary">
                        {c.revenue > 0 ? `₭${(c.revenue / 1000000).toFixed(0)}M` : "ຟຣີ"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-card card-shadow p-6 space-y-4">
                <h3 className="font-heading font-bold">ສ່ວນແບ່ງນັກຮຽນ</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={topCourses}
                      dataKey="students"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name.slice(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                    >
                      {topCourses.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value.toLocaleString(), "ນັກຮຽນ"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            <div className="rounded-xl bg-card card-shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">ຄອສ</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">ຜູ້ສອນ</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">ນັກຮຽນ</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">ລາຍໄດ້</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">ສະຖານະ</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">ຈັດການ</th>
                  </tr>
                </thead>
                <tbody>
                  {allCourses.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="p-3 font-medium">{c.title}</td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell">{c.teacher}</td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell">{c.students.toLocaleString()}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{c.revenue}</td>
                      <td className="p-3">
                        <Badge variant={c.status === "active" ? "default" : "outline"}>
                          {c.status === "active" ? "ເປີດສອນ" : "ສ້າງຢູ່"}
                        </Badge>
                      </td>
                      <td className="p-3"><Button variant="ghost" size="sm">ແກ້ໄຂ</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="teachers" className="mt-6">
            <div className="rounded-xl bg-card card-shadow p-6 space-y-4">
              <h2 className="font-heading font-bold text-lg">ຜູ້ສອນລໍຖ້າອະນຸມັດ ({pendingTeachers.length})</h2>
              <div className="space-y-3">
                {pendingTeachers.map((t) => (
                  <div key={t.id} className="flex items-center gap-4 p-4 rounded-lg border">
                    <Avatar className="h-12 w-12"><AvatarFallback>{t.name.charAt(3)}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.email}</div>
                      <div className="text-xs text-muted-foreground mt-1">ສາຂາ: {t.subject} • ສົ່ງມາ: {t.date}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" className="bg-accent hover:bg-accent/90">
                        <CheckCircle className="h-4 w-4 mr-1" /> ອະນຸມັດ
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <XCircle className="h-4 w-4 mr-1" /> ປະຕິເສດ
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
