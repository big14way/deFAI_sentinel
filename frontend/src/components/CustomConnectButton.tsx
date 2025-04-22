import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '../contexts/Web3ModalContext';
import WalletTroubleshooter from './WalletTroubleshooter';

interface CustomConnectButtonProps {
  showBalance?: boolean;
  chainStatus?: 'full' | 'icon' | 'name' | 'none';
}

export const CustomConnectButton: React.FC<CustomConnectButtonProps> = ({
  showBalance = true,
  chainStatus = 'icon'
}) => {
  const { isConnected } = useAccount();
  const { hasConnectionError } = useWeb3Modal();
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);

  // Show troubleshooter if there's a connection error
  const handleErrorClick = () => {
    setShowTroubleshooter(true);
  };

  const handleCloseTroubleshooter = () => {
    setShowTroubleshooter(false);
  };

  return (
    <>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected = ready && account && chain && (!hasConnectionError);
          
          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
              className="flex items-center"
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Connect Wallet
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Wrong Network
                    </button>
                  );
                }

                return (
                  <div className="flex items-center gap-3">
                    {showBalance && account.balanceFormatted && (
                      <p className="px-2 py-1 bg-gray-100 rounded-md text-sm font-medium text-gray-800">
                        {account.balanceFormatted}
                      </p>
                    )}
                    <button
                      onClick={openChainModal}
                      className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                      type="button"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            overflow: 'hidden',
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 16, height: 16 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </button>

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                    >
                      <span className="truncate max-w-[100px]">{account.displayName}</span>
                      <span className="text-gray-500">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>

      {hasConnectionError && !isConnected && (
        <button
          onClick={handleErrorClick}
          className="ml-2 text-xs bg-red-100 text-red-700 rounded-md px-2 py-1 hover:bg-red-200 transition-colors"
        >
          Fix Connection
        </button>
      )}

      {showTroubleshooter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-lg w-full mx-4">
            <div className="relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={handleCloseTroubleshooter}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <WalletTroubleshooter onClose={handleCloseTroubleshooter} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 