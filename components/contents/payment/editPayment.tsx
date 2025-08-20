'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { createTypedClient } from 'src/utils/supabase/typed-client';
import type { Item, Payment } from 'src/types/database';
import { getTodayDate } from 'src/utils/date';

import Swal from 'sweetalert2';
import { RegistrationFormData, RegistrationForm } from '../registration/form/registrationForm';

type Props = {
  items: Item[];
  carNum: string;
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
        .from('Registration')
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


  const handleSubmit = async (formData: RegistrationFormData) => {
    setIsSubmitting(true);

    try {
      // Create update data with dynamic item counts
      const updateData = {
        car_number: formData.carNum!,
        cash: formData.cash,
        credit: formData.credit,
        total: 0,
        volunteer_initials: formData.registrationVolunteerInitials,
        payment_volunteer_initials: formData.paymentVolunteerInitials,
      };

      const { data, error: updateError } = await supabase
        .from('Registration')
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
    <RegistrationForm
      items={items}
      existingRegistration={payment}
      onSubmit={handleSubmit}
      submitButtonText="Update Payment"
      isSubmitting={isSubmitting}
      isEditing
    />
  );
};
