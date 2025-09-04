import { FC } from 'react';
import styled from 'styled-components';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Edit as EditIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';

export type ItemCount = {
  name: string;
  quantity: number;
  subtotal: number;
  waived: boolean;
  refunded: boolean;
}

type Props = {
  items: ItemCount[];
  onEditItem?: (item: ItemCount) => void;
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

export const ItemsGrid: FC<Props> = ({ items, onEditItem }) => {
  const itemColumns: GridColDef<ItemCount>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1.2
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      flex: 0.8
    },
    {
      field: 'subtotal',
      headerName: 'Subtotal',
      flex: 1,
      valueFormatter: (value: Number) => `$${value.toFixed(2)}`
    },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1,
      renderCell: (params) => <>
        {params.row.waived && <Chip color="warning" label="Waived" />}
        {params.row.refunded && <Chip color="warning" label="Refunded" />}
      </>
    },
    {
      field: 'actions',
      type: 'actions',
      flex: 0.8,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => onEditItem?.(params.row)}
        />
      ]
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