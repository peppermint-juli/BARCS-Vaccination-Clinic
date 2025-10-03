'use client';
import { FC, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import styled from 'styled-components';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Button, Chip } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

import { TabMenu } from 'components/common/tabs';
import { sortAlphaNum } from 'src/utils/sort';

export type TabOption = {
  name: string
  value: string
}

const Styled = styled.div`
  .new-registration {
    display: flex;
    flex-direction: column;
    align-items: end;
    margin: 2rem;
  }

  .grid {
    margin: 1rem;

    .MuiDataGrid-columnHeader {
      font-style: normal;
      font-size: 14px;
      letter-spacing: 0.25px;
      font-weight: 600;
      text-transform: capitalize;
      .MuiCheckbox-root {
        height: 100%;        
        padding: 15px;
      }
    }

    .MuiDataGrid-cell {
        padding: 12px 25px;
        font-weight: 500;
        border-top: 1px solid #E0E0E0;
        display: flex;
        align-items: center;
    }
    
  }
`;

type Payment = { car_number: string; num_dogs: number; num_cats: number; id: number; paid: boolean; };

type Props = {
  payments: Payment[];
};

export const PaymentList: FC<Props> = ({ payments }) => {

  const router = useRouter();

  const columns: GridColDef<Payment>[] = [
    {
      field: 'car_number',
      headerName: 'Car #',
      flex: 1
    },
    {
      field: 'paid',
      headerName: 'Payment Status',
      flex: 1.5,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Paid' : 'Unpaid'}
          color={params.value ? 'success' : 'error'}
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      flex: 0.7,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon className="run-icon" />}
          label="Edit"
          onClick={() => router.push(`/edit/${params.row.car_number}`)}
        />
      ]
    }
  ];

  const paymentsSorted = useMemo(() => {

    const sorted = [...payments].sort(sortAlphaNum);
    console.log(sorted);

    return sorted;
  }, [payments]);

  return (
    <Styled>
      <TabMenu />
      <div className="content">
        <h1>Payments</h1>
        <div className="new-registration">
          <Button variant="contained" color="primary" onClick={() => router.push('/registrations/new')}>
            New Registration
          </Button>
        </div>
        <DataGrid
          rowHeight={60}
          rows={paymentsSorted}
          columns={columns}
          className="grid"
        />
      </div>

    </Styled>
  );
};