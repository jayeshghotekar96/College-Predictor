import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PredictorPage } from './pages/Predictor';
import { LandingPage } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { CollegeExplorer } from './pages/CollegeExplorer';
import { CollegeDetails } from './pages/CollegeDetails';
import { Calculator } from './pages/Calculator';

// Dummy components for routes we haven't built yet
const OptionFormBuilder = () => <div className="p-12 text-center">Option Form Builder Coming Soon</div>;

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
