import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, Upload, Save, GripVertical, Video, FileText,
  HelpCircle, Image, CheckCircle, Film, Clock, FileUp, X, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { categories } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LessonFile {
  name: string;
  size: string;
  type: string;
  progress: number;
  status: "uploading" | "complete" | "error";
}

interface Lesson {
  id: string;
  title: string;
  type: "video" | "document" | "quiz";
  duration: string;
  isFree: boolean;
  file: LessonFile | null;
  description: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const CreateCourse = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [courseInfo, setCourseInfo] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    price: "",
    thumbnail: null as File | null,
    thumbnailPreview: "",
  });
  const [lessons, setLessons] = useState<Lesson[]>([
    { id: "1", title: "", type: "video", duration: "", isFree: false, file: null, description: "" },
  ]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { id: "1", question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const thumbnailRef = useRef<HTMLInputElement | null>(null);

  const isAdmin = user?.role === "admin";
  const backLink = isAdmin ? "/dashboard/admin" : "/dashboard/teacher";
  const backLabel = isAdmin ? "ກັບຄືນ Admin Dashboard" : "ກັບຄືນ Dashboard";

  // Simulate file upload with progress
  const simulateUpload = (lessonId: string, file: File) => {
    const fileInfo: LessonFile = {
      name: file.name,
      size: file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`,
      type: file.type.startsWith("video") ? "video" : "document",
      progress: 0,
      status: "uploading",
    };

    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, file: fileInfo } : l))
    );

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setLessons((prev) =>
          prev.map((l) =>
            l.id === lessonId
              ? { ...l, file: { ...fileInfo, progress: 100, status: "complete" } }
              : l
          )
        );
        toast({ title: "ອັບໂຫຼດສຳເລັດ!", description: file.name });
      } else {
        setLessons((prev) =>
          prev.map((l) =>
            l.id === lessonId
              ? { ...l, file: { ...fileInfo, progress: Math.min(progress, 99), status: "uploading" } }
              : l
          )
        );
      }
    }, 500);
  };

  const handleFileSelect = (lessonId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson?.type === "video") {
      const validTypes = ["video/mp4", "video/webm", "video/quicktime"];
      if (!validTypes.includes(file.type)) {
        toast({ title: "ໄຟລ໌ບໍ່ຖືກຕ້ອງ", description: "ກະລຸນາເລືອກໄຟລ໌ວິດີໂອ (MP4, WebM, MOV)", variant: "destructive" });
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        toast({ title: "ໄຟລ໌ໃຫຍ່ເກີນ", description: "ຂະໜາດສູງສຸດ 500MB", variant: "destructive" });
        return;
      }
    }

    simulateUpload(lessonId, file);
  };

  const removeFile = (lessonId: string) => {
    setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, file: null } : l)));
  };

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCourseInfo({
        ...courseInfo,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file),
      });
    }
  };

  const addLesson = () => {
    setLessons([...lessons, { id: Date.now().toString(), title: "", type: "video", duration: "", isFree: false, file: null, description: "" }]);
  };

  const removeLesson = (id: string) => {
    if (lessons.length > 1) setLessons(lessons.filter((l) => l.id !== id));
  };

  const updateLesson = (id: string, field: keyof Lesson, value: string | boolean) => {
    setLessons(lessons.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const addQuestion = () => {
    setQuizQuestions([...quizQuestions, { id: Date.now().toString(), question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const removeQuestion = (id: string) => {
    if (quizQuestions.length > 1) setQuizQuestions(quizQuestions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: string | number) => {
    setQuizQuestions(quizQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const updateOption = (qId: string, index: number, value: string) => {
    setQuizQuestions(quizQuestions.map((q) => {
      if (q.id === qId) {
        const options = [...q.options];
        options[index] = value;
        return { ...q, options };
      }
      return q;
    }));
  };

  const getAcceptTypes = (type: string) => {
    if (type === "video") return "video/mp4,video/webm,video/quicktime";
    return ".pdf,.docx,.pptx,.doc,.ppt";
  };

  const completedLessons = lessons.filter((l) => l.file?.status === "complete").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8 flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <Link to={backLink} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> {backLabel}
            </Link>
            <h1 className="font-heading text-2xl font-bold">
              {isAdmin ? "🛡️ ສ້າງຄອສໃໝ່ (Admin)" : "ສ້າງຄອສໃໝ່"}
            </h1>
            {isAdmin && (
              <p className="text-sm text-muted-foreground">
                ໃນຖານະ Admin ທ່ານສາມາດສ້າງ, ແກ້ໄຂ ແລະ ຈັດການທຸກຄອສໃນລະບົບ
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline">ບັນທຶກແບບຮ່າງ</Button>
            <Button><Save className="h-4 w-4 mr-1" /> ເຜີຍແຜ່ຄອສ</Button>
          </div>
        </div>

        {/* Progress overview */}
        <div className="rounded-xl bg-card card-shadow p-4 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${courseInfo.title ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
              {courseInfo.title ? <CheckCircle className="h-4 w-4" /> : "1"}
            </div>
            <span className="text-sm">ຂໍ້ມູນຄອສ</span>
          </div>
          <div className="h-px flex-1 bg-border max-w-12" />
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${completedLessons > 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
              {completedLessons > 0 ? <CheckCircle className="h-4 w-4" /> : "2"}
            </div>
            <span className="text-sm">ບົດຮຽນ ({completedLessons}/{lessons.length})</span>
          </div>
          <div className="h-px flex-1 bg-border max-w-12" />
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${quizQuestions[0]?.question ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
              {quizQuestions[0]?.question ? <CheckCircle className="h-4 w-4" /> : "3"}
            </div>
            <span className="text-sm">ແບບທົດສອບ</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info">ຂໍ້ມູນຄອສ</TabsTrigger>
            <TabsTrigger value="lessons">ບົດຮຽນ & ວິດີໂອ</TabsTrigger>
            <TabsTrigger value="quiz">ແບບທົດສອບ</TabsTrigger>
          </TabsList>

          {/* Course Info */}
          <TabsContent value="info" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-2 space-y-5 rounded-xl bg-card card-shadow p-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">ຊື່ຄອສ</Label>
                  <Input
                    placeholder="ເຊັ່ນ: ພື້ນຖານ React.js ສຳລັບຜູ້ເລີ່ມຕົ້ນ"
                    value={courseInfo.title}
                    onChange={(e) => setCourseInfo({ ...courseInfo, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">ລາຍລະອຽດ</Label>
                  <Textarea
                    placeholder="ອະທິບາຍກ່ຽວກັບຄອສຂອງທ່ານ..."
                    value={courseInfo.description}
                    onChange={(e) => setCourseInfo({ ...courseInfo, description: e.target.value })}
                    rows={5}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">ໝວດໝູ່</Label>
                    <Select onValueChange={(v) => setCourseInfo({ ...courseInfo, category: v })}>
                      <SelectTrigger><SelectValue placeholder="ເລືອກໝວດໝູ່" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.name}>{c.icon} {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">ລະດັບ</Label>
                    <Select onValueChange={(v) => setCourseInfo({ ...courseInfo, level: v })}>
                      <SelectTrigger><SelectValue placeholder="ເລືອກລະດັບ" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">ເລີ່ມຕົ້ນ</SelectItem>
                        <SelectItem value="intermediate">ປານກາງ</SelectItem>
                        <SelectItem value="advanced">ຂັ້ນສູງ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">ລາຄາ (₭)</Label>
                  <Input
                    type="number"
                    placeholder="0 = ຟຣີ"
                    value={courseInfo.price}
                    onChange={(e) => setCourseInfo({ ...courseInfo, price: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">ໃສ່ 0 ສຳລັບຄອສຟຣີ</p>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="space-y-4">
                <div className="rounded-xl bg-card card-shadow p-6 space-y-4">
                  <Label className="text-sm font-medium">ຮູບປົກ</Label>
                  <input
                    ref={thumbnailRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnail}
                  />
                  <div
                    onClick={() => thumbnailRef.current?.click()}
                    className="aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/30 transition-colors overflow-hidden"
                  >
                    {courseInfo.thumbnailPreview ? (
                      <img src={courseInfo.thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Image className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">ຄລິກເພື່ອອັບໂຫຼດ</span>
                        <span className="text-xs text-muted-foreground">PNG, JPG (16:9)</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-secondary/10 p-4 space-y-2">
                  <h3 className="font-heading font-semibold text-sm">💡 ຄຳແນະນຳ</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• ໃຊ້ຊື່ຄອສທີ່ຊັດເຈນ ແລະ ດຶງດູດ</li>
                    <li>• ຂຽນລາຍລະອຽດຢ່າງລະອຽດ</li>
                    <li>• ເລືອກຮູບປົກທີ່ມີຄຸນນະພາບ</li>
                    <li>• ກຳນົດລາຄາທີ່ເໝາະສົມ</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Lessons & Video Upload */}
          <TabsContent value="lessons" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Upload guidelines */}
              <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-4 space-y-2">
                <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
                  <Film className="h-4 w-4 text-secondary" /> ຄູ່ມືອັບໂຫຼດວິດີໂອ
                </h3>
                <div className="grid sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Video className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                    <div><span className="font-medium text-foreground">ຟໍແມັດ:</span> MP4, WebM, MOV</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileUp className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                    <div><span className="font-medium text-foreground">ຂະໜາດ:</span> ສູງສຸດ 500MB ຕໍ່ໄຟລ໌</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                    <div><span className="font-medium text-foreground">ແນະນຳ:</span> 5-20 ນາທີ ຕໍ່ບົດຮຽນ</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">{lessons.length} ບົດຮຽນ</p>
                  <Badge variant="secondary" className="text-xs">
                    {completedLessons} ອັບໂຫຼດແລ້ວ
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={addLesson}>
                  <Plus className="h-4 w-4 mr-1" /> ເພີ່ມບົດຮຽນ
                </Button>
              </div>

              {lessons.map((lesson, i) => (
                <div key={lesson.id} className="rounded-xl bg-card card-shadow overflow-hidden">
                  {/* Lesson header */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                      <Badge variant="outline" className="text-xs shrink-0">ບົດທີ {i + 1}</Badge>
                      <div className="flex-1 grid sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <Input
                            placeholder="ຊື່ບົດຮຽນ"
                            value={lesson.title}
                            onChange={(e) => updateLesson(lesson.id, "title", e.target.value)}
                          />
                        </div>
                        <Select
                          value={lesson.type}
                          onValueChange={(v) => updateLesson(lesson.id, "type", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">🎬 ວິດີໂອ</SelectItem>
                            <SelectItem value="document">📄 ເອກະສານ</SelectItem>
                            <SelectItem value="quiz">❓ ແບບທົດສອບ</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="ເຊັ່ນ: 15:30"
                          value={lesson.duration}
                          onChange={(e) => updateLesson(lesson.id, "duration", e.target.value)}
                        />
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeLesson(lesson.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Description */}
                    <div className="pl-10">
                      <Input
                        placeholder="ລາຍລະອຽດບົດຮຽນ (ທາງເລືອກ)"
                        value={lesson.description}
                        onChange={(e) => updateLesson(lesson.id, "description", e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    {/* Free toggle */}
                    <div className="flex items-center justify-between pl-10">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={lesson.isFree}
                          onCheckedChange={(v) => updateLesson(lesson.id, "isFree", v)}
                        />
                        <span className="text-xs text-muted-foreground">ເປີດໃຫ້ເບິ່ງຟຣີ (ຕົວຢ່າງ)</span>
                      </div>
                    </div>
                  </div>

                  {/* File upload area */}
                  {lesson.type !== "quiz" && (
                    <div className="border-t bg-muted/20 p-4">
                      <input
                        ref={(el) => { fileInputRefs.current[lesson.id] = el; }}
                        type="file"
                        accept={getAcceptTypes(lesson.type)}
                        className="hidden"
                        onChange={(e) => handleFileSelect(lesson.id, e)}
                      />

                      {lesson.file ? (
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${
                            lesson.file.status === "complete" ? "bg-accent/10" : "bg-primary/10"
                          }`}>
                            {lesson.file.type === "video" ? (
                              <Film className={`h-6 w-6 ${lesson.file.status === "complete" ? "text-accent" : "text-primary"}`} />
                            ) : (
                              <FileText className={`h-6 w-6 ${lesson.file.status === "complete" ? "text-accent" : "text-primary"}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{lesson.file.name}</span>
                              <span className="text-xs text-muted-foreground shrink-0">{lesson.file.size}</span>
                            </div>
                            {lesson.file.status === "uploading" ? (
                              <div className="space-y-1">
                                <Progress value={lesson.file.progress} className="h-2" />
                                <span className="text-xs text-muted-foreground">ກຳລັງອັບໂຫຼດ... {Math.round(lesson.file.progress)}%</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs text-accent">
                                <CheckCircle className="h-3 w-3" />
                                ອັບໂຫຼດສຳເລັດ
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {lesson.file.status === "complete" && lesson.file.type === "video" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFile(lesson.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRefs.current[lesson.id]?.click()}
                          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 hover:border-secondary/50 transition-all group"
                        >
                          <div className="flex flex-col items-center gap-2">
                            {lesson.type === "video" ? (
                              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                                <Video className="h-6 w-6 text-primary group-hover:text-secondary transition-colors" />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                                <FileText className="h-6 w-6 text-primary group-hover:text-secondary transition-colors" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {lesson.type === "video" ? "ອັບໂຫຼດວິດີໂອ" : "ອັບໂຫຼດເອກະສານ"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {lesson.type === "video"
                                  ? "ລາກ ແລະ ວາງ ຫຼື ຄລິກ — MP4, WebM, MOV (ສູງສຸດ 500MB)"
                                  : "ລາກ ແລະ ວາງ ຫຼື ຄລິກ — PDF, DOCX, PPTX"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Quiz */}
          <TabsContent value="quiz" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{quizQuestions.length} ຄຳຖາມ</p>
                <Button variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-1" /> ເພີ່ມຄຳຖາມ
                </Button>
              </div>

              {quizQuestions.map((q, qi) => (
                <div key={q.id} className="rounded-xl bg-card card-shadow p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">ຄຳຖາມ {qi + 1}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeQuestion(q.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="ພິມຄຳຖາມ..."
                    value={q.question}
                    onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
                    rows={2}
                  />
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">ຕົວເລືອກ (ເລືອກຄຳຕອບທີ່ຖືກ)</Label>
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuestion(q.id, "correctAnswer", oi)}
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            q.correctAnswer === oi
                              ? "border-accent bg-accent"
                              : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          {q.correctAnswer === oi && (
                            <div className="h-2 w-2 rounded-full bg-accent-foreground" />
                          )}
                        </button>
                        <Input
                          placeholder={`ຕົວເລືອກ ${String.fromCharCode(65 + oi)}`}
                          value={opt}
                          onChange={(e) => updateOption(q.id, oi, e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default CreateCourse;
