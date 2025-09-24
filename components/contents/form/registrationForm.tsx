'use client';

import { FC, useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  Accordion,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';

import type { Item, Registration } from 'src/types/database';

import { ItemCount, ItemsGrid } from './item/itemsGrid';
import { ItemDialog } from './item/itemDialog';
import { ChangeLogEntry, ChangeLogs } from './changeLogs';
import { isEqual } from 'lodash';

const Styled = styled.div`
  margin-top: 2rem;

  .form {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    margin-right: 2rem;
  }

  .form-control {
    margin-bottom: 1rem;
  }

  .accordion {
    background-color: ${({ theme }) => theme.colors.secondary};
    color: #fff;
    font-weight: bold;
  }

  .accordion-last {
    margin-bottom: 1rem;
  }

  .checkboxes {
    display: flex;
    margin: 1rem 0;
  }

  .total {
    margin: 1rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .submit-button {
    margin: 2rem 1rem;
  }

  .new-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0;
  }

  .comments {
    margin-bottom: 1rem;
  }
`;

export interface RegistrationFormData {
  carNum: string;
  items: ItemCount[];
  credit: boolean;
  cash: boolean;
  total: number;
  numCats: number;
  numDogs: number;
  comments: string;
  tags: string[];
  payed: boolean;
  editingVolunteerInitials: string;
}

export const allowedTags = ['Walk-up', 'Sedated'] as const;

type Props = {
  items: Item[];
  existingRegistration?: Registration;
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  submitButtonText?: string;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export const RegistrationForm: FC<Props> = ({
  items,
  existingRegistration,
  onSubmit,
  submitButtonText = 'Submit',
  isSubmitting = false,
  isEditing = false
}) => {

  const [carNum, setCarNum] = useState<string>('');
  const [itemCounts, setItemCounts] = useState<ItemCount[]>([]);
  const [credit, setCredit] = useState<boolean>(false);
  const [cash, setCash] = useState<boolean>(false);
  const [numDogs, setNumDogs] = useState<number>(0);
  const [numCats, setNumCats] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [editingVolunteerInitials, setEditingVolunteerInitials] = useState<string>('');
  const [payed, setPayed] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [changeLogs, setChangeLogs] = useState<ChangeLogEntry[]>([]);

  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ItemCount | null>(null);


  const getStyles = (tag: string) => {
    const theme = useTheme();
    return {
      fontWeight: tags.includes(tag)
        ? theme.typography.fontWeightMedium
        : theme.typography.fontWeightRegular,
    };
  }
  // Initialize form with existing registration data if editing
  useEffect(() => {

    if (!isEditing) {
      setExpandedSections(['registration']);
    }

    if (existingRegistration && items.length > 0) {
      setCarNum(existingRegistration.car_number);
      setCredit(existingRegistration.credit);
      setCash(existingRegistration.cash);
      setNumDogs(existingRegistration.num_dogs);
      setNumCats(existingRegistration.num_cats);
      setComments(existingRegistration.comments || '');
      setPayed(existingRegistration.payed);
      setTags(existingRegistration.tags || []);

      // Initialize item counts from existing registration
      const existingItemCounts: ItemCount[] = (existingRegistration.items as any[]).map((item: any) => ({
        name: item?.name ?? '',
        quantity: item?.quantity ?? 0,
        refunded: item?.refunded ?? false,
        waived: item?.waived ?? false,
        subtotal: (item?.quantity ?? 0) * (items.find(i => i.name === item?.name)?.price || 0)
      }));
      setItemCounts(existingItemCounts);

      // Initialize change logs from existing registration
      const existingChangeLogs: ChangeLogEntry[] = (existingRegistration.change_log as any[]).map((log: any) => ({
        action: log?.action ?? '',
        timestamp: log?.timestamp ?? '',
        volunteer_initials: log?.volunteer_initials ?? ''
      }));
      setChangeLogs(existingChangeLogs);

    }
  }, []);

  const total = useMemo<number>(() => {
    return itemCounts.reduce((acc, item) => acc + item.subtotal, 0);
  }, [itemCounts]);

  const handleOnSubmit = async () => {
    Swal.fire({
      title: 'Submit Registration',
      text: 'Are you sure you want to submit? \n \nPlease enter your first name and last name initial to confirm.',
      input: 'text',
      inputPlaceholder: 'E.g., John D.',
      preConfirm: (initials) => {
        if (!initials) {
          Swal.showValidationMessage('Volunteer Name is required');
        } else {
          setEditingVolunteerInitials(initials);
        }
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const formData: RegistrationFormData = {
          carNum,
          items: itemCounts,
          credit,
          cash,
          total,
          numCats,
          numDogs,
          comments,
          tags,
          payed,
          editingVolunteerInitials
        };

        await onSubmit(formData);
      }
    });

  };

  const handleAccordionChange = (panel: string) => {
    const isExpanded = expandedSections.includes(panel);
    let expandedSectionsTemp = expandedSections;
    if (isExpanded) {
      expandedSectionsTemp = expandedSections.filter(section => section !== panel);
    }
    else {
      expandedSectionsTemp = [...expandedSections, panel];
    }
    setExpandedSections([...expandedSectionsTemp]);
  };

  const handleItemDialogClose = (itemCount: ItemCount) => {
    if (editingItem) {
      // Update existing item
      setItemCounts(itemCounts.map(item => item.name === editingItem.name ? itemCount : item));
    } else {
      // Add new item
      setItemCounts([...itemCounts, itemCount]);
    }
    setIsItemDialogOpen(false);
    setEditingItem(null);
  };

  const handleEditItem = (item: ItemCount) => {
    setItemCounts(itemCounts.filter(i => isEqual(i, item) === false));
  };

  const handleTagsChange = (event: SelectChangeEvent<typeof tags>) => {
    const {
      target: { value },
    } = event;
    setTags(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <Styled className="content">
      <h2>{isEditing ? 'Edit Registration' : 'New Registration'}</h2>
      <Alert severity={payed ? 'success' : 'error'}>{payed ? 'This registration is marked as payed.' : 'This registration is not marked as payed.'}</Alert>
      <div className="form">
        <FormControl className="form-control" fullWidth>
          <h5>Car Number</h5>
          <TextField
            id="car-number"
            disabled={isEditing}
            label="Car Number"
            variant="outlined"
            value={carNum || ''}
            onChange={(e) => setCarNum(e.target.value)}
            required
          />
        </FormControl>

        <Accordion
          expanded={expandedSections.includes('registration')}
          onChange={() => handleAccordionChange('registration')}
          className="accordion"
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="registration-content"
            id="registration-header"
          >
            <Typography component="h3">
              Registration
            </Typography>
          </AccordionSummary>
        </Accordion>

        {expandedSections.includes('registration') &&
          <FormControl className="form-control" fullWidth>
            <h5>Number of Dogs</h5>
            <TextField
              id="num-dogs"
              label="Number of Dogs"
              variant="outlined"
              value={numDogs}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val) && val >= 0) {
                  setNumDogs(val);
                } else if (e.target.value === '') {
                  setNumDogs(0);
                }
              }}
            />
            <h5>Number of Cats</h5>
            <TextField
              id="num-cats"
              label="Number of Cats"
              variant="outlined"
              value={numCats}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val) && val >= 0) {
                  setNumCats(val);
                } else if (e.target.value === '') {
                  setNumCats(0);
                }
              }}
            />
            <h5>Tags</h5>
            <Select
              labelId="demo-multiple-chip-label"
              id="demo-multiple-chip"
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
                  style={getStyles(tag)}
                >
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
        <Accordion
          expanded={expandedSections.includes('payment')}
          onChange={() => handleAccordionChange('payment')}
          className="accordion"
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="payment-content"
            id="payment-header"
          >
            <Typography component="h3" sx={{ width: '33%', flexShrink: 0 }}>
              Payment
            </Typography>
            <Chip color="warning" label={`Total: $${total.toFixed(2)}`} />
          </AccordionSummary>
        </Accordion>

        {expandedSections.includes('payment') &&
          <div>
            <div className="new-item-header">
              <h4>Items</h4>
              <Button variant="contained" color="primary" onClick={() => { setIsItemDialogOpen(true); setEditingItem(null); }}>
                Add item
              </Button>
            </div>
            <ItemsGrid items={itemCounts} deleteItem={handleEditItem} />
            <div className="checkboxes">
              <FormControlLabel control={
                <Checkbox
                  checked={credit}
                  onChange={(e) => setCredit(e.target.checked)}
                />
              } label="Credit" />
              <FormControlLabel control={
                <Checkbox
                  checked={cash}
                  onChange={(e) => setCash(e.target.checked)}
                />
              } label="Cash" />
            </div>
            <div className="total">
              <h4>Total: ${total.toFixed(2)}</h4>
              {!payed &&
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setPayed(true);
                  }}
                >
                  Mark as Payed
                </Button>
              }
            </div>
            <ItemDialog
              items={items}
              isOpen={isItemDialogOpen}
              handleCancel={() => { setIsItemDialogOpen(false); setEditingItem(null); }}
              handleClose={handleItemDialogClose}
              editingItem={editingItem}
            />
          </div>
        }

        <Accordion
          expanded={expandedSections.includes('comments')}
          onChange={() => handleAccordionChange('comments')}
          className="accordion"
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="comments-content"
            id="comments-header"
          >
            <Typography component="h3" >
              Comments
            </Typography>
          </AccordionSummary>
        </Accordion>

        {expandedSections.includes('comments') &&
          <TextField
            id="comments"
            label="Comments"
            className="comments"
            placeholder="Type comments here..."
            multiline
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        }

        <Accordion
          expanded={expandedSections.includes('change-logs')}
          onChange={() => handleAccordionChange('change-logs')}
          className="accordion accordion-last"
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="change-logs-content"
            id="change-logs-header"
          >
            <Typography component="h3" >
              Change Logs
            </Typography>
          </AccordionSummary>
        </Accordion>

        {expandedSections.includes('change-logs') &&
          <ChangeLogs logs={changeLogs} />
        }
        <Alert severity={payed ? 'success' : 'error'}>{payed ? 'This registration is marked as payed.' : 'This registration is not marked as payed.'}</Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOnSubmit}
          className="submit-button"
          disabled={carNum === ''}
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </div>
    </Styled>
  );
};
