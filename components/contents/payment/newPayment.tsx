'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { Item } from 'src/types/database';
import { createTypedClient } from 'src/utils/supabase/typed-client';

import { PaymentForm, PaymentFormData } from './paymentForm';
import Swal from 'sweetalert2';

export type TabOption = {
  name: string
  value: string
}

type Props = {
  items: Item[]
}

export const NewPayment: FC<Props> = ({ items }) => {
  const router = useRouter();

  const supabase = createTypedClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateTotalFromFormData = (formData: PaymentFormData): number => {
    let total = 0;
    for (const item of items) {
      const count = formData.itemCounts[item.id.toString()] || 0;
      total += item.price * count;
    }
    total += formData.donation || 0;
    return total;
  };

  const handleSubmit = async (formData: PaymentFormData) => {
    setIsSubmitting(true);

    try {
      // Create payment data with dynamic item counts
      const paymentData = {
        car_number: formData.carNum!,
        date: new Date().toISOString().split('T')[0], // Today's date
        cash: formData.cash,
        credit: formData.credit,
        total: calculateTotalFromFormData(formData),
        volunteer_initials: formData.volunteerInitials,
        waived: formData.waived,
        // Add item counts dynamically
        ...Object.fromEntries(
          items.map(item => [
            item.payment_column_name,
            formData.itemCounts[item.id.toString()] || 0
          ]))
      };

      const { data, error } = await supabase
        .from('Payments')
        .insert([paymentData])
        .select();

      if (error) {
        if (error.code === '23505') {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Car number for today already exists. Please use a different car number or look it up to update it.',
            confirmButtonText: 'OK'
          });
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to create payment: ${error.message}`,
          confirmButtonText: 'OK'
        });
        return;
      }

      if (data) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Payment submitted successfully!',
          confirmButtonText: 'OK'
        });
        router.push('/'); // Redirect to home or another page
      }
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PaymentForm
      items={items}
      onSubmit={handleSubmit}
      submitButtonText="Create Payment"
      isSubmitting={isSubmitting}
    />
  );
};