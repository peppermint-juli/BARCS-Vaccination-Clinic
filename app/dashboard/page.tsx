import { cookies } from 'next/headers';

import { getTodayDate } from 'src/utils/date';
import { createTypedServerClient } from 'src/utils/supabase/typed-client';

import { Dashboard } from 'components/contents/dashboard/dashboard';

// TODO: imp loading animation here
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createTypedServerClient(cookieStore);

  const { data: vaxCounts, error } = await supabase
    .from('Registration')
    .select('num_dogs, num_cats, items, car_number')
    .eq('date', getTodayDate());


  return (
    <Dashboard serverVaxCounts={vaxCounts || []} />
  );
};
