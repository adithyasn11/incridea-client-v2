import { Route, Routes } from 'react-router-dom'
import Layout from '../components/Layout.tsx'
import HomePage from '../pages/HomePage.tsx'
import ProfilePage from '../pages/ProfilePage.tsx'
import LoginPage from '../pages/LoginPage.tsx'
import ResetPasswordPage from '../pages/ResetPasswordPage.tsx'
import NotFoundPage from '../pages/NotFoundPage.tsx'
import DashboardPage from '../pages/DashboardPage.tsx'
import ContactPage from '../pages/ContactPage.tsx'
import AboutPage from '../pages/AboutPage.tsx'
import RefundPage from '../pages/RefundPage.tsx'
import GuidelinesPage from '../pages/GuidelinesPage.tsx'
import EventsPage from '../pages/EventsPage.tsx'
import EventDetailPage from '../pages/EventDetailPage.tsx'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/refund" element={<RefundPage />} />
        <Route path="/guidelines" element={<GuidelinesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
