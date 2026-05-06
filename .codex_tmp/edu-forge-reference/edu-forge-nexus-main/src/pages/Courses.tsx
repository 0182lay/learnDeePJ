import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, GraduationCap, Filter, Sparkles, TrendingUp, BookOpen, ChevronLeft, ChevronRight, ArrowUpDown, Tag, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { courses, categories } from "@/data/mockData";

const levels = ["ທັງໝົດ", "ເລີ່ມຕົ້ນ", "ປານກາງ", "ຂັ້ນສູງ"];
const priceFilters = [
  { id: "all", label: "ທັງໝົດ" },
  { id: "free", label: "ຟຣີ" },
  { id: "paid", label: "ເສຍເງິນ" },
];
const sortOptions = [
  { id: "popular", label: "ຍອດນິຍົມ" },
  { id: "rating", label: "ຄະແນນສູງສຸດ" },
  { id: "newest", label: "ໃໝ່ລ່າສຸດ" },
  { id: "priceLow", label: "ລາຄາ: ຕໍ່າ → ສູງ" },
  { id: "priceHigh", label: "ລາຄາ: ສູງ → ຕໍ່າ" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState(searchParams.get("category") || "ທັງໝົດ");
  const [selectedLevel, setSelectedLevel] = useState("ທັງໝົດ");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync URL -> state when query changes (e.g. from Home)
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && cat !== selectedCat) setSelectedCat(cat);
  }, [searchParams]);

  // Sync state -> URL
  const updateCategory = (cat: string) => {
    setSelectedCat(cat);
    if (cat === "ທັງໝົດ") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const filtered = useMemo(() => {
    const list = courses.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === "ທັງໝົດ" || c.category === selectedCat;
      const matchLevel = selectedLevel === "ທັງໝົດ" || c.level === selectedLevel;
      const matchPrice =
        selectedPrice === "all" ||
        (selectedPrice === "free" && c.price === 0) ||
        (selectedPrice === "paid" && c.price > 0);
      return matchSearch && matchCat && matchLevel && matchPrice;
    });

    const sorted = [...list];
    switch (sortBy) {
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        sorted.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      case "priceLow":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        sorted.sort((a, b) => b.price - a.price);
        break;
      default:
        sorted.sort((a, b) => b.students - a.students);
    }
    return sorted;
  }, [search, selectedCat, selectedLevel, selectedPrice, sortBy]);

  const activeFilterCount =
    (selectedCat !== "ທັງໝົດ" ? 1 : 0) +
    (selectedLevel !== "ທັງໝົດ" ? 1 : 0) +
    (selectedPrice !== "all" ? 1 : 0) +
    (search ? 1 : 0);

  const clearAll = () => {
    updateCategory("ທັງໝົດ");
    setSelectedLevel("ທັງໝົດ");
    setSelectedPrice("all");
    setSearch("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="container py-12 md:py-16 relative z-10">
          <motion.div
            className="max-w-2xl mx-auto text-center space-y-4"
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} custom={0} className="flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-1.5 text-sm text-secondary">
                <Sparkles className="h-4 w-4" />
                ຄົ້ນພົບ 350+ ຄອສຮຽນ
              </div>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground"
            >
              ຄົ້ນຫາຄອສຮຽນ
              <span className="text-gradient"> ທີ່ເໝາະກັບທ່ານ</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-primary-foreground/70 text-lg">
              ພັດທະນາທັກສະ ສ້າງອະນາຄົດ ກັບຜູ້ຊ່ຽວຊານໃນທຸກສາຂາ
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/40" />
              <Input
                placeholder="ຄົ້ນຫາຄອສຮຽນ, ຫົວຂໍ້, ຫຼື ຜູ້ສອນ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 text-base bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 rounded-xl"
              />
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(40_80%_55%/0.12),transparent_60%)]" />
      </section>

      {/* Quick Stats */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-secondary" />
              <span><strong className="text-foreground">{filtered.length}</strong> ຄອສທີ່ພົບ</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4 text-accent" />
              <span><strong className="text-foreground">12,500+</strong> ນັກຮຽນ</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4 text-secondary" />
              <span><strong className="text-foreground">120+</strong> ຜູ້ສອນ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar Filters - Sticky & Collapsible */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`shrink-0 w-full lg:sticky lg:top-20 transition-[width] duration-300 ${
              sidebarCollapsed ? "lg:w-14" : "lg:w-72"
            }`}
          >
            <div className="rounded-2xl border bg-card card-shadow overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                {!sidebarCollapsed && (
                  <h3 className="font-heading font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4 text-secondary" /> ຕົວກອງ
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </h3>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:inline-flex h-8 w-8 ml-auto"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  aria-label={sidebarCollapsed ? "ຂະຫຍາຍຕົວກອງ" : "ພັບເກັບຕົວກອງ"}
                >
                  {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              </div>

              {/* Collapsed mini view */}
              {sidebarCollapsed && (
                <div className="hidden lg:flex flex-col items-center gap-2 p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setSidebarCollapsed(false)}
                    title="ໝວດໝູ່"
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setSidebarCollapsed(false)}
                    title="ລະດັບ"
                  >
                    <GraduationCap className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setSidebarCollapsed(false)}
                    title="ລາຄາ"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Expanded content */}
              <AnimatePresence initial={false}>
                {!sidebarCollapsed && (
                  <motion.div
                    key="filters"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scroll">
                      {/* Categories */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Tag className="h-3 w-3" /> ໝວດໝູ່
                        </h4>
                        <div className="space-y-1">
                          {["ທັງໝົດ", ...categories.map((c) => c.name)].map((cat) => {
                            const catData = categories.find((c) => c.name === cat);
                            const isActive = selectedCat === cat;
                            return (
                              <button
                                key={cat}
                                onClick={() => updateCategory(cat)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                                  isActive
                                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                              >
                                <span>{catData?.icon || "📋"}</span>
                                <span className="flex-1 text-left truncate">{cat}</span>
                                {catData && (
                                  <span
                                    className={`text-xs ${
                                      isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                                    }`}
                                  >
                                    {catData.count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Levels */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <GraduationCap className="h-3 w-3" /> ລະດັບ
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {levels.map((l) => (
                            <Badge
                              key={l}
                              variant={selectedLevel === l ? "secondary" : "outline"}
                              className="cursor-pointer transition-all hover:scale-105"
                              onClick={() => setSelectedLevel(l)}
                            >
                              {l}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Star className="h-3 w-3" /> ລາຄາ
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {priceFilters.map((p) => (
                            <Badge
                              key={p.id}
                              variant={selectedPrice === p.id ? "default" : "outline"}
                              className="cursor-pointer transition-all hover:scale-105"
                              onClick={() => setSelectedPrice(p.id)}
                            >
                              {p.label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Clear */}
                      {activeFilterCount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                          onClick={clearAll}
                        >
                          ລ້າງຕົວກອງທັງໝົດ ({activeFilterCount})
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>

          {/* Course Grid */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Toolbar: Active filters + Sort */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap min-h-9">
                {activeFilterCount > 0 ? (
                  <>
                    <span className="text-sm text-muted-foreground">ກຳລັງກອງ:</span>
                    {selectedCat !== "ທັງໝົດ" && (
                      <Badge variant="default" className="gap-1">
                        {selectedCat}
                        <button onClick={() => updateCategory("ທັງໝົດ")} className="ml-1 hover:opacity-70">×</button>
                      </Badge>
                    )}
                    {selectedLevel !== "ທັງໝົດ" && (
                      <Badge variant="secondary" className="gap-1">
                        {selectedLevel}
                        <button onClick={() => setSelectedLevel("ທັງໝົດ")} className="ml-1 hover:opacity-70">×</button>
                      </Badge>
                    )}
                    {selectedPrice !== "all" && (
                      <Badge variant="outline" className="gap-1">
                        {priceFilters.find((p) => p.id === selectedPrice)?.label}
                        <button onClick={() => setSelectedPrice("all")} className="ml-1 hover:opacity-70">×</button>
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    ສະແດງ <strong className="text-foreground">{filtered.length}</strong> ຄອສ
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              className={`grid gap-6 ${
                sidebarCollapsed
                  ? "sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
                  : "sm:grid-cols-2 xl:grid-cols-3"
              }`}
            >
              {filtered.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                >
                  <CourseCard {...course} />
                </motion.div>
              ))}
            </div>

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 space-y-4"
              >
                <div className="text-6xl">🔍</div>
                <h3 className="font-heading text-xl font-semibold">ບໍ່ພົບຄອສຮຽນ</h3>
                <p className="text-muted-foreground">ລອງປ່ຽນເງື່ອນໄຂການຄົ້ນຫາ ຫຼື ລ້າງຕົວກອງ</p>
                <Button variant="outline" onClick={clearAll}>
                  ລ້າງຕົວກອງທັງໝົດ
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Courses;
