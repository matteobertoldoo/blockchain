import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from '../../setupTests';
import Home from '../Home';

describe('Home Component', () => {
  it('renders welcome message', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('Welcome to BetZilla')).toBeInTheDocument();
    expect(screen.getByText('Your decentralized sports betting platform')).toBeInTheDocument();
  });

  it('renders featured matches section', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('Featured Matches')).toBeInTheDocument();
  });

  it('renders match cards with correct information', () => {
    renderWithProviders(<Home />);
    
    // Check for team names
    expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
    expect(screen.getByText('Team C vs Team D')).toBeInTheDocument();
    
    // Check for odds
    expect(screen.getByText('Home: 1.5')).toBeInTheDocument();
    expect(screen.getByText('Draw: 3.2')).toBeInTheDocument();
    expect(screen.getByText('Away: 4.0')).toBeInTheDocument();
  });

  it('renders match dates', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('Date: 2024-03-20')).toBeInTheDocument();
  });
}); 