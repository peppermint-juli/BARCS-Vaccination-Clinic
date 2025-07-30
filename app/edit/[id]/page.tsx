import { EditPayment } from 'components/contents/payment/editPayment';
import { cookies } from 'next/headers';
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
    console.error('Supabase error:', error);
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Error loading data</h2>
        <p>Unable to load items data. Please try again later.</p>
      </div>
    );
  }

  return <EditPayment items={data || []} carNum={Number.parseInt(id, 10)} />;
}