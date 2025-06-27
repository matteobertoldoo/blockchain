import React from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  useColorMode,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Matches', path: '/matches' },
    { name: 'Active Bets', path: '/active-bets' },
    { name: 'Profile', path: '/profile' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Referral', path: '/referral' },
  ];

  return (
    <Box minH="100vh" bg={bgColor}>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        w="100%"
        mb={8}
        p={8}
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <HStack spacing={8}>
          {navItems.map((item) => (
            <RouterLink key={item.path} to={item.path}>
              {item.name}
            </RouterLink>
          ))}
        </HStack>
        <IconButton
          aria-label={`Toggle ${colorMode === 'light' ? 'Dark' : 'Light'} Mode`}
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
        />
      </Flex>
      <VStack spacing={8} w="100%" p={8}>
        {children}
      </VStack>
    </Box>
  );
};

export default MainLayout; 