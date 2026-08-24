# 🏗️ Rhockstar Connect — System Architecture & Developer Guide

Welcome to the technical blueprint for **Rhockstar Connect**! This document provides an overview of the platform's codebase structure, database schema, state management, and real-time subscription services.

---

## 📁 Repository Structure

```
Rhockstar-Connect/
├── src/
│   ├── app/                    # Next.js App Router (pages & layout routes)
│   │   ├── (auth)/             # Auth routes (/login, /register)
│   │   ├── (dashboard)/        # Main app (/feed, /jobs, /messages, /profile, /employer/ads, etc.)
│   │   ├── admin/              # SuperAdmin review portal (/admin/ads, /admin/users, /admin/jobs)
│   │   ├── layout.tsx          # Root layout with JSON-LD SEO & theme container
│   │   ├── robots.ts           # Dynamic Robots protocol
│   │   └── sitemap.ts          # Dynamic XML Sitemap generator
│   ├── components/             # Reusable UI Components
│   │   ├── ads/                # CreateAdModal & Advertiser components
│   │   ├── chat/               # Community chat & messaging components
│   │   ├── feed/               # PostCard, PostComposer, SponsoredAdCard
│   │   ├── layout/             # Sidebar, MobileHeader, QuickCreateModal, AdminSidebar
│   │   └── ui/                 # UserAvatar, WidgetErrorBoundary, ToastProvider
│   ├── lib/
│   │   ├── services/           # Firestore Database Service Layer
│   │   │   ├── ads.ts          # Sponsored Ad campaigns & real-time tracking
│   │   │   ├── chat.ts         # Real-time direct messaging
│   │   │   ├── communities.ts  # Public chat communities
│   │   │   ├── jobs.ts         # Employer job postings & ATS
│   │   │   ├── posts.ts        # Feed posts, likes, comments
│   │   │   └── users.ts        # User profiles & account management
│   │   ├── firebase.ts         # Client Firebase initialization
│   │   └── firebase-admin.ts   # Firebase Admin SDK initialization
│   └── store/                  # Global State Management (Zustand)
│       └── useAuthStore.ts     # Synchronized User Auth & Profile State
├── firestore.indexes.json      # Version-controlled Firestore composite indexes
└── package.json                # Project dependencies & Turbopack build scripts
```

---

## 🗄️ Firestore Database Schema

### 1. `users` Collection
- `uid`: string (Primary Key)
- `fullName`: string
- `email`: string
- `accountType`: `'individual' | 'employer'`
- `role`: `'user' | 'admin'`
- `avatar`: string
- `headline`: string
- `subscriptionTier`: `'free' | 'pro' | 'platinum'`
- `createdAt`: timestamp

### 2. `advertisements` Collection
- `id`: string
- `companyId`: string
- `companyName`: string
- `companyLogo`: string
- `companyEmail`: string
- `title`: string
- `content`: string
- `mediaUrl`: string
- `mediaType`: `'image' | 'video'`
- `ctaText`: string (e.g. "Shop Now", "Learn More")
- `targetUrl`: string
- `status`: `'pending' | 'approved' | 'rejected' | 'active' | 'paused' | 'expired'`
- `viewsCount`: number (Impressions)
- `clicksCount`: number (Clicks)
- `expiresAt`: timestamp

### 3. `posts` Collection
- `id`: string
- `authorId`: string
- `authorName`: string
- `authorAvatar`: string
- `content`: string
- `mediaUrl`: string
- `likesCount`: number
- `commentsCount`: number
- `createdAt`: timestamp

### 4. `mail` Collection (Firebase Trigger Email)
- `to`: array of emails
- `message`: `{ subject: string, html: string }`
- `createdAt`: timestamp

---

## ⚡ Real-Time Subscriptions Architecture

All real-time streams consume Firestore `onSnapshot` listeners to provide instant updates without needing page refreshes:

| Resource | Service Function | Hook Location |
| :--- | :--- | :--- |
| **Feed Posts** | `subscribeToFeed()` | `src/app/(dashboard)/feed/page.tsx` |
| **Sponsored Ads** | `subscribeToActiveAds()` | `src/app/(dashboard)/feed/page.tsx` |
| **Direct Messages** | `subscribeToMessages()` | `src/app/(dashboard)/messages/page.tsx` |
| **Public Communities** | `subscribeToCommunities()` | `src/app/(dashboard)/messages/page.tsx` |
| **Admin Ads Review** | `subscribeToAllAds()` | `src/app/admin/(protected)/ads/page.tsx` |
