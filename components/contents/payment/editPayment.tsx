'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { createTypedClient } from 'src/utils/supabase/typed-client';
import type { Item, Payment } from 'src/types/database';
import { getTodayDate } from 'src/utils/date';

import { PaymentForm, PaymentFormData } from './paymentForm';
import Swal from 'sweetalert2';

type Props = {
  items: Item[];
  carNum: number;
}

export const EditPayment: FC<Props> = ({ items, carNum }) => {
  const router = useRouter();

  const supabase = createTypedClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);

  // Fetch the existing payment data
  useEffect(() => {
    const fetchPayment = async () => {
      const { data, error: fetchError } = await supabase
        .from('Payments')
        .select('*')
        .eq('car_number', carNum)
        .eq('date', getTodayDate())
        .single();

      if (fetchError) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to fetch items: ${fetchError.message}`,
          confirmButtonText: 'OK'
        });
      }

      setPayment(data);
    };

    fetchPayment();
  }, [carNum, supabase]);

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
      // Create update data with dynamic item counts
      const updateData = {
        car_number: formData.carNum!,
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

      const { data, error: updateError } = await supabase
        .from('Payments')
        .update(updateData)
        .eq('car_number', carNum)
        .eq('date', getTodayDate())
        .select();

      if (updateError) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to update payment: ${updateError.message}`,
          confirmButtonText: 'OK'
        });
        return;
      }

      if (data) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Payment updated successfully!',
          confirmButtonText: 'OK'
        });
        router.push('/'); // Redirect to home or another page
      }
    }
    finally {
      setIsSubmitting(false);
    }
  };

  if (!payment) {
    return <div>Payment not found</div>;
  }

  return (
    <PaymentForm
      items={items}
      existingPayment={payment}
      onSubmit={handleSubmit}
      submitButtonText="Update Payment"
      isSubmitting={isSubmitting}
      isEditing
    />
  );
};
