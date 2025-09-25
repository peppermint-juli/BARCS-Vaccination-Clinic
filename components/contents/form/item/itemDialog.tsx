'use client';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  FormControlLabel,
  SelectChangeEvent,
  useTheme,
  Box,
  Chip,
  OutlinedInput
} from '@mui/material';

import { Item } from 'src/types/database';
import { ItemCount } from './itemsGrid';

const Styled = styled.div`
  padding: 1rem;
  
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
  handleCancel: () => void;
}

export const getStyles = (tag: string, tags: readonly string[]) => {
  const theme = useTheme();
  return {
    fontWeight: tags.includes(tag)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
};

const allowedTags = ['TY', 'Not needed'] as const;

export const ItemDialog: FC<Props> = ({ items, isOpen, handleClose, handleCancel }) => {
  const [name, setName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [waived, setWaived] = useState<boolean>(false);
  const [refunded, setRefunded] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);

  const handleTagsChange = (event: SelectChangeEvent<typeof tags>) => {
    const {
      target: { value },
    } = event;
    setTags(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  useEffect(() => {
    if (isOpen) {
      setName('');
      setQuantity(1);
      setWaived(false);
      setRefunded(false);
      setTags([]);
    }
  }, [isOpen]);

  const saveItem = () => {
    if (!name) return;
    const subtotal = waived ? 0 : (items.find(item => item.name === name)?.price || 0) * quantity;
    const newItem: ItemCount = {
      name: name || '',
      quantity,
      subtotal,
      waived,
      refunded,
      tags
    };
    handleClose(newItem);
  };

  useEffect(() => {
    if (refunded) {
      setQuantity(-quantity);
    }
  }, [refunded]);

  return <Dialog open={isOpen}>
    <Styled>

      <DialogContent className="dialog-content">
        <FormControl className="form-control" fullWidth>
          <h5>Item Name</h5>
          <Select
            value={name}
            onChange={(e) => setName(e.target.value)}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {items.map((item) => (
              <MenuItem key={item.id} value={item.name}>
                {item.name} {item.name === 'Donation' ? '' : `($${item.price.toFixed(2)})`}
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
          <h5>Tags</h5>
          <Select
            id="tags-chip"
            label="Tags"
            multiple
            value={tags}
            onChange={handleTagsChange}
            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {allowedTags.map((tag) => (
              <MenuItem
                key={tag}
                value={tag}
                style={getStyles(tag, tags)}
              >
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={saveItem} color="primary">
          Add
        </Button>
      </DialogActions>
    </Styled>
  </Dialog>;
};