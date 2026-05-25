# API Endpoints Summary

Base URL:

```text
http://localhost:3003/api
```

Protected endpoints require this header:

```http
Authorization: Bearer <token>
```

## Authentication

| Endpoint | Method | Description | Body |
| --- | --- | --- | --- |
| `/api/register` | POST | Register a new user | `{ "email": "student@example.com", "password": "1234", "first_name": "John", "last_name": "Doe" }` |
| `/api/login` | POST | Login and receive token | `{ "email": "student@example.com", "password": "1234" }` |

## Current User

| Endpoint | Method | Description | Auth | Body |
| --- | --- | --- | --- | --- |
| `/api/me` | GET | Get current user profile | User | None |
| `/api/me/profile` | PATCH | Update current user profile | User | `{ "first_name": "John", "last_name": "Doe", "bio": "Hello" }` |
| `/api/me/instructor-request` | POST | Request instructor role | User | None |
| `/api/me/avatar/upload` | POST | Upload profile avatar | User | `multipart/form-data` field: `file` |

## User Management

| Endpoint | Method | Description | Auth | Body |
| --- | --- | --- | --- | --- |
| `/api/users` | GET | Get all users | Admin | None |
| `/api/users/:userId` | GET | Get user by ID | Admin | None |
| `/api/users/:userId` | PUT | Update user | Admin | `{ "first_name": "Jane", "last_name": "Doe", "role": "student", "is_active": true }` |
| `/api/users/:userId` | DELETE | Delete user | Admin | None |

## Categories

| Endpoint | Method | Description | Auth | Body |
| --- | --- | --- | --- | --- |
| `/api/category` | GET | Get all categories | Public | None |
| `/api/category/:categoryId` | GET | Get category by ID | Public | None |
| `/api/category` | POST | Create category | Instructor/Admin | `{ "name": "Programming", "description": "Coding courses", "icon": "code" }` |
| `/api/category/:categoryId` | PUT | Update category | Instructor/Admin | `{ "name": "Web Development", "description": "Frontend and backend", "icon": "globe" }` |
| `/api/category/:categoryId` | DELETE | Delete category | Instructor/Admin | None |

## Courses

| Endpoint | Method | Description | Auth | Body |
| --- | --- | --- | --- | --- |
| `/api/courses` | GET | Get all courses | Public | None |
| `/api/my-courses` | GET | Get courses owned by current instructor | Instructor/Admin | None |
| `/api/courses/:courseId` | GET | Get course detail by ID | User | None |
| `/api/courses` | POST | Create course | Instructor/Admin | `{ "category_id": "1", "title": "Vue Basics", "description": "Learn Vue", "price": "990", "thumbnail_url": "/uploads/course.jpg", "level": "beginner", "is_published": true }` |
| `/api/courses/cover/upload` | POST | Upload course cover image | Instructor/Admin | `multipart/form-data` field: `file` |
| `/api/courses/:courseId` | PATCH | Update course | Instructor/Admin | `{ "title": "Vue Advanced", "price": "1290", "is_published": true }` |
| `/api/courses/:courseId` | DELETE | Delete course | Instructor/Admin | None |

## Lessons

| Endpoint | Method | Description | Auth | Body |
| --- | --- | --- | --- | --- |
| `/api/courses/:courseId/lessons` | GET | Get lessons in a course | User | None |
| `/api/courses/:courseId/lessons/:lessonId` | GET | Get lesson by ID | User | None |
| `/api/courses/:courseId/lessons` | POST | Create lesson | Instructor/Admin | `{ "title": "Introduction", "lesson_type": "video", "content": "Lesson content", "description": "Overview", "order_index": 1, "is_free_preview": true }` |
| `/api/courses/:courseId/lessons/:lessonId` | PATCH | Update lesson | Instructor/Admin | `{ "title": "Updated lesson", "order_index": 2 }` |
| `/api/courses/:courseId/lessons/:lessonId` | DELETE | Delete lesson | Instructor/Admin | None |

## Lesson Files

