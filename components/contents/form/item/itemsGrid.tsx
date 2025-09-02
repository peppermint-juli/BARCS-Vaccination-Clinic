import { FC } from 'react';
import styled from 'styled-components';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export type ItemCount = {
  name: string;
  quantity: number;
  subtotal: number;
  waived: boolean;
  refunded: boolean;
}

type Props = {
  items: ItemCount[];
}

const Styled = styled.div`
  .grid {
    width: 95%;
    border: none;

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
    }

  }
`;

export const ItemsGrid: FC<Props> = ({ items }) => {
  const itemColumns: GridColDef<ItemCount>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 100
    },
    {
      field: 'subtotal',
      headerName: 'Subtotal',
      width: 100,
      valueFormatter: (value: Number) => `$${value.toFixed(2)}`
    },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1
    }
  ];

  return <Styled>
    <DataGrid
      columns={itemColumns}
      rows={items}
      getRowId={(row) => `${row.name}-${row.quantity}`}
    />
  </Styled>;
}