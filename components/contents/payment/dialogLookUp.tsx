'use client';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Autocomplete, TextField } from '@mui/material';

import { createTypedClient } from 'src/utils/supabase/typed-client';
import { getTodayDate } from 'src/utils/date';

const Styled = styled.div`
  
  .loading-container {
    display: flex;
    justify-content: center;
    padding: 2rem;
  }
  
  .error-message {
    color: #d32f2f;
    text-align: center;
    padding: 1rem;
  }
  
  .no-payments {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
`;


type Props = {
  isOpen: boolean;
  handleClose: (carNum: number | null) => void;
}

export const DialogLookUp: FC<Props> = ({ isOpen, handleClose }) => {
  const supabase = createTypedClient();
  const [carNumbers, setCarNumbers] = useState<number[]>([]);
  const [value, setValue] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Fetch car numbers for today's payments
  const fetchTodaysCarNumbers = async () => {

    const todayDate = getTodayDate();
    const { data, error } = await supabase
      .from('Payments')
      .select('car_number')
      .eq('date', todayDate)
      .order('car_number', { ascending: true });

    // Since car numbers are unique for a given date, we can use them directly
    const uniqueCarNumbers = data?.map(payment => payment.car_number) || [];
    setCarNumbers(uniqueCarNumbers);
  };

  // Fetch car numbers when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchTodaysCarNumbers();
    }
  }, [isOpen]);

  return <Styled>
    <Dialog onClose={() => handleClose(value)} open={isOpen}>
      <DialogTitle>Look up car by number</DialogTitle>
      <DialogContent className="dialog-content">
        <Autocomplete
          disablePortal
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue || null);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          options={carNumbers}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Car Number" />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(value)} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  </Styled>;
};