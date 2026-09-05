import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import CheckoutPage from './pages/checkout/CheckoutPage';
import PayPage from './pages/pay/PayPage';
import PaySuccessPage from './pages/pay-success/PaySuccessPage';
import NotFound from './pages/NotFound/NotFound';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CheckoutPage />} />
        <Route index element={<Navigate to="/" replace />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="pay/:orderNo" element={<PayPage />} />
        <Route path="pay-success/:orderNo" element={<PaySuccessPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Layout>
  );
}

export default App;
