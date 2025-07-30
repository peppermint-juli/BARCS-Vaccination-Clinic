'use client';
import { FC, useEffect, useState } from 'react';
import { sumBy } from 'lodash';

import styled from 'styled-components';
import { createTypedClient } from 'src/utils/supabase/typed-client';


export type TabOption = {
  name: string
  value: string
}

const Styled = styled.div`
  .payments-section {
    display: flex;
    flex-direction: column;
    margin-top: 2rem;
    gap: 2rem;
  }

  field {
    display: flex;
    gap: 2rem;
  }
`;

export type SimplifiedPayment = {
  rabies: number;
  distemper: number;
  car_number: number;
}

type Props = {
  serverVaxCounts: SimplifiedPayment[]
}

export const Dashboard: FC<Props> = ({ serverVaxCounts }) => {

  const supabase = createTypedClient();
  const [totalRabies, setTotalRabies] = useState(0);
  const [totalDistemper, setTotalDistemper] = useState(0);
  const [vaxCounts, setVaxCounts] = useState<SimplifiedPayment[]>(serverVaxCounts);

  useEffect(() => {
    const rabiesSum = sumBy(vaxCounts, 'rabies');
    const distemperSum = sumBy(vaxCounts, 'distemper');

    setTotalRabies(rabiesSum);
    setTotalDistemper(distemperSum);

  }, [vaxCounts]);

  useEffect(() => {
    const channels = supabase.channel('custom-all-channel')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Payments'
        },
        (payload) => {
          console.log('Change received!', payload);
          switch (payload.eventType) {
            case 'INSERT': {
              setVaxCounts(prevVaxCounts => [...prevVaxCounts, payload.new as SimplifiedPayment]);
              break;
            }

            case 'UPDATE': {
              const updatedPaymentIndex = vaxCounts.findIndex(p => p.car_number === payload.new.car_number);
              if (updatedPaymentIndex !== -1) {
                const updatedVaxCounts = [...vaxCounts];
                updatedVaxCounts[updatedPaymentIndex] = payload.new as SimplifiedPayment;
                setVaxCounts(updatedVaxCounts);
              }

              break;
            }

            default: {
              break;
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };
  }, [supabase]);

  return (
    <Styled>
      <div className="payments-section">
        <h1>Total Vaccine Counts</h1>
        <div className="field">
          <h3>Rabies:</h3>
          <p>{totalRabies}</p>
        </div>
        <div className="field">
          <h3>Distemper:</h3>
          <p>{totalDistemper}</p>
        </div>
      </div>

    </Styled>
  );
};