import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Works from "./pages/Works.jsx";
import SubWorks from "./pages/SubWorks.jsx";
import Services from "./pages/Services.jsx";
import SubServices from "./pages/SubServices.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/works" replace />} />
            <Route path="/works" element={<Works />} />
            <Route path="/works/sub" element={<SubWorks />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/sub" element={<SubServices />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
