
import { useState, useEffect } from 'react';
import { useSuppliersData } from './useSuppliersData';

interface Supplier {
  id?: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  payment_terms?: number;
  notes?: string;
  is_active?: boolean;
}

interface FormData {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  payment_terms: number;
  notes: string;
  is_active: boolean;
}

export const useSupplierForm = (supplier: Supplier | null, onClose: () => void) => {
  const { createSupplier, updateSupplier } = useSuppliersData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    tax_id: '',
    payment_terms: 30,
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        tax_id: supplier.tax_id || '',
        payment_terms: supplier.payment_terms || 30,
        notes: supplier.notes || '',
        is_active: supplier.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        tax_id: '',
        payment_terms: 30,
        notes: '',
        is_active: true,
      });
    }
  }, [supplier]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    const inputElement = e.target as HTMLInputElement;
    const type = inputElement.type;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (supplier && supplier.id) {
        await updateSupplier({ ...formData, id: supplier.id });
      } else {
        await createSupplier(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving supplier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
  };
};
