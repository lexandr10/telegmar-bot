import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import RequiredAuth from "./components/RequireAuth"; 
import RedirectIfAuth from "./components/RedirectIfAuth";

export default function App() {
  return (
    <Routes>
      {/* публичные */}
      <Route element={<RedirectIfAuth />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* защищённые: оборачиваем родителя в RequiredAuth и кладём детей внутрь */}
      <Route element={<RequiredAuth />}>
        <Route path="/users" element={<UsersPage />} />
        {/* сюда можно добавлять другие защищённые страницы */}
      </Route>

      {/* дефолтный редирект */}
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
}
