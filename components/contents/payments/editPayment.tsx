'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

import { createTypedClient } from 'src/utils/supabase/typed-client';
import type { Item, Registration } from 'src/types/database';
import { getTodayDate } from 'src/utils/date';

import { RegistrationFormData, RegistrationForm } from 'components/contents/form/registrationForm';

type Props = {
  items: Item[];
  registration?: Registration;
}

export const EditPayment: FC<Props> = ({ items, registration }) => {
  const router = useRouter();

  const supabase = createTypedClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: RegistrationFormData) => {
    setIsSubmitting(true);

    try {
      // Create update data with dynamic item counts
      const updateData = {
        car_number: formData.carNum!,
        cash: formData.cash,
        credit: formData.credit,
        total: formData.total,
        payment_volunteer_initials: formData.paymentVolunteerInitials,
        items: formData.items,
        num_cats: formData.numCats,
        num_dogs: formData.numDogs,
        comments: formData.comments,
        tags: formData.tags
      };

      const { data, error: updateError } = await supabase
        .from('Registration')
        .update(updateData)
        .eq('car_number', formData.carNum)
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
        router.push('/registrations'); // Redirect to home or another page
      }
    }
    finally {
      setIsSubmitting(false);
    }
  };

  if (!registration) {
    return <div>Car not found</div>;
  }

  return (
    <RegistrationForm
      items={items}
      existingRegistration={registration}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isEditing
    />
  );
};
