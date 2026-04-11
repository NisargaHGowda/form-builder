import { BrowserRouter, Routes, Route } from "react-router-dom";
import BuilderPage from "./pages/BuilderPage";
import FormPage from "./pages/FormPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BuilderPage />} />
        <Route path="/form/:id" element={<FormPage />} />
        <Route path="/analytics/:id" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
