import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import HRMSApp from '@/pages/HRMSApp';

const Index = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HRMSApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default Index;
