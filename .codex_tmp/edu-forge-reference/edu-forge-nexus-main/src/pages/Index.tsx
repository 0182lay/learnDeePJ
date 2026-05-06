import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { courses, categories, stats } from "@/data/mockData";
import heroImg from "@/assets/hero-illustration.png";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="container py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center relative z-10">
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={fadeUp}
              custom={0}
              className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground leading-tight"
            >
              ຮຽນທຸກຢ່າງ
              <br />
              <span className="text-gradient">ທຸກທີ່ ທຸກເວລາ</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-primary-foreground/80 text-lg max-w-md"
            >
              ເຂົ້າເຖິງຫຼາຍກວ່າ 350+ ຄອສຮຽນ ຈາກຜູ້ຊ່ຽວຊານ ພັດທະນາທັກສະຂອງທ່ານກັບ LearnLao
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/courses">ເລີ່ມຮຽນ <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button variant="heroOutline" size="lg">
                <Play className="mr-1 h-4 w-4" /> ເບິ່ງວິດີໂອ
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} custom={3} className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ຄົ້ນຫາຄອສຮຽນ..."
                className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden md:flex justify-center"
          >
            <img src={heroImg} alt="Online learning" className="max-w-md w-full drop-shadow-2xl" />
          </motion.div>
        </div>
        {/* Decorative */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(40_80%_55%/0.1),transparent_60%)]" />
      </section>

      {/* Stats */}
      <section className="border-b bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="text-center space-y-1"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-2xl">{s.icon}</span>
                <div className="font-heading text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold">ໝວດໝູ່ຄອສຮຽນ</h2>
              <p className="text-muted-foreground mt-1">ເລືອກຫົວຂໍ້ທີ່ທ່ານສົນໃຈ</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/courses?category=${encodeURIComponent(c.name)}`}
                  className="group flex items-center gap-3 rounded-xl bg-card card-shadow p-4 cursor-pointer hover:card-shadow-hover hover:-translate-y-0.5 transition-all"
                >
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <div className="font-medium text-sm group-hover:text-secondary transition-colors">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.count} ຄອສ</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-muted/30">
        <div className="container space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold">ຄອສຍອດນິຍົມ</h2>
              <p className="text-muted-foreground mt-1">ຄອສທີ່ຜູ້ຮຽນນິຍົມທີ່ສຸດ</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/courses">ເບິ່ງທັງໝົດ <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <CourseCard {...course} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div className="hero-gradient rounded-2xl p-8 md:p-12 text-center space-y-4">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground">
              ພ້ອມທີ່ຈະເລີ່ມສອນບໍ?
            </h2>
            <p className="text-primary-foreground/80 max-w-md mx-auto">
              ແບ່ງປັນຄວາມຮູ້ຂອງທ່ານ ແລະ ສ້າງລາຍໄດ້ໃຫ້ກັບ LearnLao
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/register">ສະໝັກເປັນຜູ້ສອນ <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
