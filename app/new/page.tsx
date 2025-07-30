import { NewPayment } from 'components/contents/payment/newPayment';
import { cookies } from 'next/headers';
import Swal from 'sweetalert2';

import { createTypedServerClient } from 'src/utils/supabase/typed-client';

// TODO: imp loading animation here
export default async function NewPaymentPage() {
  const cookieStore = await cookies();
  const supabase = createTypedServerClient(cookieStore);

  // Fetch data from items table with full typing
  const { data, error } = await supabase.from('Items').select('*');

  if (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `Failed to fetch items: ${error.message}`,
      confirmButtonText: 'OK'
    });
  }

  // data is now fully typed as Item[]
  return (
    <NewPayment items={data || []} />
  );
};
