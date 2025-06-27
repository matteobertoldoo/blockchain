import { Box, Container, Heading, Text, SimpleGrid, Card, CardBody, Button, VStack, Image, Badge, Flex, useToast, Alert, AlertIcon, AlertTitle, AlertDescription, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, FormControl, FormLabel } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { matchService, Match } from '../services/matchService'
import { web3Service } from '../services/web3Service'

const Betting = () => {
  const [account, setAccount] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiveData, setIsLiveData] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [selectedBetType, setSelectedBetType] = useState<'home' | 'draw' | 'away' | null>(null)
  const [betAmount, setBetAmount] = useState(10)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    // Check if MetaMask is installed and connected
    const checkConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          setAccount(accounts[0])
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
        } else {
          setAccount(null)
        }
      })
    }

    // Fetch matches from football API
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use our match service to get scheduled matches
      const matchesData = await matchService.getScheduledMatches()
      setMatches(matchesData)
      setIsLiveData(true)
    } catch (error) {
      console.error('Error fetching matches:', error)
      setError(`${error}`)
      setIsLiveData(false)
    } finally {
      setLoading(false)
    }
  }

  const openBetModal = (match: Match, betType: 'home' | 'draw' | 'away') => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to place a bet",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }
    
    setSelectedMatch(match)
    setSelectedBetType(betType)
    onOpen()
  }

  const handlePlaceBet = async () => {
    if (!account || !selectedMatch || !selectedBetType) return
    
    // Convert bet type to numeric format for smart contract
    const predictionValue = selectedBetType === 'home' ? 0 : selectedBetType === 'draw' ? 1 : 2
    
    try {
      // Show pending toast
      const pendingToastId = toast({
        title: "Processing bet...",
        description: "Your transaction is being processed. Please wait and confirm in MetaMask.",
        status: "info",
        duration: null,
        isClosable: true,
      })
      
      // Place bet using our match service
      const success = await matchService.placeBet(
        selectedMatch.id,
        predictionValue as 0 | 1 | 2,
        betAmount
      )
      
      // Close pending toast
      toast.close(pendingToastId)
      
      if (success) {
        // Find the selected odds
        const odds = selectedBetType === 'home' 
          ? selectedMatch.odds.home 
          : selectedBetType === 'draw' 
            ? selectedMatch.odds.draw 
            : selectedMatch.odds.away
            
        const potentialWin = betAmount * odds
        
        toast({
          title: "Bet Placed!",
          description: `You bet ${betAmount} BETZ on ${selectedBetType === 'home' ? selectedMatch.homeTeam : selectedBetType === 'draw' ? 'Draw' : selectedMatch.awayTeam}. Potential win: ${potentialWin.toFixed(2)} BETZ`,
          status: "success",
          duration: 5000,
          isClosable: true,
        })
        
        onClose()
      } else {
        toast({
          title: "Failed to place bet",
          description: "There was an error processing your bet. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error("Error placing bet:", error)
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const connectWallet = async () => {
    try {
      const address = await web3Service.connect()
      if (address) {
        setAccount(address)
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
    }
  }

  const getTeamLogo = (teamName: string) => {
    // Replace spaces with hyphens and make lowercase for URL-friendly format
    const formattedName = teamName.toLowerCase().replace(/\s+/g, '-')
    return `https://api.football-data.org/image/${formattedName}.png`;
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)">
      <Container maxW="container.xl" py={10}>
        <VStack align="stretch" spacing={8}>
          <Heading color="blue.600" mb={4}>Available Matches</Heading>
          
          {account ? (
            <Text color="green.500" fontWeight="medium" mb={4}>
              Wallet connected: {account.slice(0, 6)}...{account.slice(-4)} - Ready to place bets!
            </Text>
          ) : (
            <Box mb={6}>
              <Alert status="info" variant="subtle" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle>Wallet not connected</AlertTitle>
                  <AlertDescription display="block">
                    Connect your wallet to place bets on these matches!
                  </AlertDescription>
                </Box>
                <Button colorScheme="blue" size="sm" onClick={connectWallet}>
                  Connect Wallet
                </Button>
              </Alert>
            </Box>
          )}
          
          {!isLiveData && (
            <Alert status="warning">
              <AlertIcon />
              <AlertTitle>Using demo data</AlertTitle>
              <AlertDescription>
                Unable to fetch real matches from the API. Showing sample matches instead.
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <AlertTitle>Error loading matches:</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <Text>Loading matches from football API...</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {matches.map(match => {
                // Simulazione: supponiamo che i primi 20 slot siano disponibili per tutte le partite demo
                // In produzione, recupera questi dati dallo smart contract
                const EARLY_BET_THRESHOLD = 20;
                // Simula un numero casuale di slot già occupati per demo
                const earlyBets = Math.floor(Math.random() * (EARLY_BET_THRESHOLD + 1));
                const isBlindPhase = earlyBets < EARLY_BET_THRESHOLD;
                const slotsLeft = EARLY_BET_THRESHOLD - earlyBets;

                return (
                  <Card key={match.id} overflow="hidden" variant="outline" boxShadow="md" _hover={{ boxShadow: "lg" }}>
                    <Box p={4} bg="blue.500" color="white">
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="bold">{match.competition}</Text>
                        <Badge colorScheme="green">{match.date}</Badge>
                      </Flex>
                    </Box>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        {/* Early Bonus Banner */}
                        {isBlindPhase && (
                          <Box>
                            <Badge colorScheme="green" fontSize="sm" mb={2}>
                              NO COMMISSION FOR FIRST 20 BETTORS
                            </Badge>
                            <Text fontSize="xs" color="green.700" fontWeight="bold">
                              {earlyBets}/20 slots filled - {slotsLeft} left for 0% fee!
                            </Text>
                          </Box>
                        )}
                        <Flex justify="space-between" align="center">
                          <VStack>
                            <Box height="50px" width="50px" bg="gray.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                              <Text fontWeight="bold">{match.homeTeam.substring(0, 2)}</Text>
                            </Box>
                            <Text fontWeight="bold" noOfLines={1}>{match.homeTeam}</Text>
                          </VStack>
                          <Text fontWeight="extrabold" fontSize="xl">VS</Text>
                          <VStack>
                            <Box height="50px" width="50px" bg="gray.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                              <Text fontWeight="bold">{match.awayTeam.substring(0, 2)}</Text>
                            </Box>
                            <Text fontWeight="bold" noOfLines={1}>{match.awayTeam}</Text>
                          </VStack>
                        </Flex>
                        <Box borderTop="1px" borderColor="gray.200" pt={4}>
                          <Text fontWeight="bold" mb={2}>Place your bet:</Text>
                          <Flex justify="space-between" gap={2}>
                            <Button colorScheme="blue" size="sm" flex="1" onClick={() => openBetModal(match, 'home')}>
                              1 ({match.odds.home})
                            </Button>
                            <Button colorScheme="gray" size="sm" flex="1" onClick={() => openBetModal(match, 'draw')}>
                              X ({match.odds.draw})
                            </Button>
                            <Button colorScheme="purple" size="sm" flex="1" onClick={() => openBetModal(match, 'away')}>
                              2 ({match.odds.away})
                            </Button>
                          </Flex>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}
        </VStack>
      </Container>

      {/* Betting Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Place Your Bet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedMatch && selectedBetType && (
              <VStack spacing={4} align="stretch">
                <Text>
                  Match: <strong>{selectedMatch.homeTeam} vs {selectedMatch.awayTeam}</strong>
                </Text>
                <Text>
                  Your prediction: <Badge colorScheme={selectedBetType === 'home' ? 'blue' : selectedBetType === 'draw' ? 'gray' : 'purple'}>
                    {selectedBetType === 'home' ? selectedMatch.homeTeam : 
                     selectedBetType === 'draw' ? 'Draw' : 
                     selectedMatch.awayTeam}
                  </Badge>
                </Text>
                <Text>
                  Odds: <strong>{
                    selectedBetType === 'home' ? selectedMatch.odds.home : 
                    selectedBetType === 'draw' ? selectedMatch.odds.draw : 
                    selectedMatch.odds.away
                  }</strong>
                </Text>
                
                <FormControl>
                  <FormLabel>Bet Amount (BETZ)</FormLabel>
                  <NumberInput min={1} value={betAmount} onChange={(valueString) => setBetAmount(parseInt(valueString))}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <Box p={3} bg="blue.50" borderRadius="md">
                  <Text>
                    Potential win: <strong>{(betAmount * (
                      selectedBetType === 'home' ? selectedMatch.odds.home : 
                      selectedBetType === 'draw' ? selectedMatch.odds.draw : 
                      selectedMatch.odds.away
                    )).toFixed(2)} BETZ</strong>
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handlePlaceBet}>
              Confirm Bet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Betting