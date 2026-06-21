# 🏥 Pharmaxa Care (Careflow)

A high-performance, real-time Clinical Management System built to eliminate administrative overhead and manual tracking in healthcare facilities.

> **Production Status:** The Core Staff Attendance, Master Staff, and Master Role modules are fully operational, optimized, and integrated with a relational Supabase database architecture.

---

## 🚀 Business Impact & Metriks (Why This Matters)
* **1-Click Payroll Preparation:** Reduced monthly attendance compilation and cut-off reporting loops from manual, error-prone spreadsheets into a **single-click instant task** generating pre-formatted multi-sheet Excel workbooks.
* **Smart Cut-off Filtering:** Automatically aligns with clinical standard operating procedures (SOPs) by defaulting views and exports to the specific 28th (past month) – 27th (current month) cycle.

---

## ✨ Key Features & Modules

### 1. 📅 Staff Attendance Engine
* **Relational Multi-Staff Shifts:** Handles complex medical shift patterns (Pagi, Sore, Malam) mapped dynamically into distinct healthcare professional roles.
* **Dynamic Relational Aggregation:** Converts single row-based PostgreSQL entries into streamlined, grouped shift data for multi-role medical staff configurations.
* **Instant Exports (`exceljs`):** Compiles live attendance records into a multi-sheet downloadable Excel workbook, dynamically generating **1 dedicated sheet per staff member** with automated native Excel totals (`=SUM()`).

### 2. 👥 Master Staff Management
* Track and manage clinical staff directory, employment history, role mapping, and active/inactive personnel statuses under rigorous TypeScript typings.

### 3. 🛡️ Master Role Configuration
* Scalable relational model to define healthcare facility departments (e.g., Apoteker, Dokter, Asisten Apoteker, Perawat) allowing flexible dynamic forms.

---

## 🛠️ Technical Implementation Highlights

* **Framework:** Next.js 14/15 (App Router) utilizing Server Page data fetching with dynamic Client Component UI interaction states.
* **State Management & Validation:** Fully structured under **React Hook Form** paired with **Zod Schema validation**, ensuring seamless, error-free client-side controls.
* **Database & Persistence:** **Supabase (PostgreSQL)** leveraging deep relational schemas, Foreign Key constraints (`attendance_staff_id_fkey`), and automated primary key UUID generations.
* **UI & Component Architecture:** Built using **Tailwind CSS** and **Shadcn UI**, utilizing highly generic *reusable* components such as custom programmatic dialog shells (`FormDialogShell`, `ConfirmDeleteDialog`) and strict generic type-safe combobox fields (`InputCombobox<T>`).

---

## 📦 Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS, Shadcn UI (Radix UI)
- **Forms & Validation:** React Hook Form, @hookform/resolvers, Zod
- **Data Engineering & Formatting:** Supabase JS Client, ExcelJS, File-Saver, Date-fns
- **Icons:** Lucide React

---

## 🛣️ Production Roadmap

- [x] Multi-sheet automated Excel reporting tool engine.
- [x] Dynamic relational form fields handling multi-role dropdown selection.
- [ ] Role-Based Access Control (RBAC) authorization middleware.
- [ ] Clinic POS (Point of Sales) & Drug Procurement Integration.

---

## 🌐 Live Demo & Deployment

The application is fully deployed and production-ready. You can access the live system, explore the relational grid table, test the dynamic form validation, and try the 1-click Excel export via the link below:

🔗 **Live Production URL:** [https://rahayu-medika.vercel.app/](https://rahayu-medika.vercel.app/)
