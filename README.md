# Job Portal System

## Project Overview

The Job Portal System is a modern, full-stack web application designed to seamlessly connect talent with opportunity. Built with a focus on user experience and performance, the platform provides dedicated interfaces for candidates seeking employment, recruiters managing job postings, and administrators overseeing the platform's ecosystem.

## System Architecture

The Job Portal System follows a modern full-stack architecture:

* **Frontend:** Next.js 15 (App Router)
* **Styling:** Tailwind CSS
* **Authentication:** Supabase Auth
* **Database:** Supabase PostgreSQL
* **Deployment Ready:** Vercel

Users interact with the Next.js frontend, which communicates directly with Supabase for authentication and database operations.

## Role-Based Access Control & Features

The system supports three distinct user roles with strict access control. After login, users are automatically redirected to their respective dashboards based on their role.

### Candidate
* Register & Login
* Browse jobs
* Apply for jobs
* Track application status
* Update profile

### Recruiter
* Register & Login
* Create job postings
* Manage posted jobs
* Review applications
* Accept or reject candidates
* Update profile

### Admin
* View platform statistics
* Manage users
* Manage jobs
* Manage applications
* Access central admin dashboard

## Technologies Used

* Next.js
* TypeScript
* Tailwind CSS
* Supabase
* PostgreSQL
* Lucide React (Icons)

## Database Documentation

### Entity Relationship Diagram (ERD)

```text
profiles (1) --------< jobs
profiles (1) --------< applications
jobs     (1) --------< applications
```

**Relationships:**
* One **Recruiter** can create many **Jobs**.
* One **Candidate** can submit many **Applications**.
* One **Job** can receive many **Applications**.

### Database Tables

* **`profiles`**
  * `id` (UUID) - Primary Key, references auth.users.id
  * `email` (Text) - User's email address
  * `role` (Text) - 'candidate', 'recruiter', or 'admin'
  * `full_name` (Text) - User's full display name
  * `phone` (Text) - User's contact number

* **`jobs`**
  * `id` (UUID/Int) - Primary Key
  * `title` (Text) - Job position title
  * `company_name` (Text) - Hiring organization
  * `location` (Text) - Job location
  * `job_type` (Text) - Employment type (e.g., Full-time, Contract)
  * `salary_range` (Text) - Expected compensation
  * `recruiter_id` (UUID) - Foreign Key referencing `profiles.id`

* **`applications`**
  * `id` (UUID/Int) - Primary Key
  * `candidate_id` (UUID) - Foreign Key referencing `profiles.id`
  * `job_id` (UUID/Int) - Foreign Key referencing `jobs.id`
  * `status` (Text) - Current application status (Pending, Accepted, Rejected)
  * `applied_at` (Timestamp) - Date and time of application submission

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd job-portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Running the Project

**Development Server:**
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your browser.

**Build for Production:**
```bash
npm run build
npm start
```

## Screenshots

### Home Page
(screenshots/homePage.png)

### Candidate Dashboard
(/public/screenshots/CandidateDashboard.png)

### Recruiter Dashboard
(/public/screenshots/RecruiterDashboard.png)

### Admin Dashboard
(/public/screenshots/AdminDashboard.png)

### Job Listings
(/public/screenshots/JobsPage.png)

### Application Management
(/public/screenshots/ApplicationManagement.png)

## Future Improvements

* Resume Upload Support
* Email Notifications
* Advanced Search & Filters
* Interview Scheduling
* Real-Time Notifications
* Company Profiles
* Analytics Dashboard

## Author

Rajapaksha Arachchillage Charith Gayashan Deshapriya

## Academic Declaration

This project was developed as part of an academic assessment using Next.js, TypeScript, Tailwind CSS, and Supabase. The application demonstrates role-based authentication, job management, application tracking, and administrative functionality within a modern web application architecture.
