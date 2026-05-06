import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "student" | "teacher" | "admin";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
}

const MOCK_USERS: MockUser[] = [
  { id: "s1", name: "ສົມພອນ ແກ້ວມະນີ", email: "student@learnlao.com", role: "student", initials: "ສພ" },
  { id: "t1", name: "ອ. ສົມໃຈ ວິໄລ", email: "teacher@learnlao.com", role: "teacher", initials: "ສຈ" },
  { id: "a1", name: "Admin ລະບົບ", email: "admin@learnlao.com", role: "admin", initials: "AD" },
];

export interface EnrollmentRecord {
  courseId: string;
  enrolledAt: string;
  paid: number;
  paymentMethod: string;
  progress: number;        // 0-100
  completedLessons: string[];
  quizScores: Record<string, number>; // lessonId -> score
  completed: boolean;
  certificateIssued: boolean;
  review?: { rating: number; comment: string };
}

interface AuthContextType {
  user: MockUser | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  enrollments: EnrollmentRecord[];
  enrollCourse: (courseId: string, price: number, method: string) => void;
  isEnrolled: (courseId: string) => boolean;
  getEnrollment: (courseId: string) => EnrollmentRecord | undefined;
  completeLesson: (courseId: string, lessonId: string) => void;
  submitQuizScore: (courseId: string, lessonId: string, score: number) => void;
  completeCourse: (courseId: string) => void;
  submitReview: (courseId: string, rating: number, comment: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(() => {
    const saved = localStorage.getItem("learnlao_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>(() => {
    const saved = localStorage.getItem("learnlao_enrollments");
    return saved ? JSON.parse(saved) : [];
  });

  const saveEnrollments = (e: EnrollmentRecord[]) => {
    setEnrollments(e);
    localStorage.setItem("learnlao_enrollments", JSON.stringify(e));
  };

  const login = (email: string, _password: string, role: UserRole): boolean => {
    const mockUser = MOCK_USERS.find((u) => u.role === role);
    if (mockUser) {
      const loggedIn = { ...mockUser, email };
      setUser(loggedIn);
      localStorage.setItem("learnlao_user", JSON.stringify(loggedIn));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("learnlao_user");
  };

  const enrollCourse = (courseId: string, price: number, method: string) => {
    if (enrollments.find((e) => e.courseId === courseId)) return;
    const record: EnrollmentRecord = {
      courseId,
      enrolledAt: new Date().toISOString(),
      paid: price,
      paymentMethod: method,
      progress: 0,
      completedLessons: [],
      quizScores: {},
      completed: false,
      certificateIssued: false,
    };
    saveEnrollments([...enrollments, record]);
  };

  const isEnrolled = (courseId: string) => enrollments.some((e) => e.courseId === courseId);

  const getEnrollment = (courseId: string) => enrollments.find((e) => e.courseId === courseId);

  const completeLesson = (courseId: string, lessonId: string) => {
    saveEnrollments(
      enrollments.map((e) =>
        e.courseId === courseId && !e.completedLessons.includes(lessonId)
          ? { ...e, completedLessons: [...e.completedLessons, lessonId] }
          : e
      )
    );
  };

  const submitQuizScore = (courseId: string, lessonId: string, score: number) => {
    saveEnrollments(
      enrollments.map((e) =>
        e.courseId === courseId
          ? { ...e, quizScores: { ...e.quizScores, [lessonId]: score } }
          : e
      )
    );
  };

  const completeCourse = (courseId: string) => {
    saveEnrollments(
      enrollments.map((e) =>
        e.courseId === courseId ? { ...e, completed: true, certificateIssued: true, progress: 100 } : e
      )
    );
  };

  const submitReview = (courseId: string, rating: number, comment: string) => {
    saveEnrollments(
      enrollments.map((e) =>
        e.courseId === courseId ? { ...e, review: { rating, comment } } : e
      )
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user, login, logout, isAuthenticated: !!user,
        enrollments, enrollCourse, isEnrolled, getEnrollment,
        completeLesson, submitQuizScore, completeCourse, submitReview,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
