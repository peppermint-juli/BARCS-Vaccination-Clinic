import { EditPayment } from 'components/contents/payments/editPayment';
import { cookies } from 'next/headers';
import Swal from 'sweetalert2';

import { createTypedServerClient } from 'src/utils/supabase/typed-client';
import { getTodayDate } from 'src/utils/date';

export default async function Page({ params }: {
  params: Promise<{ id: string }>
}) {
  const cookieStore = await cookies();
  const supabase = createTypedServerClient(cookieStore);

  const { id } = await params;

  // Fetch data from items table with full typing
  const { data: items, error: itemsError } = await supabase.from('Items').select('*');
  const { data: registration, error: registrationError } = await supabase
    .from('Registration')
    .select('*')
    .eq('car_number', id)
    .eq('date', getTodayDate())
    .single()

  if (itemsError || registrationError) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `Failed to fetch items: ${itemsError?.message || registrationError?.message}`,
      confirmButtonText: 'OK'
    });
  }

  return <EditPayment items={items || []} registration={registration!} />;
}