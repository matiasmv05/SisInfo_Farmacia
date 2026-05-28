// app/routes/index.ts

export const ROUTES = {
  auth: {
    login: "/login",
    forgotPassword: "/forgot-password",
  },
  dashboard: "/dashboard",
} as const;

export type AppRoutes = typeof ROUTES;
