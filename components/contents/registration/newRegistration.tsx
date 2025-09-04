'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { Item } from 'src/types/database';
import { createTypedClient } from 'src/utils/supabase/typed-client';

import { RegistrationFormData, RegistrationForm, allowedTags } from '../form/registrationForm';
import Swal from 'sweetalert2';

export type TabOption = {
  name: string
  value: string
}

type Props = {
  itemOptions: Item[]
}

export const NewRegistration: FC<Props> = ({ itemOptions }) => {
  const router = useRouter();

  const supabase = createTypedClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: RegistrationFormData) => {
    setIsSubmitting(true);

    const registrationData = {
      car_number: formData.carNum!,
      date: new Date().toISOString().split('T')[0], // Today's date
      cash: formData.cash,
      credit: formData.credit,
      total: 0,
      registration_volunteer_initials: formData.registrationVolunteerInitials,
      payment_volunteer_initials: formData.paymentVolunteerInitials,
      items: formData.items,
      num_cats: formData.numCats,
      num_dogs: formData.numDogs,
      comments: formData.comments,
      tags: (formData.tags as string[]).filter((tag): tag is 'Walk-up' | 'Sedated' => allowedTags.includes(tag as any)),
      payed: formData.payed
    };

    const { data, error } = await supabase
      .from('Registration')
      .insert([registrationData])
      .select();

    if (error) {
      if (error.code === '23505') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Car number for today already exists. Please use a different car number or look it up to update it.',
          confirmButtonText: 'OK'
        });
        return;
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to create registration: ${error.message}`,
        confirmButtonText: 'OK'
      });
      return;
    }

    if (data) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Registration submitted successfully!',
        confirmButtonText: 'OK'
      });
      router.push('/registrations'); // Redirect to home or another page
    }

  };

  return (
    <RegistrationForm
      items={itemOptions}
      onSubmit={handleSubmit}
      submitButtonText="Submit"
      isSubmitting={isSubmitting}
    />
  );
};

