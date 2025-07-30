'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { createTypedClient } from 'src/utils/supabase/typed-client';
import type { Item, Payment } from 'src/types/database';
import { getTodayDate } from 'src/utils/date';

import { PaymentForm, PaymentFormData } from './paymentForm';

type Props = {
  items: Item[];
  carNum: number;
}

export const EditPayment: FC<Props> = ({ items, carNum }) => {
  const router = useRouter();

  const supabase = createTypedClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the existing payment data
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('Payments')
          .select('*')
          .eq('car_number', carNum)
          .eq('date', getTodayDate())
          .single();

        if (fetchError) {
          console.error('Error fetching payment:', fetchError);
          setError('Failed to load payment data');
          return;
        }

        setPayment(data);
      }
      catch (error_) {
        console.error('Unexpected error fetching payment:', error_);
        setError('An unexpected error occurred while loading payment data');
      }
      finally {
        setLoading(false);
      }
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

      console.log('Updating payment with data:', updateData);
      const { data, error: updateError } = await supabase
        .from('Payments')
        .update(updateData)
        .eq('car_number', carNum)
        .eq('date', getTodayDate())
        .select();

      if (updateError) {
        console.error('Error updating payment:', updateError);
        alert('Failed to update payment. Please try again.');

        return;
      }

      if (data) {
        alert('Payment updated successfully!');
        router.push('/'); // Redirect to home or another page
      }
    }
    catch (updateError) {
      console.error('Unexpected error:', updateError);
      alert('An unexpected error occurred. Please try again.');
    }
    finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading payment data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
