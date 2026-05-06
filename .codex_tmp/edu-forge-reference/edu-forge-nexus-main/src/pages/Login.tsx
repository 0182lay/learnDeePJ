import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const DEMO_CREDENTIALS: Record<UserRole, { email: string; hint: string }> = {
  student: { email: "student@learnlao.com", hint: "ນັກຮຽນ → ເບິ່ງຄອສ, ຕິດຕາມຄວາມຄືບໜ້າ" },
  teacher: { email: "teacher@learnlao.com", hint: "ຜູ້ສອນ → ສ້າງຄອສ, ອັບໂຫຼດບົດຮຽນ, ເບິ່ງລາຍໄດ້" },
  admin: { email: "admin@learnlao.com", hint: "ແອດມິນ → ຈັດການທຸກຢ່າງ, ອະນຸມັດຜູ້ສອນ, ເບິ່ງລາຍງານ" },
};

const ROLE_REDIRECTS: Record<UserRole, string> = {
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  admin: "/dashboard/admin",
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeRole, setActiveRole] = useState<UserRole>("student");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email || DEMO_CREDENTIALS[activeRole].email, password, activeRole);
    if (success) {
      toast({ title: "ເຂົ້າສູ່ລະບົບສຳເລັດ!", description: `ຍິນດີຕ້ອນຮັບ ${activeRole === "student" ? "ນັກຮຽນ" : activeRole === "teacher" ? "ຜູ້ສອນ" : "ແອດມິນ"}` });
      navigate(ROLE_REDIRECTS[activeRole]);
    } else {
      toast({ title: "ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ", variant: "destructive" });
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS[activeRole].email);
    setPassword("demo1234");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold">LearnLao</span>
            </Link>
            <h1 className="font-heading text-3xl font-bold">ຍິນດີຕ້ອນຮັບກັບຄືນ</h1>
            <p className="text-muted-foreground">ເຂົ້າສູ່ລະບົບເພື່ອສືບຕໍ່ການຮຽນ</p>
          </div>

          <Tabs defaultValue="student" className="w-full" onValueChange={(v) => setActiveRole(v as UserRole)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="student">ນັກຮຽນ</TabsTrigger>
              <TabsTrigger value="teacher">ຜູ້ສອນ</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            {(["student", "teacher", "admin"] as UserRole[]).map((role) => (
              <TabsContent key={role} value={role}>
                {/* Demo hint */}
                <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-3 mb-4 mt-4">
                  <p className="text-xs text-muted-foreground mb-1">🎯 ທົດລອງເຂົ້າລະບົບ:</p>
                  <p className="text-sm font-medium text-secondary">{DEMO_CREDENTIALS[role].hint}</p>
                  <Button type="button" variant="outline" size="sm" className="mt-2 text-xs" onClick={fillDemo}>
                    ໃສ່ຂໍ້ມູນທົດລອງ
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`email-${role}`}>ອີເມວ</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`email-${role}`}
                        type="email"
                        placeholder={DEMO_CREDENTIALS[role].email}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`password-${role}`}>ລະຫັດຜ່ານ</Label>
                      <Link to="#" className="text-xs text-secondary hover:underline">ລືມລະຫັດຜ່ານ?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`password-${role}`}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    ເຂົ້າສູ່ລະບົບ
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>

          <p className="text-center text-sm text-muted-foreground">
            ຍັງບໍ່ມີບັນຊີ?{" "}
            <Link to="/register" className="text-secondary font-medium hover:underline">ລົງທະບຽນ</Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex hero-gradient items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-2xl bg-secondary/20 flex items-center justify-center">
              <GraduationCap className="h-12 w-12 text-secondary" />
            </div>
          </div>
          <h2 className="font-heading text-3xl font-bold text-primary-foreground">ຮຽນທຸກຢ່າງ ທຸກທີ່</h2>
          <p className="text-primary-foreground/70 leading-relaxed">ເຂົ້າເຖິງ 350+ ຄອສຮຽນຄຸນນະພາບສູງ ຈາກຜູ້ຊ່ຽວຊານ ພ້ອມໃບຢັ້ງຢືນ</p>
          <div className="flex justify-center gap-8 pt-4">
            {[
              { value: "12,500+", label: "ນັກຮຽນ" },
              { value: "350+", label: "ຄອສ" },
              { value: "98%", label: "ພໍໃຈ" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-heading text-2xl font-bold text-secondary">{s.value}</div>
                <div className="text-xs text-primary-foreground/60">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
