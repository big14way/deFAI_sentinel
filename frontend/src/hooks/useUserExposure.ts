import { useState, useEffect } from 'react';
import { getUserExposures } from '../services/web3';
import { useAccount } from 'wagmi';

// Define a more flexible interface for the exposure object structure
interface UserExposure {
  protocolAddress: string;
  protocolName?: string;  // Make this optional
  amount: number;
  assets: Array<{
    tokenAddress?: string;
    tokenSymbol?: string;
    tokenName?: string;
    amount?: string;
    value?: number;
  }> | [];
}

interface UseUserExposureResult {
  exposure: number | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and manage user exposure data for a specific protocol
 * @param protocolAddress The address of the protocol to check exposure for
 * @returns Object containing exposure amount, loading state, and any error
 */
export const useUserExposure = (protocolAddress?: string): UseUserExposureResult => {
  const { address } = useAccount();
  const [exposure, setExposure] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExposure = async () => {
      if (!protocolAddress || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userExposures = await getUserExposures(address);
        
        // Find exposure for the specified protocol using a type predicate function
        const protocolExposure = userExposures.find(
          (exp) => exp.protocolAddress && exp.protocolAddress.toLowerCase() === protocolAddress.toLowerCase()
        );
        
        if (protocolExposure) {
          setExposure(protocolExposure.amount);
        } else {
          setExposure(null);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user exposure:', err);
        setError('Failed to fetch exposure data');
        setExposure(null);
      } finally {
        setLoading(false);
      }
    };

    fetchExposure();
  }, [protocolAddress, address]);

  return { exposure, loading, error };
}; 