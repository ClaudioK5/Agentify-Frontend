import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CreateAgentPage } from "./pages/CreateAgentPage";
import { MyAgentsPage } from "./pages/MyAgentsPage";
import { AccountPage } from "./pages/AccountPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CreateAgentPage />} />
        <Route path="agents" element={<MyAgentsPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
