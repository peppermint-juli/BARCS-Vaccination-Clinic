import { FC } from 'react';
import styled from 'styled-components';
import { CalendarToday as CalendarTodayIcon } from '@mui/icons-material';

import { getTodayDateOnly } from 'src/utils/date';


interface Props {
  children: any
}

export type TabOption = {
  name: string
  value: string
}

const Styled = styled.div`
  a {
    color: ${({ theme }) => theme.colors.secondary};
  }

  .calendar {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header {
    margin: 3% 5% 2% 8%;
  }

  .content {
    margin: 3% 2% 2% 5%;
  }
`;

export const mediaQuery = 500;

export const Layout: FC<Props> = ({ children }) => {
  return (
    <Styled>
      <main>
        <div className="header">
          <h1>BARCS</h1>
          <h2>Vaccination Clinic</h2>
          <div className="calendar">
            <CalendarTodayIcon />
            <p>{getTodayDateOnly()}</p>
          </div>
        </div>
        {children}
      </main>
    </Styled>
  );
};