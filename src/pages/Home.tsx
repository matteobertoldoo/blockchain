import React from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import MainLayout from '../layouts/MainLayout';

const Home: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Mock data for featured matches
  const featuredMatches = [
    {
      id: 1,
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      date: '2024-03-20',
      odds: {
        home: 1.5,
        draw: 3.2,
        away: 4.0,
      },
    },
    {
      id: 2,
      homeTeam: 'Team C',
      awayTeam: 'Team D',
      date: '2024-03-20',
      odds: {
        home: 2.1,
        draw: 3.0,
        away: 3.5,
      },
    },
  ];

  return (
    <MainLayout>
      <VStack spacing={8} w="100%">
        <Heading>Welcome to BetZilla</Heading>
        <Text>Your decentralized sports betting platform</Text>
        
        <Box w="100%">
          <Heading size="md" mb={4}>Featured Matches</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {featuredMatches.map((match) => (
              <Box
                key={match.id}
                p={6}
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
              >
                <VStack spacing={4} align="stretch">
                  <Text fontWeight="bold" fontSize="lg">
                    {match.homeTeam} vs {match.awayTeam}
                  </Text>
                  <Text>Date: {match.date}</Text>
                  <Box>
                    <Text>Odds:</Text>
                    <Text>Home: {match.odds.home}</Text>
                    <Text>Draw: {match.odds.draw}</Text>
                    <Text>Away: {match.odds.away}</Text>
                  </Box>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </MainLayout>
  );
};

export default Home; 