import { FC, SyntheticEvent, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styled from 'styled-components';
import { Tab, Tabs } from '@mui/material';

import { AppContext } from 'src/context';
import { TabOption } from './layout';

const StyledTabs = styled(Tabs)`
  background-color:  ${({ theme }) => theme.colors.secondary};
`;

const StyledTab = styled(Tab)`
  text-transform: none;
  color: white;
`;

export const TabMenu: FC = () => {

  const { tabOption, setTabOption } = useContext(AppContext);
  const router = useRouter();
  const pathname = usePathname();

  // ON MOUNT: UI config
  useEffect(() => {
    setTabOption(pathname.split('/')[1]);
  }, [pathname]);


  const handleTabChange = (event: SyntheticEvent, newValue: string) => {
    setTabOption(newValue);
    router.push(`/${newValue}`);
  };

  const handleSameOptionClick = () => {
    router.push(`/${tabOption}`);
  };

  const tabOptions: TabOption[] = [
    { name: 'Registration', value: 'registrations' },
    { name: 'Payments', value: 'payments' },
    { name: 'Dashboard', value: 'dashboard' }
  ];

  return (
    <StyledTabs
      value={tabOption}
      onChange={handleTabChange}
      centered
      color="secondary"
      sx={{ '& .MuiTabs-flexContainer': { flexWrap: 'wrap' } }}>
      {tabOptions.map(tab =>
        <StyledTab key={tab.name} label={tab.name} value={tab.value} onClick={tabOption === tab.value ? handleSameOptionClick : () => { }} />
      )}
    </StyledTabs>
  );
};