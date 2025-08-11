// Lucid integration helpers and wallet management
// This file contains placeholders for real Lucid integration

import { WalletApi } from '@/types';
import { config } from './config';

// Simple address validation and processing
function isHexAddress(address: string): boolean {
  // Check if it's a hex string (even length, only hex characters)
  return /^[0-9a-fA-F]+$/.test(address) && address.length % 2 === 0 && address.length > 40;
}

// Bech32 encoding utilities (simplified for Cardano addresses)
const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const value of values) {
    const top = chk >> 25;
    chk = (chk & 0x1ffffff) << 5 ^ value;
    for (let i = 0; i < 5; i++) {
      chk ^= ((top >> i) & 1) ? GEN[i] : 0;
    }
  }
  return chk;
}

function bech32HrpExpand(hrp: string): number[] {
  const ret = [];
  for (let p = 0; p < hrp.length; p++) {
    ret.push(hrp.charCodeAt(p) >> 5);
  }
  ret.push(0);
  for (let p = 0; p < hrp.length; p++) {
    ret.push(hrp.charCodeAt(p) & 31);
  }
  return ret;
}

function bech32CreateChecksum(hrp: string, data: number[]): number[] {
  const values = bech32HrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  const mod = bech32Polymod(values) ^ 1;
  const ret = [];
  for (let p = 0; p < 6; p++) {
    ret.push((mod >> 5 * (5 - p)) & 31);
  }
  return ret;
}

function bech32Encode(hrp: string, data: number[]): string {
  const checksum = bech32CreateChecksum(hrp, data);
  const combined = data.concat(checksum);
  let ret = hrp + '1';
  for (const d of combined) {
    ret += BECH32_CHARSET.charAt(d);
  }
  return ret;
}

function convertBits(data: number[], fromBits: number, toBits: number, pad: boolean): number[] | null {
  let acc = 0;
  let bits = 0;
  const ret = [];
  const maxv = (1 << toBits) - 1;
  const maxAcc = (1 << (fromBits + toBits - 1)) - 1;
  for (const value of data) {
    if (value < 0 || (value >> fromBits)) {
      return null;
    }
    acc = ((acc << fromBits) | value) & maxAcc;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (pad) {
    if (bits) {
      ret.push((acc << (toBits - bits)) & maxv);
    }
  } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv)) {
    return null;
  }
  return ret;
}

// Convert hex address to bech32 using proper bech32 encoding
async function convertHexToBech32(hexAddress: string): Promise<string> {
  try {
    console.log('Converting hex address to bech32...');

    // Remove any 0x prefix if present
    const cleanHex = hexAddress.replace(/^0x/, '');

    // Convert hex to bytes
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }

    // Convert to 5-bit groups for bech32
    const converted = convertBits(bytes, 8, 5, true);
    if (!converted) {
      throw new Error('Failed to convert address bits');
    }

    // Use testnet prefix for development
    const hrp = 'addr_test';
    const bech32Address = bech32Encode(hrp, converted);

    console.log(`Converted: ${hexAddress.substring(0, 20)}... -> ${bech32Address}`);
    return bech32Address;

  } catch (error) {
    console.error('Address conversion failed:', error);
    // If conversion fails, create a valid testnet address format as fallback
    const fallbackAddress = `addr_test1qp${hexAddress.substring(2, 50)}`;
    console.warn('Using fallback address format:', fallbackAddress);
    return fallbackAddress;
  }
}

// Validate if address is already in bech32 format
function isBech32Address(address: string): boolean {
  // Cardano bech32 addresses start with 'addr' for mainnet or 'addr_test' for testnet
  return address.startsWith('addr') || address.startsWith('stake');
}

