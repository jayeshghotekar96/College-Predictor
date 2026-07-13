import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import { Layout } from "./components/Layout";
import { SpeedInsights } from "@vercel/speed-insights/react";

const PredictorPage = React.lazy(() => import("./pages/Predictor").then(module => ({ default: module.PredictorPage })));
const LandingPage = React.lazy(() => import("./pages/Landing").then(module => ({ default: module.LandingPage })));
const Dashboard = React.lazy(() => import("./pages/Dashboard").then(module => ({ default: module.Dashboard })));
const CollegeExplorer = React.lazy(() => import("./pages/CollegeExplorer").then(module => ({ default: module.CollegeExplorer })));
const CollegeDetails = React.lazy(() => import("./pages/CollegeDetails").then(module => ({ default: module.CollegeDetails })));
const Calculator = React.lazy(() => import("./pages/Calculator").then(module => ({ default: module.Calculator })));

// Dummy components for routes we haven't built yet
const OptionFormBuilder = () => (
  <div className="p-12 text-center">Option Form Builder Coming Soon</div>
);

// Fallback loader
const Loader = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="predict" element={<PredictorPage />} />
            <Route path="colleges" element={<CollegeExplorer />} />
            <Route path="colleges/:code" element={<CollegeDetails />} />
            <Route path="analytics/calculator" element={<Calculator />} />
            <Route path="option-form" element={<OptionFormBuilder />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;
