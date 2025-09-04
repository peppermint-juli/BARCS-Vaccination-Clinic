'use client';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Dialog, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, Checkbox, FormControlLabel } from '@mui/material';

import { Item } from 'src/types/database';
import { ItemCount } from './itemsGrid';

const StyledDialog = styled(Dialog)`
  min-width: 500px; 
  
  .loading-container {
    display: flex;
    justify-content: center;
    padding: 2rem;
  }
  
`;


type Props = {
  items: Item[];
  isOpen: boolean;
  handleClose: (itemCount: ItemCount) => void;
  editingItem?: ItemCount | null;
}

export const ItemDialog: FC<Props> = ({ items, isOpen, handleClose, editingItem }) => {
  const [name, setName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [waived, setWaived] = useState<boolean>(false);
  const [refunded, setRefunded] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setName(editingItem.name);
        setQuantity(editingItem.quantity);
        setWaived(editingItem.waived);
        setRefunded(editingItem.refunded);
      } else {
        setName('');
        setQuantity(1);
        setWaived(false);
        setRefunded(false);
      }
    }
  }, [isOpen, editingItem]);

  const saveItem = () => {
    if (!name) return;
    const newItem: ItemCount = {
      name: name || '',
      quantity,
      subtotal: quantity * (items.find(item => item.name === name)?.price || 0),
      waived,
      refunded
    };
    handleClose(newItem);
  };

  return <StyledDialog open={isOpen}>
    <DialogContent className="dialog-content">
      <FormControl className="form-control" fullWidth>
        <h5>Item Name</h5>
        <Select
          value={name}
          onChange={(e) => setName(e.target.value)}
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
          disabled={!!editingItem}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {items.map((item) => (
            <MenuItem key={item.id} value={item.name}>
              {item.name} (${item.price.toFixed(2)})
            </MenuItem>
          ))}
        </Select>
        <h5>Quantity</h5>
        <TextField
          id="quantity"
          label="Quantity"
          variant="outlined"
          value={quantity}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (!isNaN(val) && val >= 0) {
              setQuantity(val);
            } else if (e.target.value === '') {
              setQuantity(0);
            }
          }}
          required
        />
        <div className="checkboxes">
          <FormControlLabel control={
            <Checkbox
              checked={waived}
              onChange={(e) => setWaived(e.target.checked)}
            />
          } label="Waived" />
          <FormControlLabel control={
            <Checkbox
              checked={refunded}
              onChange={(e) => setRefunded(e.target.checked)}
            />
          } label="Refunded" />
        </div>
      </FormControl>
    </DialogContent>
    <DialogActions>
      <Button onClick={saveItem} color="primary">
        {editingItem ? 'Save' : 'Add'}
      </Button>
    </DialogActions>
  </StyledDialog>;
};