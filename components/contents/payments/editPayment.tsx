'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

import { createTypedClient } from 'src/utils/supabase/typed-client';
import type { Item, Registration } from 'src/types/database';
import { getTodayDate } from 'src/utils/date';

import { RegistrationFormData, RegistrationForm, allowedTags } from 'components/contents/form/registrationForm';
import { isEqual } from 'lodash';

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
      type AllowedTag = typeof allowedTags[number];



      const updateData = {
        car_number: formData.carNum!,
        cash: formData.cash,
        credit: formData.credit,
        total: formData.total,
        items: formData.items,
        num_cats: formData.numCats,
        num_dogs: formData.numDogs,
        comments: formData.comments,
        tags: (formData.tags as string[]).filter((tag): tag is AllowedTag => allowedTags.includes(tag as AllowedTag)),
        payed: formData.payed,
        change_log: registration?.change_log || []
      };

      const changes = Object.keys(updateData).reduce((result, key) => {
        const regValue = (registration as any)[key];
        const updateValue = (updateData as any)[key];
        if (!isEqual(regValue, updateValue)) {
          result[key] = { from: regValue, to: updateValue };
        }
        return result;
      }, {} as Record<string, { from: any, to: any }>);


      updateData['change_log'] = [
        ...(registration?.change_log || []),
        {
          action: changes,
          timestamp: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          volunteer_initials: formData.editingVolunteerInitials
        }
      ];

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
        setIsSubmitting(false);
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
