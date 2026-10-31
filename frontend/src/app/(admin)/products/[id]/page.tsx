// OWNER: FE-1
// PURPOSE: Product detail & editing page with delete confirmation modal

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProduct, updateProduct, deleteProduct } from '../../../../services/products.service';
import { Product } from '../../../../types';
import { ProductForm } from '../../../../components/forms/ProductForm';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { useToast } from '../../../../components/ui/Toast';
import { useAuth } from '../../../../hooks/useAuth';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();

  const isAdmin = user?.role === 'ADMIN';
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProduct(productId);
        setProduct(data);
      } catch (err: any) {
        error(err.message || 'Product not found');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId, router, error]);

  const handleUpdate = async (data: any) => {
    setSaving(true);
    try {
      const updated = await updateProduct(productId, data);
      setProduct(updated);
      success('Product updated successfully');
    } catch (err: any) {
      error(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(productId);
      success('Product deleted successfully');
      router.push('/products');
    } catch (err: any) {
      error(err.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/products" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            &larr; Products
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
        </div>

        {isAdmin && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Product
          </Button>
        )}
      </div>

      <ProductForm
        initialData={product}
        onSubmit={handleUpdate}
        isLoading={saving}
        readOnly={!isAdmin}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product"
        description="Are you sure you want to deactivate this product? Existing subscriptions will remain intact."
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={deleting} onClick={handleDelete}>
            Confirm Deactivation
          </Button>
        </div>
      </Modal>
    </div>
  );
}
