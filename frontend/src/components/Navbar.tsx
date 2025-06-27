import { Box, Flex, Button, Link as ChakraLink, HStack, Spacer, useDisclosure, IconButton, Collapse, Icon, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { FaWallet, FaFootballBall, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface NavbarProps {
  isConnected: boolean;
  address: string | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

const Navbar = ({ isConnected, address, onConnect, onDisconnect }: NavbarProps) => {
  const { isOpen, onToggle } = useDisclosure()
  
  return (
    <Box 
      as="nav" 
      bg="blue.600" 
      color="white" 
      px={{ base: 4, md: 8 }}
      py={4}
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="lg"
    >
      <Flex align="center" maxW="container.xl" mx="auto">
        {/* Logo & Brand */}
        <ChakraLink as={Link} to="/" _hover={{ textDecoration: 'none' }}>
          <Flex align="center">
            <Icon as={FaFootballBall} mr={2} boxSize={6} />
            <Text 
              fontWeight="bold" 
              fontSize="xl"
              bgGradient="linear(to-r, gray.100, blue.100)"
              bgClip="text"
            >
              BetZilla
            </Text>
          </Flex>
        </ChakraLink>
        
        <Spacer />
        
        {/* Mobile menu toggle */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onToggle}
          icon={isOpen ? <FaTimes /> : <FaBars />}
          variant="ghost"
          aria-label="Toggle Navigation"
          size="lg"
        />
        
        {/* Desktop Navigation */}
        <HStack 
          spacing={8} 
          display={{ base: 'none', md: 'flex' }}
          ml={10}
        >
          <ChakraLink 
            as={Link} 
            to="/" 
            fontWeight="medium"
            _hover={{ textDecoration: 'none', color: 'blue.100' }}
          >
            Home
          </ChakraLink>
          <ChakraLink 
            as={Link} 
            to="/betting" 
            fontWeight="medium"
            _hover={{ textDecoration: 'none', color: 'blue.100' }}
          >
            Betting
          </ChakraLink>
          <ChakraLink 
            as={Link} 
            to="/profile" 
            fontWeight="medium"
            _hover={{ textDecoration: 'none', color: 'blue.100' }}
          >
            Profile
          </ChakraLink>
        </HStack>
        
        <Spacer />
        
        {/* Connect Wallet Button */}
        {isConnected ? (
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            <Text fontSize="sm" opacity={0.8}>
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
            </Text>
            <Button 
              colorScheme="red" 
              size="sm" 
              leftIcon={<FaSignOutAlt />} 
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          </HStack>
        ) : (
          <Button 
            colorScheme="green" 
            size="sm" 
            leftIcon={<FaWallet />} 
            onClick={onConnect}
            display={{ base: 'none', md: 'flex' }}
          >
            Connect Wallet
          </Button>
        )}
      </Flex>
      
      {/* Mobile Navigation Collapse */}
      <Collapse in={isOpen} animateOpacity>
        <Box 
          py={4} 
          mt={2}
          borderTop="1px" 
          borderColor="blue.500"
          display={{ md: 'none' }}
        >
          <Flex direction="column" gap={4}>
            <ChakraLink 
              as={Link} 
              to="/" 
              fontWeight="medium"
              px={2}
              py={1}
              rounded={'md'}
              _hover={{ bg: 'blue.500' }}
            >
              Home
            </ChakraLink>
            <ChakraLink 
              as={Link} 
              to="/betting" 
              fontWeight="medium"
              px={2}
              py={1}
              rounded={'md'}
              _hover={{ bg: 'blue.500' }}
            >
              Betting
            </ChakraLink>
            <ChakraLink 
              as={Link} 
              to="/profile" 
              fontWeight="medium"
              px={2}
              py={1}
              rounded={'md'}
              _hover={{ bg: 'blue.500' }}
            >
              Profile
            </ChakraLink>
            {isConnected ? (
              <Flex direction="column" gap={2}>
                <Text fontSize="sm">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                </Text>
                <Button 
                  colorScheme="red" 
                  size="sm" 
                  leftIcon={<FaSignOutAlt />} 
                  onClick={onDisconnect}
                >
                  Disconnect
                </Button>
              </Flex>
            ) : (
              <Button 
                colorScheme="green" 
                size="sm" 
                leftIcon={<FaWallet />} 
                onClick={onConnect}
              >
                Connect Wallet
              </Button>
            )}
          </Flex>
        </Box>
      </Collapse>
    </Box>
  )
}

export default Navbar 