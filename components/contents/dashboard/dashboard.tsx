'use client';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { sumBy } from 'lodash';


import { createTypedClient } from 'src/utils/supabase/typed-client';
import { Json } from 'src/types/supabase';

import { TabMenu } from 'components/common/tabs';


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

export type SimplifiedRegistration = {
  num_dogs: number;
  num_cats: number;
  items: Json[];
  car_number: string;
}

type Props = {
  serverVaxCounts: SimplifiedRegistration[]
}

export const Dashboard: FC<Props> = ({ serverVaxCounts }) => {

  const supabase = createTypedClient();
  const [totalDogs, setTotalDogs] = useState<number>(0);
  const [totalCats, setTotalCats] = useState<number>(0);
  const [totalRabies, setTotalRabies] = useState<number>(0);
  const [totalDistemper, setTotalDistemper] = useState<number>(0);
  const [vaxCounts, setVaxCounts] = useState<SimplifiedRegistration[]>(serverVaxCounts);

  useEffect(() => {
    const itemsArrays = vaxCounts.map(reg => reg.items);
    const allItems = itemsArrays.flat();
    const rabies = sumBy(allItems, (item: any) => item['name'] === 'Rabies' ? item['quantity'] : 0);
    const distemper = sumBy(allItems, (item: any) => item['name'] === 'Distemper' ? item['quantity'] : 0);

    setTotalDogs(sumBy(vaxCounts, 'num_dogs'));
    setTotalCats(sumBy(vaxCounts, 'num_cats'));
    setTotalRabies(rabies);
    setTotalDistemper(distemper);

  }, [vaxCounts]);

  useEffect(() => {
    const channels = supabase.channel('custom-all-channel')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Registration'
        },
        (payload) => {
          console.log('Change received!', payload);
          switch (payload.eventType) {
            case 'INSERT': {
              setVaxCounts(prevVaxCounts => [...prevVaxCounts, payload.new as SimplifiedRegistration]);
              break;
            }

            case 'UPDATE': {
              const updatedPaymentIndex = vaxCounts.findIndex(p => p.car_number === payload.new.car_number);
              if (updatedPaymentIndex !== -1) {
                const updatedVaxCounts = [...vaxCounts];
                updatedVaxCounts[updatedPaymentIndex] = payload.new as SimplifiedRegistration;
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
      <TabMenu />
      <div className="content payments-section">
        <h1>Total Animal Counts</h1>
        <div className="field">
          <h3>Number of Dogs:</h3>
          <p>{totalDogs}</p>
        </div>
        <div className="field">
          <h3>Number of Cats:</h3>
          <p>{totalCats}</p>
        </div>
        <h1>Total Vaccine Counts</h1>
        <div className="field">
          <h3>Total Rabies:</h3>
          <p>{totalRabies}</p>
        </div>
        <div className="field">
          <h3>Total Distemper:</h3>
          <p>{totalDistemper}</p>
        </div>
      </div>

    </Styled>
  );
};