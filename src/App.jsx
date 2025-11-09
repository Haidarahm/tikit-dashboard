import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Services from "./pages/Services.jsx";
import SubServices from "./pages/SubServices.jsx";
import Sections from "./pages/influencer/Sections.jsx";
import Banner from "./pages/Banner.jsx";
import AboutBanners from "./pages/AboutBanners.jsx";
import WorksSection from "./pages/work/WorksSection.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import InfluencersData from "./pages/influencer/influencersData.jsx";
import InfluencersItems from "./pages/work/InfluencersItems.jsx";
import SocialsData from "./pages/work/SocialsData.jsx";
import DigitalsData from "./pages/work/DigitalsData.jsx";
import CreativesData from "./pages/work/CreativesData.jsx";
import EventsData from "./pages/work/EventsData.jsx";
import News from "./pages/News.jsx";
import TeamManagement from "./pages/team/TeamManagement.jsx";
function App() {
  const basename = "/dashboardTikit";
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/services" replace />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/sub" element={<SubServices />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/news" element={<News />} />
            <Route path="/works" element={<WorksSection />} />
            <Route path="/works/influence/:id" element={<InfluencersItems />} />
            <Route path="/works/social/:id" element={<SocialsData />} />
            <Route path="/works/digital/:id" element={<DigitalsData />} />
            <Route path="/works/creative/:id" element={<CreativesData />} />
            <Route path="/works/event/:id" element={<EventsData />} />
            <Route path="/influencer/sections" element={<Sections />} />
            <Route path="/influencer/data/:id" element={<InfluencersData />} />
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
