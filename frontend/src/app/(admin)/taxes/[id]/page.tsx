// OWNER: FE-1
// PURPOSE: Tax rule detail and editing page with delete confirmation modal

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTax, updateTax, deleteTax } from '../../../../services/taxes.service';
import { Tax } from '../../../../types';
import { TaxForm } from '../../../../components/forms/TaxForm';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { useToast } from '../../../../components/ui/Toast';
import { useAuth } from '../../../../hooks/useAuth';

export default function TaxDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();

  const isAdmin = user?.role === 'ADMIN';
  const taxId = params.id as string;

  const [tax, setTax] = useState<Tax | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTax(taxId);
        setTax(data);
      } catch (err: any) {
        error(err.message || 'Tax rule not found');
        router.push('/taxes');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [taxId, router, error]);

  const handleUpdate = async (data: any) => {
    setSaving(true);
    try {
      const updated = await updateTax(taxId, data);
      setTax(updated);
      success('Tax rule updated successfully');
    } catch (err: any) {
      error(err.message || 'Failed to update tax rule');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTax(taxId);
      success('Tax rule deleted successfully');
      router.push('/taxes');
    } catch (err: any) {
      error(err.message || 'Failed to delete tax rule');
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

  if (!tax) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/taxes" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            &larr; Taxes
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold text-slate-900">{tax.name}</h1>
        </div>

        {isAdmin && (
          <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
            Delete Tax
          </Button>
        )}
      </div>

      <TaxForm
        initialData={tax}
        onSubmit={handleUpdate}
        isLoading={saving}
        readOnly={!isAdmin}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Tax Rule"
        description="Are you sure you want to deactivate this tax rule?"
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
