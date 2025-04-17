import pandas as pd
import numpy as np
from typing import List, Dict

class TransactionFeatureExtractor:
    def __init__(self):
        self.historical_transactions = pd.DataFrame()
        self.address_profiles = {}
        
    def extract_basic_features(self, transaction: Dict) -> np.ndarray:
        """
        Extract basic features from a transaction
        """
        return np.array([
            float(transaction['value']),
            float(transaction['gasPrice']),
            float(transaction['gasUsed']),
            self._get_address_frequency(transaction['from']),
            self._get_address_frequency(transaction['to'])
        ])
        
    def extract_temporal_features(self, transactions: List[Dict]) -> np.ndarray:
        """
        Extract temporal features from a sequence of transactions
        """
        df = pd.DataFrame(transactions)
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')
        
        # Time-based features
        features = []
        for _, group in df.groupby('from'):
            group = group.sort_values('timestamp')
            
            # Transaction frequency
            tx_frequency = len(group) / (
                (group['timestamp'].max() - group['timestamp'].min()).total_seconds() / 3600
            )
            
            # Value velocity
            value_velocity = group['value'].astype(float).sum() / len(group)
            
            # Gas price volatility
            gas_volatility = group['gasPrice'].astype(float).std()
            
            features.append([tx_frequency, value_velocity, gas_volatility])
            
        return np.array(features)
        
    def extract_network_features(self, transactions: List[Dict]) -> np.ndarray:
        """
        Extract network-based features from transaction graph
        """
        # Create transaction graph
        from_addresses = set()
        to_addresses = set()
        edges = set()
        
        for tx in transactions:
            from_addresses.add(tx['from'])
            to_addresses.add(tx['to'])
            edges.add((tx['from'], tx['to']))
            
        # Calculate network metrics
        out_degree = {addr: sum(1 for e in edges if e[0] == addr) for addr in from_addresses}
        in_degree = {addr: sum(1 for e in edges if e[1] == addr) for addr in to_addresses}
        
        features = []
        for addr in from_addresses:
            features.append([
                out_degree.get(addr, 0),
                in_degree.get(addr, 0),
                len(edges) / (len(from_addresses) * len(to_addresses))  # Graph density
            ])
            
        return np.array(features)
        
    def _get_address_frequency(self, address: str) -> float:
        """
        Get the frequency of an address in historical transactions
        """
        return self.address_profiles.get(address, {}).get('frequency', 0.0)
        
    def update_address_profiles(self, transactions: List[Dict]) -> None:
        """
        Update address profiles with new transactions
        """
        for tx in transactions:
            for addr in [tx['from'], tx['to']]:
                if addr not in self.address_profiles:
                    self.address_profiles[addr] = {'count': 0, 'frequency': 0.0}
                self.address_profiles[addr]['count'] += 1
                
        # Update frequencies
        total_tx = sum(profile['count'] for profile in self.address_profiles.values())
        for addr in self.address_profiles:
            self.address_profiles[addr]['frequency'] = (
                self.address_profiles[addr]['count'] / total_tx
            ) 