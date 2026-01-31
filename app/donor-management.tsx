import { DonorManagementScreen } from './screens/dashboard/DonorManagementScreen';
import DashboardLayout from './components/DashboardLayout';

export default function DonorManagement() {
  return (
    <DashboardLayout>
      <DonorManagementScreen />
    </DashboardLayout>
  );
}