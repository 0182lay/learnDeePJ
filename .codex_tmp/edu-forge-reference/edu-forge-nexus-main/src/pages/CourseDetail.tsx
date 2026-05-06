import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Star, Users, Clock, BookOpen, Play, FileText,
  HelpCircle, Lock, CheckCircle, Monitor, X, ChevronRight,
  Award, Download, Share2, Globe, Smartphone, Infinity as InfinityIcon,
  Target, Zap, TrendingUp, Heart, MessageCircle, ShieldCheck, Flame,
  Sparkles, GraduationCap, Trophy
} from "lucide-react";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentDialog from "@/components/PaymentDialog";
import QuizPlayer from "@/components/QuizPlayer";
import Certificate from "@/components/Certificate";
import { courses, courseLessons, reviews, quizQuestions } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const typeIcon = { video: Play, document: FileText, quiz: HelpCircle };
const typeLabel = { video: "ວິດີໂອ", document: "ເອກະສານ", quiz: "ແບບທົດສອບ" };

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const course = courses.find((c) => c.id === id) || courses[0];
  const {
    user, isAuthenticated, isEnrolled, enrollCourse, getEnrollment,
    completeLesson, submitQuizScore, completeCourse, submitReview,
  } = useAuth();

  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const enrolled = isEnrolled(course.id);
  const enrollment = getEnrollment(course.id);
  const currentLesson = courseLessons.find((l) => l.id === activeLesson);

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      toast({ title: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (course.price === 0) {
      enrollCourse(course.id, 0, "free");
      toast({ title: "ລົງທະບຽນສຳເລັດ!", description: "ທ່ານສາມາດເຂົ້າຮຽນໄດ້ແລ້ວ" });
    } else {
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = (method: string) => {
    enrollCourse(course.id, course.price, method);
    toast({ title: "ລົງທະບຽນສຳເລັດ!", description: "ທ່ານສາມາດເຂົ້າຮຽນທຸກບົດຮຽນໄດ້ແລ້ວ" });
  };

  const handleLessonClick = (lessonId: string, isFree: boolean) => {
    if (enrolled || isFree) {
      setActiveLesson(lessonId);
      if (enrolled) completeLesson(course.id, lessonId);
    }
  };

  const handleQuizComplete = (score: number) => {
    if (activeLesson) submitQuizScore(course.id, activeLesson, score);
    if (score >= 60 && enrollment) {
      const allLessons = courseLessons.filter((l) => l.type !== "quiz");
      const completedCount = enrollment.completedLessons.length;
      if (completedCount >= allLessons.length * 0.8) {
        completeCourse(course.id);
        toast({ title: "🎉 ຍິນດີດ້ວຍ!", description: "ທ່ານສຳເລັດຄອສນີ້ແລ້ວ! ສາມາດຮັບໃບຢັ້ງຢືນໄດ້" });
      }
    }
  };

  const handleReviewSubmit = () => {
    if (!reviewComment.trim()) return;
    submitReview(course.id, reviewRating, reviewComment);
    toast({ title: "ຂອບໃຈສຳລັບຣີວິວ!" });
    setReviewComment("");
  };

  const completedLessonsCount = enrollment?.completedLessons.length || 0;
  const progressPercent = enrolled ? Math.round((completedLessonsCount / courseLessons.length) * 100) : 0;

  // Show certificate
  if (showCertificate && enrollment?.certificateIssued) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-8 flex-1">
          <Certificate
            studentName={user?.name || "ນັກຮຽນ"}
            courseName={course.title}
            instructor={course.instructor}
            date={new Date().toLocaleDateString("lo-LA")}
            onClose={() => setShowCertificate(false)}
          />
        </div>
        <Footer />
      </div>
    );
  }

  // Show quiz
  if (showQuiz && activeLesson) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="bg-primary text-primary-foreground border-b border-primary-foreground/10">
          <div className="container flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost" size="sm"
                className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => { setShowQuiz(false); setActiveLesson(null); }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> ກັບຄືນ
              </Button>
              <span className="text-sm text-primary-foreground/60">ແບບທົດສອບ: {course.title}</span>
            </div>
          </div>
        </div>
        <div className="container py-8 flex-1">
          <QuizPlayer
            questions={quizQuestions}
            onComplete={handleQuizComplete}
            onClose={() => { setShowQuiz(false); setActiveLesson(null); }}
          />
        </div>
      </div>
    );
  }

  // Lesson viewer
  if (activeLesson && currentLesson) {
    const isQuiz = currentLesson.type === "quiz";
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="bg-primary text-primary-foreground border-b border-primary-foreground/10">
          <div className="container flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost" size="sm"
                className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setActiveLesson(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> ກັບຄືນ
              </Button>
              <div className="hidden sm:block h-5 w-px bg-primary-foreground/20" />
              <span className="hidden sm:block text-sm text-primary-foreground/60 truncate max-w-xs">{course.title}</span>
            </div>
            <Button
              variant="ghost" size="icon"
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setActiveLesson(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div className="relative bg-foreground/95 aspect-video max-h-[60vh] w-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mx-auto h-20 w-20 rounded-full bg-secondary/20 flex items-center justify-center"
                >
                  {currentLesson.type === "video" && <Play className="h-10 w-10 text-secondary fill-secondary" />}
                  {currentLesson.type === "document" && <FileText className="h-10 w-10 text-secondary" />}
                  {currentLesson.type === "quiz" && <HelpCircle className="h-10 w-10 text-secondary" />}
                </motion.div>
                <div>
                  <p className="text-primary-foreground/90 font-heading font-semibold text-lg">{currentLesson.title}</p>
                  <p className="text-primary-foreground/50 text-sm mt-1">
                    {currentLesson.type === "video" && "ກົດ Play ເພື່ອເລີ່ມເບິ່ງວິດີໂອ"}
                    {currentLesson.type === "document" && "ເອກະສານປະກອບການຮຽນ"}
                    {currentLesson.type === "quiz" && "ກົດເລີ່ມທົດສອບ"}
                  </p>
                </div>
                {isQuiz && enrolled && (
                  <Button onClick={() => setShowQuiz(true)} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    <HelpCircle className="h-4 w-4 mr-1" /> ເລີ່ມທົດສອບ
                  </Button>
                )}
                {currentLesson.type === "video" && (
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-primary-foreground/40 text-sm">
                      <Clock className="h-4 w-4" /> {currentLesson.duration}
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-foreground/10">
                <div className="h-full w-0 bg-secondary rounded-r" />
              </div>
            </div>

            <div className="border-b bg-card">
              <div className="container py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{typeLabel[currentLesson.type]}</Badge>
                    <span className="text-sm text-muted-foreground">{currentLesson.duration}</span>
                    {enrollment?.completedLessons.includes(currentLesson.id) && (
                      <Badge className="bg-accent/20 text-accent text-xs"><CheckCircle className="h-3 w-3 mr-1" /> ສຳເລັດ</Badge>
                    )}
                  </div>
                  <h2 className="font-heading font-semibold mt-1">{currentLesson.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> ດາວໂຫຼດ</Button>
                  <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-1" /> ແຊຣ</Button>
                </div>
              </div>
            </div>

            <div className="container py-6 flex-1">
              <div className="max-w-2xl space-y-4">
                <h3 className="font-heading font-semibold">ກ່ຽວກັບບົດຮຽນນີ້</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  ໃນບົດຮຽນນີ້ທ່ານຈະໄດ້ຮຽນຮູ້ເນື້ອຫາທີ່ສຳຄັນກ່ຽວກັບ {currentLesson.title}. 
                  ບົດຮຽນນີ້ໃຊ້ເວລາ {currentLesson.duration} ແລະ ມີແບບຝຶກຫັດປະກອບ.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 border-l bg-card overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-heading font-semibold text-sm">ລາຍການບົດຮຽນ</h3>
              <p className="text-xs text-muted-foreground mt-1">{courseLessons.length} ບົດຮຽນ • {course.duration}</p>
              {enrolled && (
                <div className="mt-2">
                  <Progress value={progressPercent} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">{progressPercent}% ສຳເລັດ</p>
                </div>
              )}
            </div>
            <div className="divide-y">
              {courseLessons.map((lesson, i) => {
                const Icon = typeIcon[lesson.type];
                const isActive = lesson.id === activeLesson;
                const isAccessible = enrolled || lesson.isFree;
                const isCompleted = enrollment?.completedLessons.includes(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => isAccessible && handleLessonClick(lesson.id, lesson.isFree)}
                    className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                      isActive ? "bg-secondary/10 border-l-2 border-secondary"
                        : isAccessible ? "hover:bg-muted/50 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{i + 1}</span>
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${
                      isCompleted ? "bg-accent text-accent-foreground"
                        : isActive ? "bg-secondary text-secondary-foreground" : "bg-muted"
                    }`}>
                      {isCompleted ? <CheckCircle className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium truncate ${isActive ? "text-secondary" : ""}`}>{lesson.title}</div>
                      <div className="text-[10px] text-muted-foreground">{lesson.duration}</div>
                    </div>
                    {!isAccessible && <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Course overview
  const learningOutcomes = [
    "ເຂົ້າໃຈພື້ນຖານ ແລະ ນຳໄປໃຊ້ຈິງໄດ້ທັນທີ",
    "ສ້າງໂປຣເຈັກຕົວຈິງໄດ້ດ້ວຍຕົນເອງ",
    "ແກ້ບັນຫາທີ່ພົບເຈິໃນວຽກປະຈຳວັນ",
    "ມີຄວາມໝັ້ນໃຈໃນທັກສະທີ່ຮຽນຮູ້",
    "ໄດ້ໃບຢັ້ງຢືນໄປໃຊ້ສະໝັກວຽກ",
    "ເຂົ້າຮ່ວມຊຸມຊົນຜູ້ຮຽນຫຼາຍກວ່າ 10,000 ຄົນ",
  ];
  const requirements = [
    "ມີຄອມພິວເຕີ ຫຼື ໂທລະສັບທີ່ເຊື່ອມຕໍ່ອິນເຕີເນັດ",
    "ບໍ່ຕ້ອງມີພື້ນຖານກໍ່ສາມາດຮຽນໄດ້",
    "ມີຄວາມຕັ້ງໃຈ ແລະ ເວລາຮຽນຢ່າງໜ້ອຍ 2-3 ຊມ/ອາທິດ",
  ];
  const faqs = [
    { q: "ຈະໄດ້ຮັບໃບຢັ້ງຢືນເມື່ອໃດ?", a: "ຫຼັງຈາກຮຽນຈົບທຸກບົດ ແລະ ຜ່ານແບບທົດສອບ 60% ຂຶ້ນໄປ ທ່ານສາມາດດາວໂຫຼດໃບຢັ້ງຢືນໄດ້ທັນທີ." },
    { q: "ສາມາດເຂົ້າເຖິງເນື້ອຫາໄດ້ດົນປານໃດ?", a: "ເມື່ອລົງທະບຽນແລ້ວ ທ່ານສາມາດເຂົ້າຮຽນໄດ້ຕະຫຼອດຊີວິດ ບໍ່ມີວັນໝົດອາຍຸ." },
    { q: "ຄືນເງິນໄດ້ບໍ່ຖ້າບໍ່ພໍໃຈ?", a: "ໄດ້! ພວກເຮົາມີນະໂຍບາຍຄືນເງິນ 100% ພາຍໃນ 30 ມື້ ໂດຍບໍ່ມີຄຳຖາມ." },
    { q: "ຮຽນຜ່ານມືຖືໄດ້ບໍ່?", a: "ໄດ້ ທຸກອຸປະກອນ — ຄອມພິວເຕີ, ແທັບເລັດ, ມືຖື ໂດຍບໍ່ຕ້ອງດາວໂຫຼດແອັບເພີ່ມ." },
  ];
  const includes = [
    { icon: Play, label: `ວິດີໂອ ${course.duration} on-demand` },
    { icon: FileText, label: "ເອກະສານປະກອບການຮຽນ" },
    { icon: Smartphone, label: "ເຂົ້າຮຽນຜ່ານມືຖື ແລະ ທີວີ" },
    { icon: InfinityIcon, label: "ເຂົ້າເຖິງຕະຫຼອດຊີວິດ" },
    { icon: Award, label: "ໃບຢັ້ງຢືນຫຼັງຈົບຄອສ" },
    { icon: MessageCircle, label: "ສະໜັບສະໜູນ Q&A ຈາກຜູ້ສອນ" },
  ];
  const relatedCourses = courses.filter((c) => c.category === course.category && c.id !== course.id).slice(0, 4);
  const discountPercent = course.price > 0 ? 40 : 0;
  const originalPrice = course.price > 0 ? Math.round(course.price / (1 - discountPercent / 100)) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero — split layout with floating card */}
      <div className="hero-gradient relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(40_80%_55%/0.15),transparent_60%)]" />

        <div className="container py-10 md:py-14 space-y-6 relative z-10">
          <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> ກັບຄືນຫາລາຍການຄອສ
          </Link>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Sparkles className="h-3 w-3 mr-1" /> {course.category}
                </Badge>
                <Badge variant="outline" className="text-primary-foreground/80 border-primary-foreground/30">{course.level}</Badge>
                {course.students > 1000 && (
                  <Badge className="bg-accent/20 text-accent border-accent/30 hover:bg-accent/30">
                    <Flame className="h-3 w-3 mr-1" /> Bestseller
                  </Badge>
                )}
              </div>

              <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">
                {course.title}
              </h1>
              <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl leading-relaxed">
                ຮຽນຮູ້ທັກສະໃໝ່ ຈາກພື້ນຖານຈົນເຖິງຂັ້ນສູງ ພ້ອມໂປຣເຈັກຕົວຈິງ ແບບຝຶກຫັດ ແລະ ໃບຢັ້ງຢືນທີ່ຍອມຮັບໃນວົງການ
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-primary-foreground/80">
                <span className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.round(course.rating) ? "fill-secondary text-secondary" : "text-primary-foreground/30"}`} />
                    ))}
                  </div>
                  <strong className="text-primary-foreground">{course.rating}</strong>
                  <span className="text-primary-foreground/60">({reviews.length} ຣີວິວ)</span>
                </span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {course.students.toLocaleString()} ນັກຮຽນ</span>
                <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> ພາສາລາວ</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> ອັບເດດລ່າສຸດ 2025</span>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 pt-2">
                <Avatar className="h-12 w-12 ring-2 ring-secondary/40">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-bold">
                    {course.instructor.charAt(3)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xs text-primary-foreground/50">ສ້າງໂດຍ</div>
                  <div className="text-sm font-medium text-primary-foreground">{course.instructor}</div>
                </div>
              </div>
            </motion.div>

            {/* Enrollment Card — sticky */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:row-span-2"
            >
              <div className="bg-card rounded-2xl card-shadow overflow-hidden lg:sticky lg:top-24 border border-border/50">
                <div className="relative group cursor-pointer">
                  <img src={course.thumbnail} alt={course.title} className="aspect-video object-cover w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center shadow-2xl"
                    >
                      <Play className="h-7 w-7 text-secondary-foreground fill-secondary-foreground ml-0.5" />
                    </motion.div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-primary-foreground text-xs">
                    <span className="bg-foreground/60 backdrop-blur px-2 py-1 rounded">ຕົວຢ່າງຄອສ</span>
                    <span className="bg-foreground/60 backdrop-blur px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 2:30
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Price */}
                  <div className="space-y-1">
                    {discountPercent > 0 && !enrolled && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">₭{originalPrice.toLocaleString()}</span>
                        <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">-{discountPercent}%</Badge>
                      </div>
                    )}
                    <div className="font-heading text-4xl font-bold text-secondary">
                      {course.price === 0 ? "ຟຣີ" : `₭${course.price.toLocaleString()}`}
                    </div>
                    {discountPercent > 0 && !enrolled && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <Flame className="h-3 w-3" /> ໂປຣໂມຊັ່ນສິ້ນສຸດໃນ 2 ມື້!
                      </p>
                    )}
                  </div>

                  {enrolled ? (
                    <div className="space-y-3">
                      <div className="rounded-lg bg-accent/10 border border-accent/20 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-accent" />
                          <span className="text-sm font-medium text-accent">ລົງທະບຽນແລ້ວ</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center mt-2">{progressPercent}% ສຳເລັດ</p>
                      </div>
                      <Button className="w-full" size="lg" onClick={() => {
                        const firstIncomplete = courseLessons.find((l) => !enrollment?.completedLessons.includes(l.id));
                        if (firstIncomplete) handleLessonClick(firstIncomplete.id, true);
                      }}>
                        <Play className="h-4 w-4 mr-1" /> {progressPercent > 0 ? "ຮຽນຕໍ່" : "ເລີ່ມຮຽນ"}
                      </Button>
                      {enrollment?.certificateIssued && (
                        <Button variant="outline" className="w-full" onClick={() => setShowCertificate(true)}>
                          <Award className="h-4 w-4 mr-1" /> ເບິ່ງໃບຢັ້ງຢືນ
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button className="w-full font-bold shadow-lg hover:shadow-xl transition-shadow" size="lg" onClick={handleEnrollClick}>
                        {course.price === 0 ? "ລົງທະບຽນຟຣີ" : "ຊື້ຄອສນີ້ດຽວນີ້"}
                      </Button>
                      <Button variant="outline" className="w-full" size="lg">
                        <Heart className="h-4 w-4 mr-1" /> ເພີ່ມໃນລາຍການມັກ
                      </Button>
                    </div>
                  )}

                  {!enrolled && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                      ຮັບປະກັນຄືນເງິນພາຍໃນ 30 ມື້
                    </div>
                  )}

                  <div className="space-y-3 border-t pt-4">
                    <p className="text-sm font-semibold">ຄອສນີ້ປະກອບດ້ວຍ:</p>
                    {includes.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <item.icon className="h-4 w-4 text-secondary shrink-0" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-4 border-t pt-4 text-xs text-muted-foreground">
                    <button className="hover:text-secondary flex items-center gap-1"><Share2 className="h-3.5 w-3.5" /> ແຊຣ</button>
                    <span>•</span>
                    <button className="hover:text-secondary flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> ມັກ</button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick stats cards (under title, beside floating card) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {[
                { icon: BookOpen, value: course.lessons, label: "ບົດຮຽນ" },
                { icon: Clock, value: course.duration, label: "ຄວາມຍາວ" },
                { icon: Users, value: course.students.toLocaleString(), label: "ນັກຮຽນ" },
                { icon: Trophy, value: "98%", label: "ຄວາມພໍໃຈ" },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl bg-primary-foreground/5 backdrop-blur border border-primary-foreground/10 p-4 hover:bg-primary-foreground/10 transition-colors">
                  <stat.icon className="h-5 w-5 text-secondary mb-2" />
                  <div className="font-heading font-bold text-primary-foreground text-lg">{stat.value}</div>
                  <div className="text-xs text-primary-foreground/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* What you'll learn */}
      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            {/* Learning Outcomes */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent p-6 md:p-8 space-y-5"
            >
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-secondary" />
                </div>
                <h2 className="font-heading text-2xl font-bold">ສິ່ງທີ່ທ່ານຈະໄດ້ຮຽນຮູ້</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {learningOutcomes.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Tabs: Lessons / Reviews / FAQ */}
            <Tabs defaultValue="lessons" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="lessons" className="gap-1.5"><BookOpen className="h-4 w-4" /> ບົດຮຽນ</TabsTrigger>
                <TabsTrigger value="requirements" className="gap-1.5"><Zap className="h-4 w-4" /> ສິ່ງທີ່ຕ້ອງມີ</TabsTrigger>
                <TabsTrigger value="reviews" className="gap-1.5"><Star className="h-4 w-4" /> ຣີວິວ</TabsTrigger>
                <TabsTrigger value="faq" className="gap-1.5"><HelpCircle className="h-4 w-4" /> FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="lessons" className="mt-6">
                {enrolled && (
                  <div className="mb-4 rounded-lg bg-accent/10 border border-accent/20 p-3 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">ທ່ານລົງທະບຽນແລ້ວ — ບົດຮຽນທັງໝົດເປີດໃຫ້ແລ້ວ!</p>
                      <Progress value={progressPercent} className="h-1.5 mt-1" />
                    </div>
                    <span className="text-sm font-bold text-accent">{progressPercent}%</span>
                  </div>
                )}
                <div className="rounded-xl border bg-card overflow-hidden divide-y">
                  {courseLessons.map((lesson, i) => {
                    const Icon = typeIcon[lesson.type];
                    const isAccessible = enrolled || lesson.isFree;
                    const isCompleted = enrollment?.completedLessons.includes(lesson.id);
                    return (
                      <motion.button
                        key={lesson.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => isAccessible && handleLessonClick(lesson.id, lesson.isFree)}
                        className={`w-full flex items-center gap-4 p-4 transition-all group ${
                          isAccessible ? "hover:bg-secondary/5 cursor-pointer" : "opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <span className="text-sm text-muted-foreground w-6 text-right font-mono">{String(i + 1).padStart(2, "0")}</span>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-colors ${
                          isCompleted ? "bg-accent text-accent-foreground"
                            : isAccessible ? "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium group-hover:text-secondary transition-colors">{lesson.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span>{typeLabel[lesson.type]}</span><span>•</span><span>{lesson.duration}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.isFree && !enrolled && <Badge variant="secondary" className="text-[10px]">ຟຣີ</Badge>}
                          {!isAccessible && <Lock className="h-4 w-4 text-muted-foreground" />}
                          {isAccessible && <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="requirements" className="mt-6 space-y-3">
                <div className="rounded-xl border bg-card p-6 space-y-3">
                  <h3 className="font-heading font-semibold mb-2">ກ່ອນເລີ່ມຮຽນ ທ່ານຄວນມີ:</h3>
                  {requirements.map((r, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                      <p className="text-sm">{r}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6 space-y-6">
                {/* Rating overview */}
                <div className="rounded-xl border bg-card p-6 grid sm:grid-cols-2 gap-6 items-center">
                  <div className="text-center space-y-1">
                    <div className="font-heading text-5xl font-bold text-secondary">{course.rating}</div>
                    <div className="flex items-center justify-center gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`h-5 w-5 ${s <= Math.round(course.rating) ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{reviews.length} ຣີວິວທັງໝົດ</p>
                  </div>
                  <div className="space-y-2">
                    {[5,4,3,2,1].map((r) => {
                      const pct = r === 5 ? 78 : r === 4 ? 15 : r === 3 ? 5 : r === 2 ? 1 : 1;
                      return (
                        <div key={r} className="flex items-center gap-2 text-xs">
                          <span className="w-3">{r}</span>
                          <Star className="h-3 w-3 fill-secondary text-secondary" />
                          <Progress value={pct} className="h-1.5 flex-1" />
                          <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {enrolled && (
                  <div className="rounded-xl bg-card border p-6 space-y-4">
                    <h3 className="font-heading font-semibold">ຂຽນຣີວິວຂອງທ່ານ</h3>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setReviewRating(s)}>
                          <Star className={`h-7 w-7 transition-transform hover:scale-110 ${s <= reviewRating ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="ແບ່ງປັນປະສົບການຂອງທ່ານ..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleReviewSubmit} disabled={!reviewComment.trim()}>ສົ່ງຣີວິວ</Button>
                  </div>
                )}

                <div className="space-y-4">
                  {enrollment?.review && (
                    <div className="rounded-xl bg-accent/5 border border-accent/20 p-5 space-y-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-accent text-accent-foreground text-xs">{user?.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{user?.name} <Badge variant="outline" className="text-[10px] ml-1">ທ່ານ</Badge></div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${s <= enrollment.review!.rating ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{enrollment.review.comment}</p>
                    </div>
                  )}
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-xl bg-card border p-5 space-y-2 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">{r.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{r.user}</div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
                            ))}
                            <span className="text-xs text-muted-foreground ml-2">{r.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="faq" className="mt-6 space-y-3">
                {faqs.map((f, i) => (
                  <details key={i} className="group rounded-xl border bg-card p-5 cursor-pointer hover:border-secondary/40 transition-colors">
                    <summary className="flex items-center justify-between font-medium text-sm list-none">
                      <span className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-secondary" />
                        {f.q}
                      </span>
                      <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="mt-3 pl-6 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </TabsContent>
            </Tabs>

            {/* Instructor section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border bg-card p-6 md:p-8 space-y-5"
            >
              <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-secondary" /> ຮູ້ຈັກກັບຜູ້ສອນ
              </h2>
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <Avatar className="h-24 w-24 ring-4 ring-secondary/20">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl font-bold">
                    {course.instructor.charAt(3)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-heading font-bold text-lg">{course.instructor}</h3>
                    <p className="text-sm text-muted-foreground">ຜູ້ຊ່ຽວຊານດ້ານ {course.category} • ປະສົບການ 5+ ປີ</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 font-heading font-bold text-secondary">
                        <Star className="h-4 w-4 fill-secondary" /> 4.8
                      </div>
                      <div className="text-xs text-muted-foreground">ຄະແນນ</div>
                    </div>
                    <div>
                      <div className="font-heading font-bold text-secondary">12,500+</div>
                      <div className="text-xs text-muted-foreground">ນັກຮຽນ</div>
                    </div>
                    <div>
                      <div className="font-heading font-bold text-secondary">8</div>
                      <div className="text-xs text-muted-foreground">ຄອສ</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    ຜູ້ສອນທີ່ມີປະສົບການກວ່າ 5 ປີໃນສາຍງານ ໄດ້ສອນແລະແບ່ງປັນຄວາມຮູ້ໃຫ້ກັບນັກຮຽນຫຼາຍກວ່າ 12,500 ຄົນ. 
                    ຫຼົງໄຫຼໃນການຖ່າຍທອດຄວາມຮູ້ ແລະ ການສ້າງເນື້ອຫາທີ່ເຂົ້າໃຈງ່າຍ.
                  </p>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Right rail empty for sticky card placement */}
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* Related courses */}
      {relatedCourses.length > 0 && (
        <div className="bg-muted/30 border-t">
          <div className="container py-12 space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-secondary" /> ຄອສທີ່ກ່ຽວຂ້ອງ
                </h2>
                <p className="text-sm text-muted-foreground mt-1">ຄອສອື່ນໆໃນໝວດ {course.category}</p>
              </div>
              <Link to={`/courses?category=${encodeURIComponent(course.category)}`} className="text-sm text-secondary hover:underline flex items-center gap-1">
                ເບິ່ງທັງໝົດ <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedCourses.map((c) => <CourseCard key={c.id} {...c} />)}
            </div>
          </div>
        </div>
      )}

      <Footer />

      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        courseTitle={course.title}
        price={course.price}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CourseDetail;
