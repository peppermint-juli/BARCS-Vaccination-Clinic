'use client';
import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';

import styled from 'styled-components';
import { Button } from '@mui/material';

import { DialogLookUp } from './dialogLookUp';

export type TabOption = {
  name: string
  value: string
}

const Styled = styled.div`
  .payments-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 2rem;
    gap: 2rem;
  }
`;

export const Main: FC = () => {

  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCloseDialog = (carNum: number | null) => {
    setIsDialogOpen(false);
    if (carNum !== null) {
      router.push(`/edit/${carNum}`);
    }
  };
  return (
    <Styled>
      <div className="payments-section">
        <h1>Payments</h1>
        <Button onClick={() => router.push('/new')} variant="contained" color="primary">
          New Payment
        </Button>
        <Button variant="contained" color="primary" onClick={() => setIsDialogOpen(true)}>
          Look up by Car Number
        </Button>
      </div>

      <DialogLookUp
        isOpen={isDialogOpen}
        handleClose={handleCloseDialog}
      />
    </Styled>
  );
};