# 🪐 Omega Management OS

Omega Management OS is an ultra-premium, high-fidelity responsive dashboard application designed for seamless product inventory, detailed stock orders, supply chain analytics, and warehouse operations. 

Featuring modern dark/light mode states, HSL-tailored custom color tokens, fluid hardware-accelerated animations, and responsive micro-interactions, it delivers a state-of-the-art enterprise administrative experience on both desktop and mobile viewports.

---

## ✨ Features & Visual Enhancements

### 🪐 Staggered Scroll-Reveal Animations
- **cascading entry reveals**: Grid product cards slide into view row-by-row (`60ms` staggered columns) using high-performance CSS transforms.
- **Buttery-Smooth Performance**: Native `IntersectionObserver` triggers hardware-accelerated fades and slides (`will-change-[transform,opacity]`) running at a locked `60fps`.
- **Global Application**: Implemented cohesively across KPIs, category distribution charts, inbound stock lists, and schedules on all subpages.

### 💼 Sleek Mobile Sliding Drawers
- Fluid sliding sidebars (`translate-x-0` vs `-translate-x-full`) equipped with backdrop-blur overlay fades (`opacity-100` vs `opacity-0`) and simple click-to-dismiss capabilities.

### 📊 Customized Financial Data & Analytical Charts
- Financial tick axes are formatted using compact thousands notation (e.g. `$14k` instead of `$14000`) for visual balance.
- Upgraded charts render dynamically with crisp Tooltip triggers and clean vector representations.

### 📦 Dynamic Responsive Layouts
- **Smart Viewport Defaults**: Automatically triggers high-fidelity **Grid Cards view** on mobile/tablet viewports and transitions to structural **Table List view** on PC monitors on page mount.
- **No Layout Gaps**: Negative margins and full-width layout parameters prevent hairline sub-pixel lines or gaps between layout containers.
- **Anti-Wrap Badges**: Table columns auto-constrain status pill badges (`whitespace-nowrap`) to guarantee visual alignment.

### 🎨 State-of-the-Art Tailored Micro-Interactions
- **Profile Dropup Menu**: Clutter-free sidebar user details that absolute-float upwards when clicked, with standard click-outside listeners to close automatically.
- **HSL Sorting Selector**: Premium custom select menus with smooth scale-in animations that replace default browser `<select>` boxes.
- **Dynamic Floating Alerts**: Live updates slide up into floating alert toasts in the bottom-right corner, avoiding layout shifts on the lists.
- **TopNav Flex Spacing**: Fluid elastic headers enforce standard minimum spacing gaps (`gap-4`) with breadcrumb and heading truncations to prevent collision on narrow devices.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev) with [TypeScript](https://www.typescriptlang.org)
- **Bundler & Build Tool**: [Vite 8](https://vite.dev) (Ultra-fast Hot Module Replacement)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com) (Utility-first framework)
- **Icons**: Handcrafted custom responsive SVG inline vectors
- **Charts**: [Recharts](https://recharts.org) (Responsive composable charts)
- **Animation System**: Standard hardware-accelerated keyframe animation pipelines
- **Formatting Utilities**: Lightweight Currency & Compact Number utilities

---

## 📂 Project Structure

```text
omega-management/
├── src/
│   ├── components/
│   │   ├── common/             # Reusable UI widgets (Panel, ProductCard, ScrollReveal...)
│   │   ├── dashboard/          # Specialized chart wrappers
│   │   └── layout/             # Core structural framework (TopNav, Sidebar, DashboardLayout...)
│   ├── hooks/                  # Custom React logic hooks (useProductFetch, useDebounce...)
│   ├── pages/                  # Top-level route pages (Products, Analytics, Inventory...)
│   ├── utils/                  # Utility formatters and api endpoints
│   ├── index.css               # Core styling variables, scrollbars & keyframes
│   ├── main.tsx                # App bootstrap mount point
│   └── App.tsx                 # Core router & layout setup
├── public/                     # Static resources, SVGs, and assets
├── vite.config.ts              # Vite configurations
├── tailwind.config.js          # Tailwind customization and animation systems
├── tsconfig.json               # TypeScript path & compiler parameters
└── package.json                # Dependencies and run scripts
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have [Node.js](https://nodejs.org) (v18+ recommended) and `npm` installed.

### 📥 Installation

Clone and install dependencies locally:

```bash
# Navigate to the project folder
cd omega-management

# Install packages
npm install
```

### 💻 Running Development Server

To launch the local development server with Vite (defaults to `http://localhost:5173`):

```bash
npm run dev
```

### 🏗️ Creating Production Build

To compile the application code and assets into highly optimized distribution bundles (`/dist`):

```bash
npm run build
```

### 🧹 Linting & Diagnostics

Run lint configurations to check syntax parameters and enforce code style rules:

```bash
npm run lint
```
