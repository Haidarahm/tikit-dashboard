import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Sections from "./pages/influencer/Sections.jsx";
import Banner from "./pages/Banner.jsx";
import AboutBanners from "./pages/AboutBanners.jsx";
import WorksSection from "./pages/work/WorksSection.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import DashboardHomeRedirect from "./components/DashboardHomeRedirect.jsx";
import InfluencersData from "./pages/influencer/InfluencersData.jsx";
import InfluenceItems from "./pages/work/influenceItems/InfluenceItems.jsx";
import SocialsData from "./pages/work/SocialsData.jsx";
import DigitalsData from "./pages/work/DigitalsData.jsx";
import CreativesData from "./pages/work/CreativesData.jsx";
import EventsData from "./pages/work/EventsData.jsx";
import Blogs from "./pages/blogs/Blogs.jsx";
import Statistics from "./pages/Statistics.jsx";
import TeamManagement from "./pages/team/TeamManagement.jsx";
import ShowcaseProjects from "./pages/showcase/ShowcaseProjects.jsx";
import FeaturedCampaigns from "./pages/featured/FeaturedCampaigns.jsx";
import Jobs from "./pages/jobs/Jobs.jsx";
import RegisteredInfluencers from "./pages/RegisteredInfluencers.jsx";
import SubscribedUsers from "./pages/SubscribedUsers.jsx";
import Admins from "./pages/Admins.jsx";
import NoAccess from "./pages/NoAccess.jsx";
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
            <Route index element={<DashboardHomeRedirect />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/showcase-projects" element={<ShowcaseProjects />} />
            <Route path="/featured-campaigns" element={<FeaturedCampaigns />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/works" element={<WorksSection />} />
            <Route path="/works/influence/:slug" element={<InfluenceItems />} />
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
            <Route path="/no-access" element={<NoAccess />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
