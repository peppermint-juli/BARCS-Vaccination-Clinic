import { EditPayment } from 'components/contents/payment/editPayment';
import { cookies } from 'next/headers';
import Swal from 'sweetalert2';

import { createTypedServerClient } from 'src/utils/supabase/typed-client';

export default async function Page({ params }: {
  params: Promise<{ id: string }>
}) {
  const cookieStore = await cookies();
  const supabase = createTypedServerClient(cookieStore);

  const { id } = await params;

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

  return <EditPayment items={data || []} carNum={Number.parseInt(id, 10)} />;
}