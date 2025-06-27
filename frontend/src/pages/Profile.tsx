import { Box, Container, Heading, Text, VStack, HStack, Badge, Flex, Button, Stat, StatLabel, StatNumber, StatHelpText, useToast, Divider, SimpleGrid, Card, CardBody, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { web3Service } from '../services/web3Service'
import { matchService, PlacedBet } from '../services/matchService'

const Profile = () => {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [bets, setBets] = useState<PlacedBet[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingBets, setLoadingBets] = useState(true)
  const toast = useToast()

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const address = await web3Service.getCurrentAddress()
        setAccount(address)
        
        if (address) {
          // Get token balance
          const tokenBalance = await web3Service.getTokenBalance()
          setBalance(tokenBalance)
          
          // Get user bets
          fetchUserBets(address)
        }
      } catch (error) {
        console.error("Failed to get connected address:", error)
      } finally {
        setLoading(false)
      }
    }
    
    checkWalletConnection()
  }, [])
  
  const connectWallet = async () => {
    try {
      setLoading(true)
      const address = await web3Service.connect()
      
      if (address) {
        setAccount(address)
        // Get token balance
        const tokenBalance = await web3Service.getTokenBalance()
        setBalance(tokenBalance)
        
        // Get user bets
        fetchUserBets(address)
        
        toast({
          title: "Wallet connected!",
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect your wallet. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }
  
  const fetchUserBets = async (address: string) => {
    setLoadingBets(true)
    try {
      const userBets = await matchService.getUserBets(address)
      setBets(userBets)
    } catch (error) {
      console.error("Failed to fetch user bets:", error)
      toast({
        title: "Failed to fetch bets",
        description: "Could not retrieve your betting history",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoadingBets(false)
    }
  }
  
  const renderPredictionText = (prediction: number) => {
    switch(prediction) {
      case 0: return 'Home Win'
      case 1: return 'Draw'
      case 2: return 'Away Win'
      default: return 'Unknown'
    }
  }
  
  const renderBetStatus = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge colorScheme="blue">Pending</Badge>
      case 'won':
        return <Badge colorScheme="green">Won</Badge>
      case 'lost':
        return <Badge colorScheme="red">Lost</Badge>
      default:
        return <Badge colorScheme="gray">Unknown</Badge>
    }
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)">
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Heading color="blue.600" mb={2}>Your Profile</Heading>
          
          {loading ? (
            <Flex justify="center" align="center" p={8}>
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : account ? (
            <>
              <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="md">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                  <Box>
                    <Heading size="md" mb={4}>Account Info</Heading>
                    <Text mb={2}>
                      <strong>Address:</strong> {account.slice(0, 6)}...{account.slice(-4)}
                    </Text>
                    <Stat mt={4}>
                      <StatLabel>Your Balance</StatLabel>
                      <StatNumber>{balance} BETZ</StatNumber>
                      <StatHelpText>Use BETZ tokens to place bets</StatHelpText>
                    </Stat>
                  </Box>
                  
                  <Box>
                    <Heading size="md" mb={4}>Betting Stats</Heading>
                    <SimpleGrid columns={2} spacing={4}>
                      <Stat>
                        <StatLabel>Total Bets</StatLabel>
                        <StatNumber>{bets.length}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Pending</StatLabel>
                        <StatNumber>{bets.filter(bet => bet.status === 'pending').length}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Won</StatLabel>
                        <StatNumber>{bets.filter(bet => bet.status === 'won').length}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Lost</StatLabel>
                        <StatNumber>{bets.filter(bet => bet.status === 'lost').length}</StatNumber>
                      </Stat>
                    </SimpleGrid>
                  </Box>
                </SimpleGrid>
              </Box>
              
              <Box>
                <Heading size="md" mb={4}>Your Betting History</Heading>
                {loadingBets ? (
                  <Flex justify="center" py={8}>
                    <Spinner />
                  </Flex>
                ) : bets.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {bets.map((bet) => {
                      // Simulazione: supponiamo che le prime 20 scommesse di ogni match abbiano commissionSaved
                      const isEarlyBonus = parseInt(bet.id.split('-')[1]) < 20;
                      return (
                        <Card key={bet.id} shadow="md" borderRadius="md">
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              <HStack justify="space-between">
                                <Text fontWeight="bold">{bet.match?.homeTeam} vs {bet.match?.awayTeam}</Text>
                                {renderBetStatus(bet.status)}
                              </HStack>
                              <Divider />
                              <HStack justify="space-between">
                                <Text>Your Prediction:</Text>
                                <Badge colorScheme="blue">{renderPredictionText(bet.prediction)}</Badge>
                              </HStack>
                              <HStack justify="space-between">
                                <Text>Amount:</Text>
                                <Text fontWeight="bold">{bet.amount} BETZ</Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text>Odds:</Text>
                                <Text fontWeight="bold">{bet.odds}x</Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text>Potential win:</Text>
                                <Text fontWeight="bold">{(bet.amount * bet.odds).toFixed(2)} BETZ</Text>
                              </HStack>
                              {/* Evidenzia bonus commissione */}
                              {isEarlyBonus && (
                                <Badge colorScheme="green" mt={2}>
                                  0% Commission (Early Bettor Bonus)
                                </Badge>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </SimpleGrid>
                ) : (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>No bets yet</AlertTitle>
                      <AlertDescription>
                        You haven't placed any bets yet. Head over to the Betting page to get started!
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </Box>
            </>
          ) : (
            <Box p={8} textAlign="center">
              <Alert status="warning" borderRadius="md" mb={6}>
                <AlertIcon />
                <Box>
                  <AlertTitle>Wallet not connected</AlertTitle>
                  <AlertDescription>
                    Connect your wallet to view your profile and betting history
                  </AlertDescription>
                </Box>
              </Alert>
              <Button colorScheme="blue" size="lg" onClick={connectWallet}>
                Connect Wallet
              </Button>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  )
}

export default Profile