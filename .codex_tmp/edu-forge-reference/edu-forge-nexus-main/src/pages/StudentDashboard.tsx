import { BookOpen, Clock, Trophy, TrendingUp, Play, Receipt, Download, QrCode, CreditCard, Smartphone, CheckCircle2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const enrolledCourses = [
  { id: "1", title: "ພື້ນຖານ React.js ສຳລັບຜູ້ເລີ່ມຕົ້ນ", instructor: "ອ. ສົມໃຈ", progress: 65, thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=170&fit=crop" },
  { id: "2", title: "UX/UI Design ດ້ວຍ Figma", instructor: "ອ. ນາງ ບົວແກ້ວ", progress: 30, thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=170&fit=crop" },
  { id: "3", title: "Digital Marketing ຍຸກໃໝ່", instructor: "ອ. ສຸລິຍາ", progress: 100, thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=170&fit=crop" },
];

const statCards = [
  { label: "ຄອສທີ່ລົງທະບຽນ", value: "3", icon: BookOpen, color: "bg-primary/10 text-primary" },
  { label: "ຊົ່ວໂມງຮຽນ", value: "28", icon: Clock, color: "bg-secondary/10 text-secondary" },
  { label: "ຄອສສຳເລັດ", value: "1", icon: Trophy, color: "bg-accent/10 text-accent" },
  { label: "ຄະແນນສະເລ່ຍ", value: "85%", icon: TrendingUp, color: "bg-destructive/10 text-destructive" },
];

// Mock payment history (D5 + D12)
const paymentHistory = [
  {
    id: "TXN-2026-0428",
    date: "2026-04-28",
    courseTitle: "ພື້ນຖານ React.js ສຳລັບຜູ້ເລີ່ມຕົ້ນ",
    instructor: "ອ. ສົມໃຈ",
    method: "qr" as const,
    methodLabel: "QR / PromptPay",
    amount: 350000,
    status: "success" as const,
  },
  {
    id: "TXN-2026-0415",
    date: "2026-04-15",
    courseTitle: "UX/UI Design ດ້ວຍ Figma",
    instructor: "ອ. ນາງ ບົວແກ້ວ",
    method: "card" as const,
    methodLabel: "Visa ****4242",
    amount: 450000,
    status: "success" as const,
  },
  {
    id: "TXN-2026-0320",
    date: "2026-03-20",
    courseTitle: "Digital Marketing ຍຸກໃໝ່",
    instructor: "ອ. ສຸລິຍາ",
    method: "mobile" as const,
    methodLabel: "BCEL One",
    amount: 280000,
    status: "success" as const,
  },
  {
    id: "TXN-2026-0305",
    date: "2026-03-05",
    courseTitle: "Python ສຳລັບ Data Science",
    instructor: "ອ. ວິໄລ",
    method: "card" as const,
    methodLabel: "Mastercard ****8821",
    amount: 520000,
    status: "refunded" as const,
  },
  {
    id: "TXN-2026-0228",
    date: "2026-02-28",
    courseTitle: "ການອອກແບບກຣາຟິກເບື້ອງຕົ້ນ",
    instructor: "ອ. ຄຳພອນ",
    method: "qr" as const,
    methodLabel: "QR / PromptPay",
    amount: 0,
    status: "free" as const,
  },
];

const methodIcon = { qr: QrCode, card: CreditCard, mobile: Smartphone };

const statusBadge = (s: "success" | "refunded" | "free") => {
  if (s === "success") return <Badge className="bg-accent/15 text-accent hover:bg-accent/20 border-0">ສຳເລັດ</Badge>;
  if (s === "refunded") return <Badge variant="destructive" className="bg-destructive/15 text-destructive hover:bg-destructive/20 border-0">ຄືນເງິນແລ້ວ</Badge>;
  return <Badge variant="outline">ຟຣີ</Badge>;
};

const totalSpent = paymentHistory
  .filter((p) => p.status === "success")
  .reduce((s, p) => s + p.amount, 0);

const StudentDashboard = () => {
  const handleDownload = (txnId: string) => {
    toast({ title: "ດາວໂຫຼດໃບເສັດ", description: `ກຳລັງສ້າງໃບເສັດ ${txnId}...` });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary text-primary-foreground font-heading text-lg">ສພ</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl font-bold">ສະບາຍດີ, ສຸພາພອນ!</h1>
            <p className="text-muted-foreground">ສືບຕໍ່ການຮຽນຂອງທ່ານ</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-xl bg-card card-shadow p-4 space-y-2">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="font-heading text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs: Courses + Payments */}
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="courses"><BookOpen className="h-4 w-4 mr-2" /> ຄອສຂອງຂ້ອຍ</TabsTrigger>
            <TabsTrigger value="payments"><Receipt className="h-4 w-4 mr-2" /> ປະຫວັດການຊຳລະ</TabsTrigger>
          </TabsList>

          {/* Enrolled Courses */}
          <TabsContent value="courses" className="mt-6">
            <div className="space-y-4">
              {enrolledCourses.map((c) => (
                <div key={c.id} className="flex gap-4 rounded-xl bg-card card-shadow p-4 items-center">
                  <img src={c.thumbnail} alt={c.title} className="h-20 w-32 rounded-lg object-cover hidden sm:block" />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-medium text-sm">{c.title}</h3>
                    <p className="text-xs text-muted-foreground">{c.instructor}</p>
                    <div className="flex items-center gap-3">
                      <Progress value={c.progress} className="h-2 flex-1" />
                      <span className="text-xs font-medium text-muted-foreground">{c.progress}%</span>
                    </div>
                  </div>
                  <Button size="sm" variant={c.progress === 100 ? "outline" : "default"}>
                    {c.progress === 100 ? "ຣີວິວ" : <><Play className="h-3 w-3 mr-1" /> ຮຽນຕໍ່</>}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Payment History */}
          <TabsContent value="payments" className="mt-6 space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-80">ລວມການຊຳລະທັງໝົດ</span>
                  <Wallet className="h-5 w-5 opacity-80" />
                </div>
                <div className="font-heading text-2xl font-bold">₭{totalSpent.toLocaleString()}</div>
                <div className="text-xs opacity-75">{paymentHistory.filter(p => p.status === "success").length} ລາຍການສຳເລັດ</div>
              </div>
              <div className="rounded-xl bg-card card-shadow p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">ລາຍການທັງໝົດ</span>
                  <Receipt className="h-5 w-5 text-secondary" />
                </div>
                <div className="font-heading text-2xl font-bold">{paymentHistory.length}</div>
                <div className="text-xs text-muted-foreground">ປະຫວັດການຊຳລະ</div>
              </div>
              <div className="rounded-xl bg-card card-shadow p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">ສຳເລັດແລ້ວ</span>
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <div className="font-heading text-2xl font-bold text-accent">
                  {paymentHistory.filter(p => p.status === "success").length}
                </div>
                <div className="text-xs text-muted-foreground">ຊຳລະຜ່ານທຸກຊ່ອງທາງ</div>
              </div>
            </div>

            {/* Transactions table */}
            <div className="rounded-xl bg-card card-shadow overflow-hidden">
              <div className="p-5 border-b">
                <h3 className="font-heading font-bold">ປະຫວັດການຊຳລະເງິນ</h3>
                <p className="text-xs text-muted-foreground mt-1">ລາຍການຊື້ຄອສ ແລະ ໃບເສັດທັງໝົດຂອງທ່ານ</p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ລະຫັດ</TableHead>
                      <TableHead>ວັນທີ</TableHead>
                      <TableHead>ຄອສ</TableHead>
                      <TableHead>ວິທີຊຳລະ</TableHead>
                      <TableHead className="text-right">ຈຳນວນ</TableHead>
                      <TableHead>ສະຖານະ</TableHead>
                      <TableHead className="text-right">ໃບເສັດ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((p) => {
                      const Icon = methodIcon[p.method];
                      return (
                        <TableRow key={p.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs">{p.id}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">{p.date}</TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{p.courseTitle}</div>
                            <div className="text-xs text-muted-foreground">{p.instructor}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-xs">
                              <div className="h-7 w-7 rounded-md bg-secondary/10 flex items-center justify-center">
                                <Icon className="h-3.5 w-3.5 text-secondary" />
                              </div>
                              <span>{p.methodLabel}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold whitespace-nowrap">
                            {p.amount === 0 ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              <span className={p.status === "refunded" ? "line-through text-muted-foreground" : "text-secondary"}>
                                ₭{p.amount.toLocaleString()}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{statusBadge(p.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={p.status === "free"}
                              onClick={() => handleDownload(p.id)}
                            >
                              <Download className="h-3.5 w-3.5 mr-1" /> PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
