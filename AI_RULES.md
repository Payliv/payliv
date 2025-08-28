# AI Rules for PayLiv Application

This document outlines the core technologies and best practices for developing the PayLiv application. Adhering to these guidelines ensures consistency, maintainability, and optimal performance.

## Tech Stack Overview

The PayLiv application is built using a modern and robust web development stack:

*   **Frontend Framework:** React.js for building dynamic and interactive user interfaces.
*   **Language:** TypeScript for enhanced code quality, type safety, and developer experience.
*   **Build Tool:** Vite for a fast development server and optimized production builds.
*   **Styling:** Tailwind CSS for utility-first styling, complemented by pre-built components from shadcn/ui.
*   **Backend-as-a-Service (BaaS):** Supabase handles authentication, database management (PostgreSQL), file storage, and serverless functions (Edge Functions).
*   **Routing:** React Router DOM for declarative navigation and URL management.
*   **Animations:** Framer Motion for fluid and engaging UI animations.
*   **Icons:** Lucide React for a comprehensive and customizable icon set.
*   **State Management:** React Context API is used for global state (authentication, user profile, notifications, theme).
*   **Data Visualization:** Recharts for creating interactive and responsive charts.
*   **PDF Generation:** jsPDF and jspdf-autotable for client-side PDF document creation.
*   **Markdown Rendering:** React Markdown with remark-gfm for displaying rich text content.
*   **Date Handling:** date-fns for efficient date manipulation and formatting.

## Library Usage Guidelines

To maintain consistency and leverage the strengths of each library, please follow these rules:

*   **UI Components:**
    *   **Primary Choice:** Always use components from `shadcn/ui` (imported from `@/components/ui/`) for standard UI elements (e.g., `Button`, `Input`, `Card`, `Dialog`, `Select`, `Switch`, `Table`, `Tooltip`, `Accordion`, `Tabs`, `Avatar`, `DropdownMenu`, `Sheet`, `AlertDialog`, `Checkbox`).
    *   **Custom Components:** If a required component is not available in `shadcn/ui`, create a new, small, and focused component file in `src/components/` and style it exclusively with Tailwind CSS.
    *   **No Direct Modification:** Do NOT modify `shadcn/ui` component files directly. If customization is needed beyond props, create a new component that wraps or extends the `shadcn/ui` component.
*   **Styling:**
    *   **Tailwind CSS First:** All styling must be done using Tailwind CSS utility classes.
    *   **Avoid Custom CSS:** Refrain from writing custom CSS files or inline styles unless absolutely necessary for highly specific or complex visual requirements that cannot be achieved with Tailwind.
*   **Backend Interactions:**
    *   **Supabase Client:** Use the `supabase` client instance from `@/lib/customSupabaseClient` for all interactions with the Supabase backend (authentication, database queries, storage operations, invoking Edge Functions).
*   **Routing:**
    *   **React Router DOM:** Use `react-router-dom` for all application navigation. Define main application routes within `src/App.tsx`.
*   **Animations:**
    *   **Framer Motion:** Utilize `framer-motion` for all declarative UI animations to ensure a consistent and smooth user experience.
*   **Icons:**
    *   **Lucide React:** All icons should be imported and used from the `lucide-react` library.
*   **Document Head Management:**
    *   **React Helmet Async:** Use `react-helmet-async` in page components to manage document head elements like `<title>` and `<meta>` tags for SEO and social sharing.
*   **Carousels & Sliders:**
    *   **Swiper:** Use `swiper` and `swiper/react` for implementing carousels, image sliders, and similar interactive content displays.
*   **Markdown Rendering:**
    *   **React Markdown:** For rendering Markdown content, use `react-markdown` in conjunction with `remark-gfm` for GitHub Flavored Markdown support.
*   **Phone Number Input:**
    *   **PhoneInput Component:** Always use the custom `PhoneInput` component (which wraps `react-phone-number-input`) for handling international phone number inputs in forms.
*   **Charts & Graphs:**
    *   **Recharts:** All data visualization charts should be built using the `recharts` library.
*   **PDF Generation:**
    *   **jsPDF:** For generating PDF documents (e.g., order invoices), use `jspdf` along with `jspdf-autotable` for structured table layouts.
*   **Date & Time:**
    *   **date-fns:** Use `date-fns` for all date and time formatting, parsing, and manipulation tasks.
*   **User Notifications:**
    *   **useToast Hook:** For displaying transient, non-blocking notifications to the user, use the `useToast` hook from `@/components/ui/use-toast`.
*   **Global State Management:**
    *   **Context API:** Leverage the existing React Context Providers (`AuthProvider`, `ProfileProvider`, `NotificationsProvider`, `ThemeProvider`) for managing global application state. Avoid introducing new global state management solutions unless absolutely necessary and approved.