// /app/providers/[id]/page.tsx
'use client';

import {  useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Provider = {
  id: number;
  name: string;
  service: string;
  rating: number;
  reviewCount: number;
  distance: string;
  imageUrl: string;
  isAvailable: boolean;
};

export default function ProviderDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id'); // أو في App Router: params.id من props
  
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    if (!id) return;

    // هنا يمكنك جلب البيانات من API حقيقي حسب الـ id
    // لأغراض العرض، سأستخدم بيانات ثابتة أو fetch
    // مثال بسيط:
    async function fetchProvider() {
      const res = await fetch(`/api/providers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProvider(data);
      } else {
        setProvider(null);
      }
    }
    fetchProvider();
  }, [id]);

  if (!provider) return <p>Loading or Provider not found...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{provider.name}</h1>
        
      <p><strong>Service:</strong> {provider.service}</p>
      <p><strong>Rating:</strong> {provider.rating} ({provider.reviewCount} reviews)</p>
      <p><strong>Distance:</strong> {provider.distance}</p>
      <p><strong>Status:</strong> {provider.isAvailable ? "Available" : "Unavailable"}</p>

      {/* يمكن إضافة معلومات إضافية */}
    </div>
  );
}
