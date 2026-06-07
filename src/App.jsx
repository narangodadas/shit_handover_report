import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HandoverForm from "./pages/HandoverForm";
import ReportPreview from "./pages/ReportPreview";
import "./styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HandoverForm />} />
        <Route path="/report" element={<ReportPreview />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
