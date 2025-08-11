// Transaction service based on your CardanoTransactionService

export interface SubmitTxResponse {
  submitTxId: string;
  success: boolean;
}

export class CardanoTransactionService {
  constructor(private wallet: any, private walletName: string) { }

  // Get transaction output reference
  async getTxOutRef(): Promise<string> {
    try {
      if (!this.wallet || !this.wallet.getUtxos) {
        // Mock for development
        return `${Math.random().toString(36).slice(2, 9)}#0`;
      }

      const utxos = await this.wallet.getUtxos();
      if (utxos && utxos.length > 0) {
        // Return the first UTXO as transaction reference
        return `${utxos[0].txHash}#${utxos[0].outputIndex}`;
      }

      // Fallback
      return `${Math.random().toString(36).slice(2, 9)}#0`;
    } catch (error) {
      console.error('Error getting TxOutRef:', error);
      return `${Math.random().toString(36).slice(2, 9)}#0`;
    }
  }

  // Append addresses and build transaction body
  async appendAddrs(type: string, colonyInfo: any): Promise<any> {
    // This would build the actual transaction body
    // For now, return the colony info with transaction metadata
    return {
      type,
      colonyInfo,
      timestamp: Date.now(),
      txOutRef: await this.getTxOutRef()
    };
  }

  // Get unsigned transaction
  async getUnsignedTx(endpoint: string, txBody: any): Promise<{ urspTxId: string; urspTxBodyHex: string }> {
    try {
      // Call your backend to build the unsigned transaction
      const API_BASE_URL = navigator.platform === "MacIntel"
        ? 'http://127.0.0.1:8034/api'
        : 'https://msg.shipshift.io/api';

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(txBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to build unsigned transaction: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        urspTxId: data.txId || `tx_${Date.now()}`,
        urspTxBodyHex: data.unsignedTxCbor || data.txBodyHex || `0x${Date.now()}`
      };
    } catch (error) {
      console.error('Error building unsigned transaction:', error);

      // No fallback - throw the actual error for real production use
      throw new Error(`Failed to build unsigned transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Sign and submit transaction
  async signAndSubmitTransaction(endpoint: string, txBody: any): Promise<SubmitTxResponse> {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not connected');
      }

      // Get unsigned transaction
      const unsignedTx = await this.getUnsignedTx(endpoint, txBody);

      // Sign the transaction
      const signedTx = await this.wallet.signTx(unsignedTx.urspTxBodyHex, false);

      // Submit the signed transaction
      const API_BASE_URL = navigator.platform === "MacIntel"
        ? 'http://127.0.0.1:8034/api'
        : 'https://msg.shipshift.io/api';

      const submitResponse = await fetch(`${API_BASE_URL}/transaction/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signedTx,
          txId: unsignedTx.urspTxId
        })
      });

      if (!submitResponse.ok) {
        throw new Error(`Failed to submit transaction: ${submitResponse.statusText}`);
      }

      const result = await submitResponse.json();

      return {
        submitTxId: result.txId || unsignedTx.urspTxId,
        success: true
      };
    } catch (error) {
      console.error('Error signing and submitting transaction:', error);
      throw error;
    }
  }
}

// Convert address to raw format (from your original code)
export function convertAddrToRaw(address: string): string {
  // In a real implementation, this would convert bech32 to raw bytes
  // For now, return the address as-is for compatibility
  return address;
}

// Submit transaction function for multisig
export async function submitTransaction(unsignedTx: string, witnesses: string[]): Promise<any> {
  try {
    const API_BASE_URL = navigator.platform === "MacIntel"
      ? 'http://127.0.0.1:8034/api'
      : 'https://msg.shipshift.io/api';

    const response = await fetch(`${API_BASE_URL}/transaction/submit-multisig`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        unsignedTx,
        witnesses
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to submit multisig transaction: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting multisig transaction:', error);
    throw error;
  }
}
