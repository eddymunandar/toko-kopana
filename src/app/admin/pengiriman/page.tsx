import { Metadata } from 'next';
import DeliveryManagerClient from './DeliveryManagerClient';

export const metadata: Metadata = {
  title: 'Manajemen Pengiriman | Admin Toko Kopana',
};

export default function PengirimanPage() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <DeliveryManagerClient />
    </div>
  );
}
