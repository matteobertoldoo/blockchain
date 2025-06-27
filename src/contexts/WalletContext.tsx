import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Box, Button, HStack, Text, useToast } from '@chakra-ui/react';

// Ethereum connector
const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56, 97], // Add your supported chain IDs
});

interface WalletContextType {
  isEthereumConnected: boolean;
  isSolanaConnected: boolean;
  connectEthereum: () => void;
  disconnectEthereum: () => void;
  ethereumAddress: string | undefined;
  solanaAddress: string | undefined;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { active, account, activate, deactivate } = useWeb3React();
  const { connected, publicKey, disconnect } = useWallet();
  const toast = useToast();

  const connectEthereum = async () => {
    try {
      await activate(injected);
      toast({
        title: 'Connected to Ethereum',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to connect to Ethereum',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const disconnectEthereum = () => {
    deactivate();
    toast({
      title: 'Disconnected from Ethereum',
      status: 'info',
      duration: 3000,
    });
  };

  return (
    <WalletContext.Provider
      value={{
        isEthereumConnected: active,
        isSolanaConnected: connected,
        connectEthereum,
        disconnectEthereum,
        ethereumAddress: account,
        solanaAddress: publicKey?.toString(),
      }}
    >
      <Box position="fixed" top={4} right={4} zIndex={1000}>
        <HStack spacing={4}>
          {active ? (
            <Button onClick={disconnectEthereum} colorScheme="red">
              Disconnect ETH
            </Button>
          ) : (
            <Button onClick={connectEthereum} colorScheme="blue">
              Connect ETH
            </Button>
          )}
          <WalletMultiButton />
        </HStack>
      </Box>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}; 