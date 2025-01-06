// Export all the public routes

import ForgotPassword from "pages/public/forgot-password"
import Login from "pages/public/login"
import ResetPassword from "pages/public/reset-password"
import Terms from "pages/public/TermsandConditions/Terms"
import PrivacyPolicy from "pages/public/TermsandConditions/PrivacyPolicy"

export const PublicRoutes = [
  { path: "/auth/login", exact: true, component: Login },
  { path: "/auth/forgot-password", exact: true, component: ForgotPassword },
  { path: "/auth/reset-password", exact: true, component: ResetPassword },
  { path: "/terms", exact: true, component: Terms },
  { path: "/privacy-policy", exact: true, component: PrivacyPolicy }
]
