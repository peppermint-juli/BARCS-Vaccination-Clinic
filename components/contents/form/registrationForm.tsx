'use client';

import { FC, useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  Accordion,
  AccordionSummary,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
  Typography
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

import type { Item, Registration } from 'src/types/database';
import { ItemCount, ItemsGrid } from './item/itemsGrid';
import { ItemDialog } from './item/itemDialog';

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
    width: 110%;
    background-color: ${({ theme }) => theme.colors.secondary};
    color: #fff;
    font-weight: bold;
  }

  .checkboxes{
    display: flex;
    margin: 1rem 0;
  }

  .total {
    margin: 1rem 0;
  }
  
  .submit-button {
    margin: 2rem 1rem;
  }

  .new-item {
    display: flex;
    flex-direction: column;
    align-items: end;
    margin: 1rem 0;
  }
`;

export interface RegistrationFormData {
  carNum: string;
  items: ItemCount[];
  credit: boolean;
  cash: boolean;
  total: number;
  registrationVolunteerInitials: string;
  paymentVolunteerInitials: string;
  numCats: number;
  numDogs: number;
  comments: string;
  tags: string[];
}

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
  const [registrationVolunteerInitials, setRegistrationVolunteerInitials] = useState<string>('');

  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState<boolean>(false);

  // Initialize form with existing registration data if editing
  useEffect(() => {
    if (existingRegistration && items.length > 0) {
      setCarNum(existingRegistration.car_number);
      setCredit(existingRegistration.credit || false);
      setCash(existingRegistration.cash || false);
      setRegistrationVolunteerInitials(existingRegistration.registration_volunteer_initials || '');
      setNumDogs(existingRegistration.num_dogs || 0);
      setNumCats(existingRegistration.num_cats || 0);
      setComments(existingRegistration.comments || '');

      // Initialize item counts from existing registration
      const existingItemCounts: ItemCount[] = (existingRegistration.items as any[]).map((item: any) => ({
        name: item?.name ?? '',
        quantity: item?.quantity ?? 0,
        refunded: item?.refunded ?? false,
        waived: item?.waived ?? false,
        subtotal: (item?.quantity ?? 0) * (items.find(i => i.name === item?.name)?.price || 0)
      }));
      setItemCounts(existingItemCounts);

    }
  }, []);

  const total = useMemo<number>(() => {
    return itemCounts.reduce((acc, item) => acc + item.subtotal, 0);
  }, [itemCounts]);

  const handleOnSubmit = async () => {
    const formData: RegistrationFormData = {
      carNum,
      items: itemCounts,
      credit,
      cash,
      total,
      registrationVolunteerInitials,
      paymentVolunteerInitials: '',
      numCats,
      numDogs,
      comments,
      tags: []
    };

    await onSubmit(formData);
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
    setItemCounts([...itemCounts, itemCount]);
    setIsItemDialogOpen(false);
  };

  return (
    <Styled>
      <h2>{isEditing ? 'Edit Registration' : 'New Registration'}</h2>
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
            <h5>Registration Volunteer Initials</h5>
            <TextField
              id="volunteer-initials"
              disabled={isEditing}
              label="Volunteer Initials"
              variant="outlined"
              value={registrationVolunteerInitials}
              onChange={(e) => setRegistrationVolunteerInitials(e.target.value)}
            />
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
            <Typography component="span" sx={{ color: 'text.secondary' }}>
              Total: ${total.toFixed(2)}
            </Typography>
          </AccordionSummary>
        </Accordion>

        {expandedSections.includes('payment') &&
          <div>
            <h4>Items</h4>
            <div className="new-item">
              <Button variant="contained" color="primary" onClick={() => setIsItemDialogOpen(true)}>
                Add item
              </Button>
            </div>
            <ItemsGrid items={itemCounts} />
            <div className="total">
              <h4>Total: ${total.toFixed(2)}</h4>
            </div>
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
            <ItemDialog
              items={items}
              isOpen={isItemDialogOpen}
              handleClose={handleItemDialogClose}
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
            placeholder="Type comments here..."
            multiline
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        }

        <Accordion
          expanded={expandedSections.includes('change-logs')}
          onChange={() => handleAccordionChange('change-logs')}
          className="accordion"
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
          <>Change Logs</>
        }

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
