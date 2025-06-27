import { Box, Container, Heading, Text, Button, VStack, Image, Link, Grid, GridItem, Flex, Icon, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, chakra } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaBitcoin, FaShieldAlt, FaTrophy, FaMoneyBillWave, FaChartLine, FaHandshake } from 'react-icons/fa'

const Feature = ({ icon, title, text }: { icon: React.ReactElement, title: string, text: string }) => {
  return (
    <VStack spacing={4} align="start" p={6} bg="white" borderRadius="lg" boxShadow="md" _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }} transition="all 0.3s">
      <Flex
        w={16}
        h={16}
        align="center"
        justify="center"
        color="white"
        rounded="full"
        bg="blue.500"
        mb={1}
      >
        {icon}
      </Flex>
      <Heading size="md">{title}</Heading>
      <Text color="gray.600">{text}</Text>
    </VStack>
  )
}

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box bg="blue.600" color="white" py={20} position="relative" overflow="hidden">
        <Box 
          position="absolute" 
          top="0" 
          right="0" 
          width="full" 
          height="full" 
          opacity="0.1"
          bgImage="url('/background-image.jpg')"
          bgSize="cover"
          bgPosition="center"
          zIndex="0"
        />
        <Container maxW="container.xl" position="relative" zIndex="1">
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={10} alignItems="center">
            <GridItem>
              <VStack align="flex-start" spacing={6}>
                <Heading as="h1" size="2xl">
                  Bet Smarter with <chakra.span color="yellow.300">BetZilla</chakra.span>
                </Heading>
                <Text fontSize="xl" maxW="lg">
                  The decentralized sports betting platform where you control your funds and bets.
                  Experience transparent, secure, and fair betting with blockchain technology.
                </Text>
                <Flex gap={4} mt={4}>
                  <Link as={RouterLink} to="/betting" _hover={{ textDecoration: 'none' }}>
                    <Button size="lg" colorScheme="yellow" _hover={{ bg: "yellow.400" }}>
                      Start Betting
                    </Button>
                  </Link>
                  <Link as={RouterLink} to="/profile" _hover={{ textDecoration: 'none' }}>
                    <Button size="lg" variant="outline" colorScheme="white" _hover={{ bg: "whiteAlpha.200" }}>
                      My Profile
                    </Button>
                  </Link>
                </Flex>
              </VStack>
            </GridItem>
            <GridItem display={{ base: "none", lg: "block" }}>
              <Box
                position="relative"
                overflow="hidden"
                borderRadius="xl"
                boxShadow="2xl"
                transition="transform 0.3s ease"
                _hover={{ transform: "scale(1.02)" }}
              >
                <Image 
                  src="/hero-image.jpg"
                  alt="Sports Betting" 
                  width="full"
                  height="400px"
                  objectFit="cover"
                  fallbackSrc="https://via.placeholder.com/600x400?text=Sports+Betting"
                />
                <Box
                  position="absolute"
                  bottom="0"
                  left="0"
                  right="0"
                  bg="rgba(0,0,0,0.7)"
                  p={4}
                  color="white"
                >
                  <Text fontWeight="bold">BetZilla - The Future of Sports Betting</Text>
                </Box>
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={16} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading textAlign="center">Platform Stats</Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} width="full">
              <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                <StatLabel>Total Users</StatLabel>
                <StatNumber>10,500+</StatNumber>
                <StatHelpText>Growing daily</StatHelpText>
              </Stat>
              <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                <StatLabel>Matches Available</StatLabel>
                <StatNumber>850+</StatNumber>
                <StatHelpText>From top leagues</StatHelpText>
              </Stat>
              <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                <StatLabel>Total Bets Placed</StatLabel>
                <StatNumber>125,000+</StatNumber>
                <StatHelpText>Since launch</StatHelpText>
              </Stat>
              <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
                <StatLabel>Current Jackpot</StatLabel>
                <StatNumber>₿ 25.5</StatNumber>
                <StatHelpText>Worth ~$950,000</StatHelpText>
              </Stat>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={16}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading textAlign="center">Why Choose BetZilla</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
              <Feature
                icon={<Icon as={FaBitcoin} w={10} h={10} />}
                title="Crypto-Native"
                text="Bet with BTC, ETH, and our native BETZ token with low transaction fees and instant payouts."
              />
              <Feature
                icon={<Icon as={FaShieldAlt} w={10} h={10} />}
                title="Secure & Transparent"
                text="All bets are recorded on the blockchain, ensuring immutability and complete transparency."
              />
              <Feature
                icon={<Icon as={FaTrophy} w={10} h={10} />}
                title="Global Competitions"
                text="Bet on matches from Premier League, La Liga, Serie A, Bundesliga, and many more."
              />
              <Feature
                icon={<Icon as={FaMoneyBillWave} w={10} h={10} />}
                title="Competitive Odds"
                text="Enjoy some of the most competitive odds in the industry with higher potential returns."
              />
              <Feature
                icon={<Icon as={FaChartLine} w={10} h={10} />}
                title="Advanced Analytics"
                text="Access comprehensive match statistics and betting trends to make informed decisions."
              />
              <Feature
                icon={<Icon as={FaHandshake} w={10} h={10} />}
                title="Referral Program"
                text="Refer friends and earn a percentage of their betting activity for life."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bg="blue.500" color="white" py={20}>
        <Container maxW="container.xl">
          <VStack spacing={6} textAlign="center">
            <Heading>Ready to Place Your First Bet?</Heading>
            <Text fontSize="xl" maxW="2xl">
              Join thousands of bettors who have already discovered the future of sports betting. 
              Start with as little as 0.001 BTC.
            </Text>
            <Link as={RouterLink} to="/betting" _hover={{ textDecoration: 'none' }} mt={4}>
              <Button colorScheme="yellow" size="lg">
                Explore Upcoming Matches
              </Button>
            </Link>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}

export default Home 