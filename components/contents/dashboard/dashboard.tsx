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
  paid: boolean;
}

type Props = {
  serverVaxCounts: SimplifiedRegistration[]
}

export const Dashboard: FC<Props> = ({ serverVaxCounts }) => {

  const supabase = createTypedClient();
  const [totalDogsPaid, setTotalDogsPaid] = useState<number>(0);
  const [totalCatsPaid, setTotalCatsPaid] = useState<number>(0);
  const [totalRabiesPaid, setTotalRabiesPaid] = useState<number>(0);
  const [totalDistemperPaid, setTotalDistemperPaid] = useState<number>(0);

  const [totalDogsUnpaid, setTotalDogsUnpaid] = useState<number>(0);
  const [totalCatsUnpaid, setTotalCatsUnpaid] = useState<number>(0);
  const [totalRabiesUnpaid, setTotalRabiesUnpaid] = useState<number>(0);
  const [totalDistemperUnpaid, setTotalDistemperUnpaid] = useState<number>(0);

  const [vaxCounts, setVaxCounts] = useState<SimplifiedRegistration[]>(serverVaxCounts);

  useEffect(() => {
    const [vaxCountsPaid, vaxCountsUnpaid] = partition(vaxCounts, reg => reg.paid);

    const itemsArraysPaid = vaxCountsPaid.map(reg => reg.items);
    const allItemsPaid = itemsArraysPaid.flat();
    const rabiesPaid = sumBy(allItemsPaid, (item: any) => item['name'] === 'Rabies' ? item['quantity'] : 0);
    const distemperPaid = sumBy(allItemsPaid, (item: any) => item['name'] === 'Distemper' ? item['quantity'] : 0);

    setTotalDogsPaid(sumBy(vaxCountsPaid, 'num_dogs'));
    setTotalCatsPaid(sumBy(vaxCountsPaid, 'num_cats'));
    setTotalRabiesPaid(rabiesPaid);
    setTotalDistemperPaid(distemperPaid);

    const itemsArraysUnpaid = vaxCountsUnpaid.map(reg => reg.items);
    const allItemsUnpaid = itemsArraysUnpaid.flat();
    const rabiesUnpaid = sumBy(allItemsUnpaid, (item: any) => item['name'] === 'Rabies' ? item['quantity'] : 0);
    const distemperUnpaid = sumBy(allItemsUnpaid, (item: any) => item['name'] === 'Distemper' ? item['quantity'] : 0);

    setTotalDogsUnpaid(sumBy(vaxCountsUnpaid, 'num_dogs'));
    setTotalCatsUnpaid(sumBy(vaxCountsUnpaid, 'num_cats'));
    setTotalRabiesUnpaid(rabiesUnpaid);
    setTotalDistemperUnpaid(distemperUnpaid);

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
          <p>{totalDogsUnpaid}</p>
        </div>
        <div className="field">
          <h3>Number of Cats:</h3>
          <p>{totalCatsUnpaid}</p>
        </div>
        <h2>Total Vaccine Counts</h2>
        <div className="field">
          <h3>Total Rabies:</h3>
          <p>{totalRabiesUnpaid}</p>
        </div>
        <div className="field">
          <h3>Total Distemper:</h3>
          <p>{totalDistemperUnpaid}</p>
        </div>
        <br />
        <h1>Paid</h1>
        <h2>Total Animal Counts</h2>
        <div className="field">
          <h3>Number of Dogs:</h3>
          <p>{totalDogsPaid}</p>
        </div>
        <div className="field">
          <h3>Number of Cats:</h3>
          <p>{totalCatsPaid}</p>
        </div>
        <h2>Total Vaccine Counts</h2>
        <div className="field">
          <h3>Total Rabies:</h3>
          <p>{totalRabiesPaid}</p>
        </div>
        <div className="field">
          <h3>Total Distemper:</h3>
          <p>{totalDistemperPaid}</p>
        </div>
      </div>

    </Styled>
  );
};