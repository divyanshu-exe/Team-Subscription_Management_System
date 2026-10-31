// OWNER: FE-1
// PURPOSE: New product creation page (ADMIN only)

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProduct } from '../../../../services/products.service';
import { ProductForm } from '../../../../components/forms/ProductForm';
import { useToast } from '../../../../components/ui/Toast';
import { RoleGuard } from '../../../../components/layout/RoleGuard';

export default function NewProductPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await createProduct(data);
      success('Product created successfully');
      router.push('/products');
    } catch (err: any) {
      error(err.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoleGuard roles={['ADMIN']}>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Link href="/products" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            &larr; Back to Products
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold text-slate-900">New Product</h1>
        </div>

        <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </RoleGuard>
  );
}
