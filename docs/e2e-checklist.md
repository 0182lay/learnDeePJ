# End-to-End Test Checklist

Use this checklist before presenting the project. Test in this order because later steps depend on earlier data.

## Start App

- [ ] `docker compose up -d`
- [ ] `cd server && npm run dev`
- [ ] `cd client && npm run dev`
- [ ] Open `http://localhost:5173`

## Student Flow

- [ ] Register a new student account.
- [ ] Login with the student account.
- [ ] Open the home page.
- [ ] Open course catalog.
- [ ] Test category filter.
- [ ] Open one course detail page.
- [ ] Enroll in a free course, or upload a slip for a paid course.
- [ ] If paid, confirm the UI shows waiting for admin approval.

## Admin Payment Flow

- [ ] Login as admin.
- [ ] Open admin dashboard.
- [ ] Open payment history.
- [ ] Approve the student's payment.
- [ ] Confirm the payment count/status updates.

## Learning Flow

- [ ] Login as student again.
- [ ] Open dashboard.
- [ ] Confirm the enrolled course appears.
- [ ] Click start learning.
- [ ] Play a video lesson.
- [ ] Mark the lesson complete or let video end.
- [ ] Confirm progress updates in the lesson sidebar and dashboard.
- [ ] Open quiz lesson.
- [ ] Answer each question using next/previous controls.
- [ ] Submit quiz.
- [ ] Confirm score is shown.
- [ ] Generate/view certificate after course completion.

## Review Flow

- [ ] Open the completed/enrolled course detail page.
- [ ] Open the review tab.
- [ ] Submit a rating and comment.
- [ ] Confirm the course card and course detail rating update from real review data.
- [ ] Login as admin.
- [ ] Delete an inappropriate review.
- [ ] Confirm rating/count updates.

## Instructor Flow

- [ ] Login as student.
- [ ] Open profile menu.
- [ ] Submit request to become instructor.
- [ ] Login as admin.
- [ ] Approve instructor request.
- [ ] Login as instructor.
- [ ] Create a course.
- [ ] Upload thumbnail.
- [ ] Add video/document/quiz lesson content.
- [ ] Publish course.
- [ ] Confirm the course appears in catalog.
- [ ] Edit course information.
- [ ] Delete course.
- [ ] Confirm related lessons/files/certificates are removed.

## Admin Management Flow

- [ ] Admin can view overview stats.
- [ ] Admin can manage users.
- [ ] Admin can manage courses.
- [ ] Admin can create/edit/delete categories.
- [ ] Category cannot be deleted if courses still use it.

## Bug Log

| Area | Bug | Steps to Reproduce | Expected | Actual | Status |
| --- | --- | --- | --- | --- | --- |
| Example | Payment slip | Upload slip twice | Show existing pending slip | Allows repeat upload | Fixed |

