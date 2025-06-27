import { ChakraProvider, Box, CSSReset, extendTheme } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Betting from './pages/Betting'
import Profile from './pages/Profile'
import { web3Service } from './services/web3Service'

// Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db3ff',
      400: '#1a9dff',
      500: '#0086e6',
      600: '#006bb8',
      700: '#00508a',
      800: '#00365c',
      900: '#001b2e',
    },
  },
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
})

function App() {
  const [walletConnected, setWalletConnected] = useState<boolean>(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    // Check if wallet is already connected
    const checkWalletConnection = async () => {
      try {
        const address = await web3Service.getCurrentAddress()
        if (address) {
          setWalletConnected(true)
          setWalletAddress(address)
        }
      } catch (error) {
        console.error("Failed to get wallet address:", error)
      }
    }

    checkWalletConnection()

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletConnected(true)
        setWalletAddress(accounts[0])
      } else {
        setWalletConnected(false)
        setWalletAddress(null)
      }
    }

    // Setup event listeners for wallet changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
    }

    // Cleanup event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  const handleConnect = async () => {
    try {
      const address = await web3Service.connect()
      if (address) {
        setWalletConnected(true)
        setWalletAddress(address)
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const handleDisconnect = () => {
    setWalletConnected(false)
    setWalletAddress(null)
    // Note: MetaMask doesn't actually support programmatic disconnection
    // This just clears our local state
  }

  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Router>
        <Box minH="100vh">
          <Navbar 
            isConnected={walletConnected} 
            address={walletAddress} 
            onConnect={handleConnect} 
            onDisconnect={handleDisconnect} 
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/betting" element={<Betting />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  )
}

export default App
