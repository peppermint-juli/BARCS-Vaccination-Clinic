'use client';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { partition, sumBy } from 'lodash';


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
  payed: boolean;
}

type Props = {
  serverVaxCounts: SimplifiedRegistration[]
}

export const Dashboard: FC<Props> = ({ serverVaxCounts }) => {

  const supabase = createTypedClient();
  const [totalDogsPayed, setTotalDogsPayed] = useState<number>(0);
  const [totalCatsPayed, setTotalCatsPayed] = useState<number>(0);
  const [totalRabiesPayed, setTotalRabiesPayed] = useState<number>(0);
  const [totalDistemperPayed, setTotalDistemperPayed] = useState<number>(0);

  const [totalDogsUnpayed, setTotalDogsUnpayed] = useState<number>(0);
  const [totalCatsUnpayed, setTotalCatsUnpayed] = useState<number>(0);
  const [totalRabiesUnpayed, setTotalRabiesUnpayed] = useState<number>(0);
  const [totalDistemperUnpayed, setTotalDistemperUnpayed] = useState<number>(0);

  const [vaxCounts, setVaxCounts] = useState<SimplifiedRegistration[]>(serverVaxCounts);

  useEffect(() => {
    const [vaxCountsPayed, vaxCountsUnpayed] = partition(vaxCounts, reg => reg.payed);

    const itemsArraysPayed = vaxCountsPayed.map(reg => reg.items);
    const allItemsPayed = itemsArraysPayed.flat();
    const rabiesPayed = sumBy(allItemsPayed, (item: any) => item['name'] === 'Rabies' ? item['quantity'] : 0);
    const distemperPayed = sumBy(allItemsPayed, (item: any) => item['name'] === 'Distemper' ? item['quantity'] : 0);

    setTotalDogsPayed(sumBy(vaxCountsPayed, 'num_dogs'));
    setTotalCatsPayed(sumBy(vaxCountsPayed, 'num_cats'));
    setTotalRabiesPayed(rabiesPayed);
    setTotalDistemperPayed(distemperPayed);

    const itemsArraysUnpayed = vaxCountsUnpayed.map(reg => reg.items);
    const allItemsUnpayed = itemsArraysUnpayed.flat();
    const rabiesUnpayed = sumBy(allItemsUnpayed, (item: any) => item['name'] === 'Rabies' ? item['quantity'] : 0);
    const distemperUnpayed = sumBy(allItemsUnpayed, (item: any) => item['name'] === 'Distemper' ? item['quantity'] : 0);

    setTotalDogsUnpayed(sumBy(vaxCountsUnpayed, 'num_dogs'));
    setTotalCatsUnpayed(sumBy(vaxCountsUnpayed, 'num_cats'));
    setTotalRabiesUnpayed(rabiesUnpayed);
    setTotalDistemperUnpayed(distemperUnpayed);

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
        <h1>Unpaid</h1>
        <h2>Total Animal Counts</h2>
        <div className="field">
          <h3>Number of Dogs:</h3>
          <p>{totalDogsUnpayed}</p>
        </div>
        <div className="field">
          <h3>Number of Cats:</h3>
          <p>{totalCatsUnpayed}</p>
        </div>
        <h2>Total Vaccine Counts</h2>
        <div className="field">
          <h3>Total Rabies:</h3>
          <p>{totalRabiesUnpayed}</p>
        </div>
        <div className="field">
          <h3>Total Distemper:</h3>
          <p>{totalDistemperUnpayed}</p>
        </div>
        <br />
        <h1>Paid</h1>
        <h2>Total Animal Counts</h2>
        <div className="field">
          <h3>Number of Dogs:</h3>
          <p>{totalDogsPayed}</p>
        </div>
        <div className="field">
          <h3>Number of Cats:</h3>
          <p>{totalCatsPayed}</p>
        </div>
        <h2>Total Vaccine Counts</h2>
        <div className="field">
          <h3>Total Rabies:</h3>
          <p>{totalRabiesPayed}</p>
        </div>
        <div className="field">
          <h3>Total Distemper:</h3>
          <p>{totalDistemperPayed}</p>
        </div>
      </div>

    </Styled>
  );
};