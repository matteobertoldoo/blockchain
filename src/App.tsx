import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme';

// Import pages (to be created)
import Home from './pages/Home';
import Matches from './pages/Matches';
import ActiveBets from './pages/ActiveBets';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Referral from './pages/Referral';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/active-bets" element={<ActiveBets />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/referral" element={<Referral />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App; 