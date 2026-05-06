import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    expertise: "",
    bio: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register:", form);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Visual */}
      <div className="hidden lg:flex hero-gradient items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-2xl bg-secondary/20 flex items-center justify-center">
              <GraduationCap className="h-12 w-12 text-secondary" />
            </div>
          </div>
          <h2 className="font-heading text-3xl font-bold text-primary-foreground">
            ເລີ່ມຕົ້ນການເດີນທາງ
          </h2>
          <p className="text-primary-foreground/70 leading-relaxed">
            ສ້າງບັນຊີ ແລະ ເລີ່ມຮຽນຮູ້ທັກສະໃໝ່ໆ ກັບ LearnLao ມື້ນີ້
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { icon: "📚", label: "350+ ຄອສ" },
              { icon: "👩‍🏫", label: "120+ ຜູ້ສອນ" },
              { icon: "🏆", label: "ໃບຢັ້ງຢືນ" },
            ].map((item) => (
              <div key={item.label} className="bg-primary-foreground/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs text-primary-foreground/80">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold">LearnLao</span>
            </Link>
            <h1 className="font-heading text-3xl font-bold">ສ້າງບັນຊີໃໝ່</h1>
            <p className="text-muted-foreground">ລົງທະບຽນເພື່ອເລີ່ມຮຽນ ຫຼື ສອນ</p>
          </div>

          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="student">ນັກຮຽນ</TabsTrigger>
              <TabsTrigger value="teacher">ຜູ້ສອນ</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            {["student", "teacher", "admin"].map((role) => (
              <TabsContent key={role} value={role}>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>ຊື່</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="ຊື່" value={form.firstName} onChange={set("firstName")} className="pl-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>ນາມສະກຸນ</Label>
                      <Input placeholder="ນາມສະກຸນ" value={form.lastName} onChange={set("lastName")} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ອີເມວ</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" placeholder="name@example.com" value={form.email} onChange={set("email")} className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ເບີໂທ</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="tel" placeholder="020 XXXX XXXX" value={form.phone} onChange={set("phone")} className="pl-10" required />
                    </div>
                  </div>

                  {role === "teacher" && (
                    <>
                      <div className="space-y-2">
                        <Label>ສາຂາຊ່ຽວຊານ</Label>
                        <Select onValueChange={(v) => setForm((f) => ({ ...f, expertise: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="ເລືອກສາຂາ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="web">ການພັດທະນາເວັບ</SelectItem>
                            <SelectItem value="design">ການອອກແບບ</SelectItem>
                            <SelectItem value="business">ທຸລະກິດ</SelectItem>
                            <SelectItem value="marketing">ການຕະຫຼາດ</SelectItem>
                            <SelectItem value="language">ພາສາ</SelectItem>
                            <SelectItem value="tech">ເທັກໂນໂລຢີ</SelectItem>
                            <SelectItem value="finance">ການເງິນ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>ແນະນຳຕົວ</Label>
                        <Textarea
                          placeholder="ບອກກ່ຽວກັບປະສົບການ ແລະ ຄວາມຊ່ຽວຊານຂອງທ່ານ..."
                          value={form.bio}
                          onChange={set("bio")}
                          rows={3}
                        />
                      </div>
                      <div className="rounded-lg bg-secondary/10 p-3 text-sm text-muted-foreground">
                        ⓘ ການລົງທະບຽນຜູ້ສອນຈະຕ້ອງໄດ້ຮັບການອະນຸມັດຈາກ Admin ກ່ອນ
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>ລະຫັດຜ່ານ</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={set("password")}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ຢືນຢັນລະຫັດຜ່ານ</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={set("confirmPassword")}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    {role === "teacher" ? "ສົ່ງຄຳຂໍລົງທະບຽນ" : "ລົງທະບຽນ"}
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-2 text-muted-foreground">ຫຼື</span>
                    </div>
                  </div>

                  <Button type="button" variant="outline" className="w-full" size="lg">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    ລົງທະບຽນດ້ວຍ Google
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>

          <p className="text-center text-sm text-muted-foreground">
            ມີບັນຊີແລ້ວ?{" "}
            <Link to="/login" className="text-secondary font-medium hover:underline">
              ເຂົ້າສູ່ລະບົບ
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
