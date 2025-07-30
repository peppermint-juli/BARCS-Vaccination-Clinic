import { cookies } from 'next/headers';

import { getTodayDate } from 'src/utils/date';
import { createTypedServerClient } from 'src/utils/supabase/typed-client';

import { Dashboard } from 'components/contents/dashboard/dashboard';

// TODO: imp loading animation here
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createTypedServerClient(cookieStore);

  const { data: vaxCounts, error } = await supabase
    .from('Payments')
    .select('rabies, distemper, car_number')
    .eq('date', getTodayDate());

  console.log({ vaxCounts, error });
  console.log('DashboardPage rendered');


  return (
    <Dashboard serverVaxCounts={vaxCounts || []} />
  );
};
