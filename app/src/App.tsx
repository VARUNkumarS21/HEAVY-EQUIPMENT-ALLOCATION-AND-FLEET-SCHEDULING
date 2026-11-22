import { Routes, Route, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import Overview from '@/pages/Overview';
import AiCommandCenter from '@/pages/AiCommandCenter';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Fleet from '@/pages/Fleet';
import EquipmentDetail from '@/pages/EquipmentDetail';
import EquipmentCompare from '@/pages/EquipmentCompare';
import Allocations from '@/pages/Allocations';
import Scheduler from '@/pages/Scheduler';
import Maintenance from '@/pages/Maintenance';
import Requests from '@/pages/Requests';
import Catalog from '@/pages/Catalog';
import SiteMap from '@/pages/SiteMap';
import Analytics from '@/pages/Analytics';
import Alerts from '@/pages/Alerts';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Overview />} />
        <Route path="ai-command-center" element={<AiCommandCenter />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="fleet" element={<Fleet />} />
        <Route path="fleet/compare" element={<EquipmentCompare />} />
        <Route path="fleet/:id" element={<EquipmentDetail />} />
        <Route path="allocations" element={<Allocations />} />
        <Route path="scheduler" element={<Scheduler />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="requests" element={<Requests />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="site-map" element={<SiteMap />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
