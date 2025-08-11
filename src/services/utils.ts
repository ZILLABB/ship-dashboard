// Utility functions for colony operations

export async function handleColonyBadgeStorage(entryId: string, txBody: any): Promise<void> {
  try {
    console.log('Handling colony badge storage for:', entryId);
    
    // This would handle the colony badge/NFT creation and storage
    // Based on your original implementation
    
    // For now, just log the operation
    console.log('Colony badge storage completed for:', {
      entryId,
      txBody,
      timestamp: new Date().toISOString()
    });
    
    // In your actual implementation, this might:
    // 1. Create colony NFT/badge
    // 2. Store metadata on IPFS
    // 3. Update colony status
    // 4. Notify relevant parties
    
  } catch (error) {
    console.error('Error handling colony badge storage:', error);
    throw error;
  }
}

// Convert participant type for display
export function formatParticipantType(type: string): string {
  return type.replace('Type', '').replace(/([A-Z])/g, ' $1').trim();
}

// Format operator type for display
export function formatOperatorType(type: string): string {
  return type.replace('Operator', ' Operator');
}

// Validate colony data before submission
export function validateColonyData(colonyData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!colonyData.colonyName?.trim()) {
    errors.push('Colony name is required');
  }
  
  if (!colonyData.colonyParams?.creators?.length) {
    errors.push('At least one creator is required');
  }
  
  if (colonyData.colonyParams?.minActiveSignatory < 1) {
    errors.push('Minimum active signatory must be at least 1');
  }
  
  if (colonyData.colonyParams?.minActiveSignatory > colonyData.colonyParams?.creators?.length) {
    errors.push('Minimum active signatory cannot exceed number of creators');
  }
  
  if (!colonyData.colonyParams?.colonyOf?.length) {
    errors.push('At least one operator type must be selected');
  }
  
  if (colonyData.commission?.percent < 0 || colonyData.commission?.percent > 100) {
    errors.push('Commission percent must be between 0 and 100');
  }
  
  if (!colonyData.commission?.address?.trim()) {
    errors.push('Commission address is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