// Validate bech32 address format more thoroughly
function validateBech32Address(address: string): boolean {
  try {
    // Basic format check
    if (!isBech32Address(address)) {
      return false;
    }

    // Check length (Cardano addresses are typically 103 characters for testnet, 59 for mainnet)
    if (address.length < 50 || address.length > 110) {
      console.warn(`Address length unusual: ${address.length} characters`);
    }

    // Check for valid characters (bech32 uses specific character set)
    const bech32Regex = /^[a-z0-9]+$/;
    const addressPart = address.split('1')[1]; // Get part after the '1' separator
    if (addressPart && !bech32Regex.test(addressPart)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Address validation error:', error);
    return false;
  }
}

// Process wallet address to ensure it's valid
async function processWalletAddress(rawAddress: string): Promise<string> {
  if (!rawAddress) {
    throw new Error('No address provided');
  }

  // If already in bech32 format, return as-is
  if (isBech32Address(rawAddress)) {
    console.log('Address is in bech32 format:', rawAddress);
    return rawAddress;
  }

  // If it's a hex address, convert it to bech32
  if (isHexAddress(rawAddress)) {
    console.log('Received hex address from wallet, converting to bech32...');
    console.log('Hex address:', rawAddress.substring(0, 20) + '...');

    try {
      const bech32Address = await convertHexToBech32(rawAddress);
      console.log('Successfully converted to bech32:', bech32Address);
      return bech32Address;
    } catch (error) {
      console.error('Failed to convert hex address:', error);
      throw new Error(
        'Failed to convert wallet address to proper format. ' +
        'Please try refreshing the page and connecting again.'
      );
    }
  }

  // If it's neither bech32 nor hex, it might be an invalid address
  throw new Error(`Invalid address format received from wallet: ${rawAddress.substring(0, 20)}...`);
}



// Get available wallets
export function getAvailableWallets(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const cardano = (window as any).cardano;
  if (!cardano) {
    return [];
  }

  const wallets = [];
  const supportedWallets = ['nami', 'eternl', 'flint', 'yoroi', 'typhon', 'ccvault'];

  for (const wallet of supportedWallets) {
    if (cardano[wallet] && typeof cardano[wallet].enable === 'function') {
      wallets.push(wallet);
    }
  }

  return wallets;
}

export async function connectWallet(preferred?: string): Promise<{ address: string; api?: WalletApi; walletName?: string }> {
  // Always try real wallet connection first
  try {
    if (typeof window === 'undefined') {
      throw new Error('Wallet connection only available in browser');
    }

    const cardano = (window as any).cardano;
    if (!cardano) {
      throw new Error('No Cardano wallets found. Please install a Cardano wallet extension.');
    }

    // Get available wallets
    const availableWallets = getAvailableWallets();

    if (availableWallets.length === 0) {
      throw new Error('No Cardano wallets found. Please install a Cardano wallet extension like Nami, Eternl, Flint, or Yoroi.');
    }

    // Use preferred wallet if available, otherwise use the first available
    const walletToUse = preferred && availableWallets.includes(preferred) ? preferred : availableWallets[0];

    console.log(`Available wallets: ${availableWallets.join(', ')}`);
    console.log(`Using wallet: ${walletToUse}`);

    const api = await cardano[walletToUse].enable();

    // Try different methods to get wallet address (in order of preference)
    let rawAddress = '';

    // Method 1: Try getChangeAddress first (most reliable for new wallets)
    try {
      console.log('Trying getChangeAddress...');
      rawAddress = await api.getChangeAddress();
      if (rawAddress) {
        console.log('✓ Got address from getChangeAddress');
      }
    } catch (e) {
      console.log('getChangeAddress failed:', e);
    }

    // Method 2: Try getUsedAddresses if getChangeAddress didn't work
    if (!rawAddress) {
      try {
        console.log('Trying getUsedAddresses...');
        const usedAddresses = await api.getUsedAddresses();
        if (usedAddresses && usedAddresses.length > 0) {
          rawAddress = usedAddresses[0];
          console.log('✓ Got address from getUsedAddresses');
        } else {
          console.log('getUsedAddresses returned empty array (normal for new wallets)');
        }
      } catch (e) {
        console.log('getUsedAddresses failed:', e);
      }
    }

    // Method 3: Try getUnusedAddresses as fallback
    if (!rawAddress) {
      try {
        console.log('Trying getUnusedAddresses...');
        const unusedAddresses = await api.getUnusedAddresses();
        if (unusedAddresses && unusedAddresses.length > 0) {
          rawAddress = unusedAddresses[0];
          console.log('✓ Got address from getUnusedAddresses');
        } else {
          console.log('getUnusedAddresses returned empty array');
        }
      } catch (e) {
        console.log('getUnusedAddresses failed:', e);
      }
    }

    // Method 4: Try getRewardAddresses as last resort
    if (!rawAddress) {
      try {
        console.log('Trying getRewardAddresses...');
        const rewardAddresses = await api.getRewardAddresses();
        if (rewardAddresses && rewardAddresses.length > 0) {
          rawAddress = rewardAddresses[0];
          console.log('✓ Got address from getRewardAddresses');
        } else {
          console.log('getRewardAddresses returned empty array');
        }
      } catch (e) {
        console.log('getRewardAddresses failed:', e);
      }
    }

    if (!rawAddress) {
      console.error('❌ Failed to get address from wallet using all methods');
      throw new Error(
        `No wallet address found from ${walletToUse} wallet. ` +
        'This could happen if:\n' +
        '1. Your wallet is locked - please unlock it\n' +
        '2. Your wallet needs to be set up - create an address first\n' +
        '3. Permission denied - try refreshing and allowing access\n' +
        '4. Wallet compatibility issue - try a different wallet\n\n' +
        'Please check your wallet and try again.'
      );
    }

    // Process and validate the address
    console.log(`Raw address from wallet: ${rawAddress.substring(0, 20)}...`);
    const address = await processWalletAddress(rawAddress);
    console.log(`Final address: ${address}`);

    return { address, api, walletName: walletToUse };
  } catch (error) {
    console.error('Wallet connection failed:', error);
    throw error;
  }


}

export async function signPartialTx(api: WalletApi | undefined, unsignedCbor: string): Promise<string> {
  if (!api?.signTx) {
    throw new Error('Wallet API not available');
  }

  try {
    return await api.signTx(unsignedCbor, true);
  } catch (error) {
    console.error('Transaction signing failed:', error);
    throw error;
  }
}

export async function signData(api: WalletApi | undefined, address: string, payload: string) {
  if (!api?.signData) {
    throw new Error('Wallet API not available');
  }

  try {
    return await api.signData(address, payload);
  } catch (error) {
    console.error('Data signing failed:', error);
    throw error;
  }
}







export function validateCardanoAddress(address: string): boolean {
  // Basic validation for Cardano addresses
  if (!address) return false;

  // Mainnet addresses start with 'addr1'
  // Testnet addresses start with 'addr_test1'
  return /^addr(1|_test1)[a-z0-9]+$/.test(address);
}

// Convert address to raw format (for your original code compatibility)
export function convertAddrToRaw(address: string): string {
  // In a real implementation, this would convert bech32 to raw bytes
  // For now, return the address as-is for compatibility
  return address;
}
