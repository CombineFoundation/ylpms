# AGENTS.md

# Youth Leadership Program Management System (YLPMS)

Organization: Combine Foundation

Version: 1.0 MVP

Developers:
- Jibran (Frontend/UI/UX)
- Esha (Backend/Firebase)

---

# Project Overview

The Youth Leadership Program Management System (YLPMS) is a role-based leadership management platform developed for Combine Foundation.

The platform manages the complete organizational hierarchy of the Youth Leadership Program including:

- Head of Reporting Officer
- Senior Reporting Officer (SRO)
- Reporting Officer (RO)
- Youth Leader
- Volunteer

The system replaces spreadsheets with a secure, scalable, and modern web application.

---

# Tech Stack

Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

Backend
- Firebase Authentication
- Firestore Database
- Firebase Storage
- Firebase Cloud Messaging

State Management
- Zustand

Forms
- React Hook Form
- Zod

Charts
- Recharts

Deployment
- Vercel
- Hostinger VPS (Production)

Version Control
- Git
- GitHub

---

# UI Theme

Primary Color
#F97316

Secondary
#0F172A

Background
#F8FAFC

Cards
#FFFFFF

Success
#22C55E

Danger
#EF4444

Warning
#F59E0B

Typography

- Geist
- Inter

UI Style

- Modern
- Clean
- Minimal
- Responsive
- Professional

---

# Folder Structure

src/

app/

components/

features/

hooks/

services/

contexts/

lib/

types/

utils/

middleware/

---

# User Hierarchy

Head RO

↓

SRO

↓

RO

↓

Youth Leader

↓

Volunteer

---

# Role Permissions

## Head RO

Access

Full Access

Can

- CRUD SRO
- CRUD RO
- View all Youth Leaders
- View all Volunteers
- Assign RO
- View Reports
- Analytics
- Notifications
- Training Portal CRUD
- Settings

---

## SRO

Access

Assigned ROs Only

Can

- CRUD Assigned RO
- View Assigned Youth Leaders
- Assign Tasks
- Reports
- Training Portal CRUD

Cannot

- Access Other SRO Data

---

## RO

Access

Assigned Youth Leaders

Can

- Manage Assigned Youth Leaders
- View Volunteers
- Assign Tasks
- Reports
- Watch Training

Cannot

- Create Training

---

## Youth Leader

Access

Own Volunteers

Can

- Manage Volunteers
- Submit Events
- Submit Reports
- Watch Training

Cannot

- Manage Other Youth Leaders

---

## Volunteer

Access

Own Account

Can

- Complete Tasks
- Watch Training
- View Certificates

Cannot

- Manage Users

---

# Main Modules

Authentication

Dashboard

User Management

Task Management

Volunteer Management

Events

Reports

Training Portal

Certificates

Notifications

Analytics

Settings

Activity Logs

---

# Training Portal

Admin

Head RO

SRO

Permissions

- Create Course
- Edit Course
- Delete Course
- Upload Videos
- Upload PDF
- Upload PPT
- Upload Assignments
- Monitor Progress

Learners

RO

Youth Leader

Volunteer

Permissions

- Watch Videos
- Download Resources
- Submit Assignment
- View Progress
- Download Certificates

---

# Firestore Collections

users

tasks

events

reports

volunteers

attendance

notifications

trainingCategories

courses

lessons

courseVideos

courseDocuments

assignments

courseProgress

courseEnrollments

courseCertificates

activityLogs

settings

---

# Coding Standards

Always

✔ Use TypeScript

✔ Use Functional Components

✔ Use Server Components by default

✔ Use Client Components only when necessary

✔ Keep components reusable

✔ Keep files small

✔ Create custom hooks

✔ Use Tailwind utilities

✔ Validate forms using Zod

✔ Use React Hook Form

✔ Use async/await

✔ Use Firestore Security Rules

✔ Handle Loading State

✔ Handle Error State

✔ Handle Empty State

---

# Naming Convention

Components

PascalCase

Example

UserCard.tsx

Pages

page.tsx

Hooks

useTasks.ts

Services

task.service.ts

Types

task.types.ts

Constants

task.constants.ts

---

# Component Rules

Maximum component size

300 lines

Split if larger.

Maximum page size

500 lines

Split into reusable sections.

---

# UI Rules

Use shadcn components whenever possible.

Avoid custom components unless necessary.

Cards

16px radius

Buttons

Primary

Secondary

Outline

Ghost

Destructive

Tables

Search

Pagination

Sorting

Filtering

Responsive

Dialogs

Use shadcn Dialog

Forms

React Hook Form

Validation

Zod

---

# Git Workflow

main

Production

develop

Development

feature/auth

feature/dashboard

feature/tasks

feature/events

feature/training

feature/reports

Bug Fix

fix/login

fix/dashboard

---

# Commit Format

feat:

fix:

refactor:

style:

docs:

chore:

Example

feat: add Head RO dashboard

fix: resolve Firestore permissions

---

# Performance Rules

Lazy load pages

Optimize images

Avoid unnecessary re-renders

Cache Firestore requests

Use Suspense where applicable

---

# Security

Role-Based Authentication

Firestore Rules

Protected Routes

Server-side validation

Never expose Firebase Admin SDK

Never expose secrets

Use Environment Variables

---

# AI Agent Instructions

When generating code:

- Follow project folder structure.
- Reuse existing components before creating new ones.
- Keep code modular and scalable.
- Never duplicate logic.
- Use strict TypeScript.
- Prefer composition over inheritance.
- Maintain responsive layouts.
- Follow shadcn design patterns.
- Keep accessibility in mind.
- Write readable and maintainable code.

When creating pages:

Always include

- Loading state
- Error state
- Empty state
- Skeleton Loader
- Responsive design

---

# MVP Scope

Authentication

Role-Based Access

Head RO Dashboard

SRO Dashboard

RO Dashboard

Youth Leader Dashboard

Volunteer Dashboard

Task Management

Volunteer Management

Event Management

Reports

Training Portal

Notifications

Analytics

Deployment

---

# Future Scope

AI Report Generator

Survey Module

QR Digital ID

Mobile App

WhatsApp Integration

Email Automation

Gamification

Public Event Registration

Multi-language Support

Advanced Analytics

---

End of AGENTS.md