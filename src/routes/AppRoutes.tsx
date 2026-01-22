import { Route, Routes } from "react-router-dom";
import Layout from "../components/Layout.tsx";
import HomePage from "../pages/HomePage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";
import TestPage from "../pages/TestPage.tsx";
import ContactPage from "../pages/ContactPage.tsx";
import AboutPage from "../pages/AboutPage.tsx";
import RefundPage from "../pages/RefundPage.tsx";
import GuidelinesPage from "../pages/GuidelinesPage.tsx";
import EventsPage from "../pages/EventsPage.tsx";
import EventDetailPage from "../pages/EventDetailPage.tsx";
import ProfilePage from "../pages/ProfilePage.tsx";
import PrivacyPage from "../pages/PrivacyPage.tsx";
import RulesPage from "../pages/RulesPage.tsx";
import QuizPage from "../pages/QuizPage.tsx";
import RegisterPage from "../pages/RegisterPage.tsx";
import AccommodationPage from '../pages/AccommodationPage.tsx'

const AuthRedirect = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    localStorage.setItem("token", token);
    window.location.href = "/";
    return null;
  }

  window.location.href = `${import.meta.env.VITE_AUTH_URL}/?redirect=${
    window.location.href
  }`;
  return null;
};

const ResetRedirect = () => {
  window.location.href = `${import.meta.env.VITE_AUTH_URL}/reset-password${
    window.location.search
  }`;
  return null;
};

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
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/login" element={<AuthRedirect />} />
        <Route path="/reset-password" element={<ResetRedirect />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/accommodation" element={<AccommodationPage />} />
        <Route path="/test" element={<TestPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
