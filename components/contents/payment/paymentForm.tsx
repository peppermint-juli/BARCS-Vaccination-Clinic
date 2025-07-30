'use client';

import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Checkbox, FormControl, FormControlLabel, TextField } from '@mui/material';
import type { Item, Payment } from '../../../src/types/database';

const Styled = styled.div`
  margin-top: 2rem;

  .form {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    margin-right: 2rem;
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
`;

export interface PaymentFormData {
  carNum: number | undefined;
  itemCounts: Record<string, number>;
  credit: boolean;
  cash: boolean;
  donation: number;
  volunteerInitials: string;
  waived: boolean;
}

type Props = {
  items: Item[];
  initialData?: Partial<PaymentFormData>;
  existingPayment?: Payment;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  submitButtonText?: string;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export const PaymentForm: FC<Props> = ({
  items,
  initialData,
  existingPayment,
  onSubmit,
  submitButtonText = 'Save',
  isSubmitting = false,
  isEditing = false
}) => {
  const [carNum, setCarNum] = useState<number | undefined>();
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [credit, setCredit] = useState<boolean>(false);
  const [cash, setCash] = useState<boolean>(false);
  const [donation, setDonation] = useState<number>(0);
  const [volunteerInitials, setVolunteerInitials] = useState<string>('');
  const [waived, setWaived] = useState<boolean>(false);


  // Initialize form with existing payment data if editing
  useEffect(() => {
    if (existingPayment && items.length > 0) {
      setCarNum(existingPayment.car_number || undefined);
      setCredit(existingPayment.credit || false);
      setCash(existingPayment.cash || false);
      setDonation(0); // Donation isn't stored in Payment table, calculate from total if needed
      setVolunteerInitials(existingPayment.volunteer_initials || '');
      setWaived(existingPayment.waived || false);

      // Initialize item counts from existing payment
      const existingItemCounts: Record<string, number> = {};
      for (const item of items) {
        const columnName = item.payment_column_name;
        if (columnName && existingPayment[columnName as keyof Payment] !== undefined) {
          existingItemCounts[item.id.toString()] = Number(existingPayment[columnName as keyof Payment]) || 0;
        }
      }
      setItemCounts(existingItemCounts);
    }
  }, []);

  // Get count for a specific item
  const getItemCount = (itemId: string): number => {
    return itemCounts[itemId] || 0;
  };

  // Calculate totals with type safety
  const calculateTotal = (): number => {
    let total = 0;
    for (const item of items) {
      const count = getItemCount(item.id.toString());
      total += item.price * count;
    }
    total += donation || 0;
    return total;
  };

  // Form validation
  const isFormValid = (): boolean => {
    return !!(carNum && (credit || cash));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid()) {
      if (!carNum) {
        alert('Please enter a car number');
        return;
      }
      if (!credit && !cash) {
        alert('Please select a payment method (Credit or Cash)');
        return;
      }
    }

    const formData: PaymentFormData = {
      carNum,
      itemCounts,
      credit,
      cash,
      donation,
      volunteerInitials,
      waived
    };

    await onSubmit(formData);
  };

  return (
    <Styled>
      <div className="form">
        <FormControl fullWidth>
          <h5>Car Number</h5>
          <TextField
            id="car-number"
            disabled={isEditing}
            label="Car Number"
            variant="outlined"
            type="number"
            value={carNum || ''}
            onChange={(e) => {
              const value = e.target.value;
              setCarNum(value === '' ? undefined : Number(value));
            }}
            required
          />
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
        </FormControl>

        <h4>Items</h4>
        {items.map((item) => {
          const count = getItemCount(item.id.toString());
          const subtotal = item.price * count;

          return (
            <FormControl key={item.id} fullWidth>
              <h5>
                {item.name}
                {` - $${item.price.toFixed(2)} each`}
              </h5>
              <TextField
                id={`item-${item.id}`}
                label={`${item.name} Count`}
                variant="outlined"
                type="number"
                value={count || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const newCount = value === '' ? 0 : Number(value);
                  setItemCounts(prev => ({
                    ...prev,
                    [item.id.toString()]: newCount
                  }));
                }}
              />
              {count > 0 && (
                <p>Subtotal: ${subtotal.toFixed(2)}</p>
              )}
            </FormControl>
          );
        })}

        <FormControl fullWidth>
          <h5>Donation</h5>
          <TextField
            id="donation"
            label="Donation"
            variant="outlined"
            type="number"
            value={donation || ''}
            onChange={(e) => {
              const value = e.target.value;
              setDonation(value === '' ? 0 : Number(value));
            }} />
        </FormControl>

        <div className="total">
          <h4>Total: ${calculateTotal().toFixed(2)}</h4>
        </div>

        <FormControl fullWidth>
          <h5>Volunteer Initials</h5>
          <TextField
            id="volunteer-initials"
            label="Volunteer Initials"
            variant="outlined"
            value={volunteerInitials}
            onChange={(e) => setVolunteerInitials(e.target.value)}
          />
          <FormControlLabel control={
            <Checkbox
              checked={waived}
              className="checkboxes"
              onChange={(e) => setWaived(e.target.checked)}
            />
          } label="Waived" />
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          className="submit-button"
          disabled={!isFormValid() || calculateTotal() === 0 || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </div>
    </Styled>
  );
};
