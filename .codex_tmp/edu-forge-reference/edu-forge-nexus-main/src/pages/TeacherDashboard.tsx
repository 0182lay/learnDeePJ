import { Link } from "react-router-dom";
import { BookOpen, Users, DollarSign, TrendingUp, Plus, Eye, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { teacherRevenue } from "@/data/mockData";

const teacherStats = [
  { label: "ຄອສຂອງຂ້ອຍ", value: "5", icon: BookOpen, color: "bg-primary/10 text-primary" },
  { label: "ນັກຮຽນທັງໝົດ", value: "1,890", icon: Users, color: "bg-secondary/10 text-secondary" },
  { label: "ລາຍໄດ້ສຸດທິ", value: "₭52.9M", icon: DollarSign, color: "bg-accent/10 text-accent" },
  { label: "ຄ່າຄອມມິດຊັ່ນ (20%)", value: "₭13.2M", icon: Percent, color: "bg-destructive/10 text-destructive" },
];

const myCourses = [
  { id: "1", title: "ພື້ນຖານ React.js", students: 1250, revenue: "₭1.2M", commission: "₭240K", net: "₭960K", status: "active", lessons: 12 },
  { id: "2", title: "Node.js Backend", students: 640, revenue: "₭800K", commission: "₭160K", net: "₭640K", status: "active", lessons: 8 },
  { id: "3", title: "TypeScript Masterclass", students: 0, revenue: "₭0", commission: "₭0", net: "₭0", status: "draft", lessons: 3 },
];

const TeacherDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-secondary text-secondary-foreground font-heading text-lg">
                {user?.initials || "ສຈ"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-heading text-2xl font-bold">{user?.name || "ອ. ສົມໃຈ ພົມມະວົງ"}</h1>
              <p className="text-muted-foreground">ຜູ້ສອນ — ສ້າງ ແລະ ຈັດການຄອສຂອງທ່ານ</p>
            </div>
          </div>
          <Button asChild>
            <Link to="/dashboard/teacher/create"><Plus className="h-4 w-4 mr-1" /> ສ້າງຄອສໃໝ່</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {teacherStats.map((s) => (
            <div key={s.label} className="rounded-xl bg-card card-shadow p-4 space-y-2">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="font-heading text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="rounded-xl bg-card card-shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold">ລາຍໄດ້ & ຄ່າຄອມມິດຊັ່ນ</h2>
            <Badge variant="outline" className="text-xs"><TrendingUp className="h-3 w-3 mr-1" /> 6 ເດືອນ</Badge>
          </div>
          <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
            💡 ລະບົບຫັກຄ່າຄອມມິດຊັ່ນ 20% ຈາກລາຍໄດ້ລວມ — ທ່ານໄດ້ຮັບ 80%
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={teacherRevenue}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `₭${value.toLocaleString()}`,
                  name === "net" ? "ລາຍໄດ້ສຸດທິ" : name === "commission" ? "ຄ່າຄອມມິດຊັ່ນ" : "ລາຍໄດ້ລວມ"
                ]}
                contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
              />
              <Legend formatter={(v) => v === "net" ? "ລາຍໄດ້ສຸດທິ" : "ຄ່າຄອມມິດຊັ່ນ"} />
              <Bar dataKey="net" fill="hsl(160, 50%, 45%)" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="commission" fill="hsl(0, 70%, 60%)" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Courses table */}
        <div>
          <h2 className="font-heading text-xl font-bold mb-4">ຄອສຂອງຂ້ອຍ</h2>
          <div className="rounded-xl bg-card card-shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">ຄອສ</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">ບົດຮຽນ</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">ນັກຮຽນ</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">ລາຍໄດ້ລວມ</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">ຄ່າຄອມ</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">ສຸດທິ</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">ສະຖານະ</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">ຈັດການ</th>
                </tr>
              </thead>
              <tbody>
                {myCourses.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-3 font-medium">{c.title}</td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{c.lessons} ບົດ</td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{c.students.toLocaleString()}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{c.revenue}</td>
                    <td className="p-3 text-destructive hidden md:table-cell text-xs">{c.commission}</td>
                    <td className="p-3 text-accent font-medium hidden lg:table-cell">{c.net}</td>
                    <td className="p-3">
                      <Badge variant={c.status === "active" ? "default" : "outline"}>
                        {c.status === "active" ? "ເປີດສອນ" : "ສ້າງຢູ່"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/courses/${c.id}`}><Eye className="h-3 w-3 mr-1" /> ເບິ່ງ</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeacherDashboard;
