import { cookies } from 'next/headers';
import Swal from 'sweetalert2';

import { createTypedServerClient } from 'src/utils/supabase/typed-client';
import { getTodayDateOnly } from 'src/utils/date';
import { RegistrationList } from 'components/contents/registration/registrationList';

// TODO: imp loading animation here
export default async function RegistrationPage() {

  const cookieStore = await cookies();
  const supabase = createTypedServerClient(cookieStore);

  const todayDate = getTodayDateOnly();
  // Fetch data from items table with full typing
  const { data, error } = await supabase.from('Registration')
    .select('car_number, num_dogs, num_cats, id, tags')
    .eq('date', todayDate)
    .order('car_number', { ascending: true });

  if (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `Failed to fetch items: ${error.message}`,
      confirmButtonText: 'OK'
    });
  }
  // Ensure tags is always a string array
  const registrations = (data || []).map(item => ({
    ...item,
    tags: item.tags ?? []
  }));

  return (
    <RegistrationList registrations={registrations} />
  );
};
