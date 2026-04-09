import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Sections from "./pages/influencer/Sections.jsx";
import Banner from "./pages/Banner.jsx";
import AboutBanners from "./pages/AboutBanners.jsx";
import WorksSection from "./pages/work/WorksSection.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import InfluencersData from "./pages/influencer/influencersData.jsx";
import InfluencersItems from "./pages/work/InfluencersItems.jsx";
import SocialsData from "./pages/work/SocialsData.jsx";
import DigitalsData from "./pages/work/DigitalsData.jsx";
import CreativesData from "./pages/work/CreativesData.jsx";
import EventsData from "./pages/work/EventsData.jsx";
import News from "./pages/News.jsx";
import TeamManagement from "./pages/team/TeamManagement.jsx";
import ShowcaseProjects from "./pages/ShowcaseProjects.jsx";
import RegisteredInfluencers from "./pages/RegisteredInfluencers.jsx";
import SubscribedUsers from "./pages/SubscribedUsers.jsx";
import Admins from "./pages/Admins.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/team" replace />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/showcase-projects" element={<ShowcaseProjects />} />
            <Route path="/news" element={<News />} />
            <Route path="/works" element={<WorksSection />} />
            <Route path="/works/influence/:slug" element={<InfluencersItems />} />
            <Route path="/works/social/:slug" element={<SocialsData />} />
            <Route path="/works/digital/:slug" element={<DigitalsData />} />
            <Route path="/works/creative/:slug" element={<CreativesData />} />
            <Route path="/works/event/:slug" element={<EventsData />} />
            <Route path="/influencer/sections" element={<Sections />} />
            <Route path="/influencer/data/:id" element={<InfluencersData />} />
            <Route
              path="/registered-influencers"
              element={<RegisteredInfluencers />}
            />
            <Route path="/subscribed-users" element={<SubscribedUsers />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="/banner" element={<Banner />} />
            <Route path="/about-banners" element={<AboutBanners />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
