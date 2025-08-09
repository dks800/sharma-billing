import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="p-4">
      <p>Dashboard - Main App Area</p>
    </div>
  );
}
