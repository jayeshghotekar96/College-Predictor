import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Layout } from "./components/Layout";
import { PageTransition } from "./components/ui/PageTransition";

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

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="predict" element={<PageTransition><PredictorPage /></PageTransition>} />
          <Route path="colleges" element={<PageTransition><CollegeExplorer /></PageTransition>} />
          <Route path="colleges/:code" element={<PageTransition><CollegeDetails /></PageTransition>} />
          <Route path="analytics/calculator" element={<PageTransition><Calculator /></PageTransition>} />
          <Route path="option-form" element={<PageTransition><OptionFormBuilder /></PageTransition>} />
          <Route path="dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