| Endpoint | Method | Description | Auth | Body |
| --- | --- | --- | --- | --- |
| `/api/lessons/:lessonId/files` | GET | Get lesson files | User | None |
| `/api/lessons/:lessonId/files` | POST | Create lesson file record | Instructor/Admin | `{ "file_url": "/uploads/file.pdf", "file_type": "document", "original_name": "slide.pdf" }` |
| `/api/lessons/:lessonId/files/upload` | POST | Upload lesson file | Instructor/Admin | `multipart/form-data` fields: `file`, optional `duration_seconds` |
| `/api/lessons/:lessonId/files/:fileId` | DELETE | Delete lesson file | Instructor/Admin | None |

## Enrollments

| Endpoint | Method | Description | Auth | Body |
| --- | --- | --- | --- | --- |
| `/api/enrollments` | GET | Get current user's enrollments | User | None |
| `/api/enrollments` | POST | Enroll in a course | User | `{ "course_id": "1" }` |
| `/api/enrollments/:enrollmentId` | DELETE | Cancel enrollment | User | None |

## Learning Progress

| Endpoint | Method | Description | Auth | Body |
| --- | --- | --- | --- | --- |
| `/api/enrollments/:enrollmentId/progress` | GET | Get learning progress | User | None |
| `/api/enrollments/:enrollmentId/progress/:lessonId` | PATCH | Update lesson progress | User | `{ "is_completed": true, "watch_duration_seconds": 120 }` |

## Payments

| Endpoint | Method | Description | Auth | Body |
| --- | --- | --- | --- | --- |
| `/api/payments` | GET | Get current user's payments | User | None |
| `/api/payments/:paymentId` | GET | Get payment by ID | User | None |
| `/api/payments` | POST | Create payment | User | `{ "course_id": "1", "payment_method": "bank_transfer" }` |
| `/api/payments/:paymentId/slip` | POST | Upload payment slip | User | `multipart/form-data` field: `slip` |
| `/api/payments/:paymentId/status` | PATCH | Update payment status | Admin | `{ "status": "approved" }` |
| `/api/payments/:paymentId` | DELETE | Delete payment | Admin | None |

## Quizzes

| Endpoint | Method | Description | Auth | Body |
| --- | --- | --- | --- | --- |
| `/api/lessons/:lessonId/quiz` | GET | Get quiz for lesson | User | None |
| `/api/lessons/:lessonId/quiz` | POST | Create quiz | Instructor/Admin | `{ "title": "Quiz 1", "description": "Basic check", "questions": [{ "question_text": "Vue is a frontend framework?", "question_type": "true_false", "options": ["true", "false"], "correct_answer": "true", "order_index": 1 }] }` |
| `/api/lessons/:lessonId/quiz` | PATCH | Update quiz | Instructor/Admin | `{ "title": "Updated Quiz", "questions": [] }` |
| `/api/lessons/:lessonId/quiz` | DELETE | Delete quiz | Instructor/Admin | None |
| `/api/lessons/:lessonId/quiz/submit` | POST | Submit quiz answers | User | `{ "answers": [{ "question_id": "1", "answer": "true" }] }` |
| `/api/lessons/:lessonId/quiz/result` | GET | Get quiz results | User | None |

## Reviews

| Endpoint | Method | Description | Auth | Body |
| --- | --- | --- | --- | --- |
| `/api/courses/:courseId/reviews` | GET | Get course reviews and rating stats | Public | None |
| `/api/courses/:courseId/reviews` | POST | Create course review | User | `{ "rating": 5, "comment": "Great course" }` |
| `/api/courses/:courseId/reviews/:reviewId` | PATCH | Update course review | User | `{ "rating": 4, "comment": "Updated review" }` |
| `/api/courses/:courseId/reviews/:reviewId` | DELETE | Delete course review | User | None |

## Certificates

| Endpoint | Method | Description | Auth | Body |
| --- | --- | --- | --- | --- |
| `/api/certificates` | GET | Get current user's certificates | User | None |
| `/api/courses/:courseId/certificate` | POST | Issue certificate for completed course | User | None |

