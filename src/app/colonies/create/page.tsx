// Modern Colony creation page with full Cardano integration

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  PlusCircle,
  X,
  Wallet,
  Users,
  Package,
  Truck,
  DollarSign
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import RoleGate from '@/components/auth/RoleGate';
import { useUserStore } from '@/stores/userStore';
import { createColony, createColonyMock, submitSignature } from '@/lib/api';
import { signPartialTx, validateCardanoAddress } from '@/lib/lucid';
import { formatCurrency, getExchangeRates, convertAdaToNaira } from '@/lib/utils';
import { CardanoTransactionService, convertAddrToRaw, SubmitTxResponse } from '@/services/transaction';
import { colonyDb, HandleMultisig, MultiSigTx } from '@/services/multisig';

type CreationStep = 'form' | 'building' | 'signing' | 'submitting' | 'complete' | 'error';
type OperatorType = 'ReserveOperator' | 'DispatchOperator';
type ParticipantType = 'RequesterType' | 'RecipientType' | 'ReserveOperatorType' | 'DispatchOperatorType';

interface MinimumCollateral {
  participantType: ParticipantType;
  currencySymbol: string;
  assetClass: string;
  value: number;
  valueInNaira?: number;
}

interface ColonyParams {
  creators: string[];
  minActiveSignatory: number;
  colonyOf: OperatorType[];
  txOutRef: string;
}

interface Commission {
  percent: number;
  address: string;
}

interface ColonyFormData {
  colonyName: string;
  description: string;
  colonyParams: ColonyParams;
  minCollateral: MinimumCollateral[];
  commission: Commission;
}

export default function CreateColonyPage() {
  const router = useRouter();
  const { walletApi, address } = useUserStore();

  // Form state
  const [colonyData, setColonyData] = useState<ColonyFormData>({
    colonyName: '',
    description: '',
    colonyParams: {
      creators: [address || ''],
      minActiveSignatory: 1,
      colonyOf: [],
      txOutRef: ''
    },
    minCollateral: [],
    commission: {
      percent: 5,
      address: address || ''
    }
  });

  // Creation flow state
  const [step, setStep] = useState<CreationStep>('form');
  const [requestId, setRequestId] = useState<string>('');
  const [unsignedTxCbor, setUnsignedTxCbor] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [exchangeRates, setExchangeRates] = useState({ adaToNgn: 742.5, adaToUsd: 0.45, usdToNgn: 1650 });

  // Current collateral being added
  const [currentCollateral, setCurrentCollateral] = useState<MinimumCollateral>({
    participantType: 'RequesterType',
    currencySymbol: '',
    assetClass: '',
    value: 0,
    valueInNaira: 0
  });

  // Load exchange rates on component mount
  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        const rates = await getExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error('Failed to load exchange rates:', error);
      }
    };

    loadExchangeRates();
  }, []);

  // Update user address when it changes
  useEffect(() => {
    if (address) {
      setColonyData(prev => ({
        ...prev,
        colonyParams: {
          ...prev.colonyParams,
          creators: prev.colonyParams.creators.length === 0 ? [address] :
                   prev.colonyParams.creators[0] === '' ? [address] : prev.colonyParams.creators
        },
        commission: {
          ...prev.commission,
          address: prev.commission.address === '' ? address : prev.commission.address
        }
      }));
    }
  }, [address]);

  // Validation logic
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate colony name
    if (!colonyData.colonyName.trim()) {
      newErrors.colonyName = "Colony name is required.";
    }

    // Validate creators
    if (colonyData.colonyParams.creators.some(creator => !creator.trim())) {
      newErrors.creators = "All creator fields must be filled out.";
    }

    // Validate creator addresses
    const invalidAddresses = colonyData.colonyParams.creators.filter(creator =>
      creator.trim() && !validateCardanoAddress(creator.trim())
    );
    if (invalidAddresses.length > 0) {
      newErrors.creators = "Invalid Cardano address format detected.";
    }

    // Validate minimum active signatory
    if (colonyData.colonyParams.minActiveSignatory < 1 ||
        colonyData.colonyParams.minActiveSignatory > colonyData.colonyParams.creators.length) {
      newErrors.minActiveSignatory = `Minimum active signatory must be between 1 and ${colonyData.colonyParams.creators.length}.`;
    }

    // Validate colony of
    if (colonyData.colonyParams.colonyOf.length === 0) {
      newErrors.colonyOf = "At least one operator type must be selected.";
    }

    // Validate commission percent
    if (colonyData.commission.percent < 0 || colonyData.commission.percent > 100) {
      newErrors.commissionPercent = "Commission percent must be between 0 and 100.";
    }

    // Validate commission address
    if (!colonyData.commission.address.trim()) {
      newErrors.commissionAddress = "Commission address is required.";
    } else if (!validateCardanoAddress(colonyData.commission.address.trim())) {
      newErrors.commissionAddress = "Invalid commission address format.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !walletApi) {
      setError('Wallet not connected');
      return;
    }

    if (!validate()) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    setError('');
    setStep('building');

    try {
      // Initialize transaction service
      const tx = new CardanoTransactionService(walletApi, 'nami'); // Use actual wallet name

      // Convert addresses to raw format
      const rawCreators = colonyData.colonyParams.creators.map(addr => convertAddrToRaw(addr));
      const rawCommissionAddr = convertAddrToRaw(colonyData.commission.address);

      // Get transaction output reference
      const txOutRef = await tx.getTxOutRef();

      // Prepare colony info in your backend format
      const colonyInfo = {
        colonyName: colonyData.colonyName,
        colonyInfo: {
          icpColonyParams: {
            cpCreators: rawCreators,
            cpMinActiveSignatory: colonyData.colonyParams.minActiveSignatory,
            cpColonyOf: colonyData.colonyParams.colonyOf,
            cpTxOutRef: txOutRef
          },
          icpMinCollateral: currentCollateral.value > 0 ? [[
            currentCollateral.participantType,
            { [`${currentCollateral.currencySymbol || 'ADA'}.${currentCollateral.assetClass || 'lovelace'}`]: currentCollateral.value }
          ]] : [],
          icpCommission: {
            cpPercent: colonyData.commission.percent,
            cpAddress: rawCommissionAddr
          }
        }
      };

      // Build transaction body
      const txBodyInitColony = await tx.appendAddrs("icp", colonyInfo.colonyInfo);
      console.log("TxBody", JSON.stringify(txBodyInitColony));

      setStep('signing');

      // Handle multisig if multiple creators
      if (colonyData.colonyParams.creators.length > 1) {
        const unsignedTx = await tx.getUnsignedTx('colony/create', txBodyInitColony);
        console.log('unsignedTx:', unsignedTx);

        // Add colony to database
        const entryId = await colonyDb.addEntry(colonyInfo);

        // Create multisig transaction
        const multiSigTx: MultiSigTx = {
          txId: unsignedTx.urspTxId,
          unsignedTx: unsignedTx.urspTxBodyHex,
          signers: rawCreators,
          mininumSigner: colonyData.colonyParams.minActiveSignatory,
          entityDbName: colonyDb.getDbName(),
          entityId: entryId
        };

        // Handle multisig signing
        const multiSigHandler = new HandleMultisig(multiSigTx, 'nami');
        await multiSigHandler.addWitness(convertAddrToRaw(address));

        // Check if signed by all witnesses
        if (await multiSigHandler.signedByAllWitnesses()) {
          setStep('submitting');
          await multiSigHandler.submitMultiSigTx();
          setRequestId(entryId);
          setStep('complete');
        } else {
          setStep('complete');
          setRequestId(entryId);
          console.log('Waiting for additional signatures...');
        }
      } else {
        // Single signature transaction
        setStep('submitting');
        const txResult: SubmitTxResponse = await tx.signAndSubmitTransaction('colony/create', txBodyInitColony);
        console.log('Submitted tx Hash:', txResult.submitTxId);

        // Add colony to database
        const entryId = await colonyDb.addEntry(colonyInfo);
        setRequestId(entryId);
        console.log("Colony Hash", `ipfs://${entryId}`);
        setStep('complete');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create colony';
      setError(errorMessage);
      setStep('error');
      console.error("Error creating colony:", err);
    }
  };

  const handleReset = () => {
    setStep('form');
    setError('');
    setRequestId('');
    setUnsignedTxCbor('');
    setErrors({});
  };

  // Helper functions for form management
  const updateColonyData = (field: keyof ColonyFormData, value: any) => {
    setColonyData(prev => ({ ...prev, [field]: value }));
  };

  const updateColonyParams = (field: keyof ColonyParams, value: any) => {
    setColonyData(prev => ({
      ...prev,
      colonyParams: { ...prev.colonyParams, [field]: value }
    }));
  };

  const updateCommission = (field: keyof Commission, value: any) => {
    setColonyData(prev => ({
      ...prev,
      commission: { ...prev.commission, [field]: value }
    }));
  };

  const addCreator = () => {
    updateColonyParams('creators', [...colonyData.colonyParams.creators, '']);
  };

  const updateCreator = (index: number, value: string) => {
    const newCreators = [...colonyData.colonyParams.creators];
    newCreators[index] = value;
    updateColonyParams('creators', newCreators);
  };

  const removeCreator = (index: number) => {
    if (colonyData.colonyParams.creators.length > 1) {
      const newCreators = colonyData.colonyParams.creators.filter((_, i) => i !== index);
      updateColonyParams('creators', newCreators);
    }
  };

  const addOperatorType = (type: OperatorType) => {
    if (!colonyData.colonyParams.colonyOf.includes(type)) {
      updateColonyParams('colonyOf', [...colonyData.colonyParams.colonyOf, type]);
    }
  };

  const removeOperatorType = (type: OperatorType) => {
    updateColonyParams('colonyOf', colonyData.colonyParams.colonyOf.filter(t => t !== type));
  };

  const updateCurrentCollateral = (field: keyof MinimumCollateral, value: any) => {
    setCurrentCollateral(prev => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    switch (step) {
      case 'form':
        return (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Colony Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-olive-600" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colony Name *
                  </label>
                  <input
                    type="text"
                    value={colonyData.colonyName}
                    onChange={(e) => updateColonyData('colonyName', e.target.value)}
                    className="modern-input w-full"
                    placeholder="Enter colony name"
                    required
                  />
                  {errors.colonyName && (
                    <p className="text-sm text-red-600 mt-1">{errors.colonyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={colonyData.description}
                    onChange={(e) => updateColonyData('description', e.target.value)}
                    className="modern-input w-full resize-none"
                    rows={3}
                    placeholder="Describe your colony's purpose and operations"
                  />
                </div>
              </div>
            </div>

            {/* Colony Parameters */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-olive-600" />
                Colony Parameters
              </h3>

              {/* Creators */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colony Creators *
                </label>
                <div className="space-y-3">
                  {colonyData.colonyParams.creators.map((creator, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={creator}
                        onChange={(e) => updateCreator(index, e.target.value)}
                        className="modern-input flex-1"
                        placeholder="Enter Cardano wallet address"
                        required
                      />
                      {colonyData.colonyParams.creators.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCreator(index)}
                          className="p-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      {index === colonyData.colonyParams.creators.length - 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addCreator}
                          className="p-2"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.creators && (
                  <p className="text-sm text-red-600 mt-1">{errors.creators}</p>
                )}
              </div>

              {/* Minimum Active Signatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Active Signatory *
                </label>
                <input
                  type="number"
                  min="1"
                  max={colonyData.colonyParams.creators.length}
                  value={colonyData.colonyParams.minActiveSignatory}
                  onChange={(e) => updateColonyParams('minActiveSignatory', parseInt(e.target.value))}
                  className="modern-input w-full"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum number of signatures required for transactions (max: {colonyData.colonyParams.creators.length})
                </p>
                {errors.minActiveSignatory && (
                  <p className="text-sm text-red-600 mt-1">{errors.minActiveSignatory}</p>
                )}
              </div>

              {/* Operator Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supported Operator Types *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => addOperatorType('ReserveOperator')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      colonyData.colonyParams.colonyOf.includes('ReserveOperator')
                        ? 'border-olive-600 bg-olive-50'
                        : 'border-gray-200 hover:border-olive-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-olive-600" />
                      <div>
                        <p className="font-medium text-gray-900">Reserve Operator</p>
                        <p className="text-sm text-gray-600">Storage and inventory management</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addOperatorType('DispatchOperator')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      colonyData.colonyParams.colonyOf.includes('DispatchOperator')
                        ? 'border-olive-600 bg-olive-50'
                        : 'border-gray-200 hover:border-olive-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-olive-600" />
                      <div>
                        <p className="font-medium text-gray-900">Dispatch Operator</p>
                        <p className="text-sm text-gray-600">Transportation and delivery</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Selected operator types */}
                {colonyData.colonyParams.colonyOf.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {colonyData.colonyParams.colonyOf.map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-olive-100 text-olive-800 rounded-full text-sm"
                      >
                        {type === 'ReserveOperator' ? <Package className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                        {type.replace('Operator', ' Operator')}
                        <button
                          type="button"
                          onClick={() => removeOperatorType(type)}
                          className="ml-1 hover:text-olive-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.colonyOf && (
                  <p className="text-sm text-red-600 mt-1">{errors.colonyOf}</p>
                )}
              </div>
            </div>

            {/* Simplified Collateral Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-olive-600" />
                Minimum Collateral (Optional)
              </h3>

              <div className="modern-card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum ADA Required
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={currentCollateral.value}
                      onChange={(e) => updateCurrentCollateral('value', parseFloat(e.target.value) || 0)}
                      placeholder="10.000000"
                      className="modern-input w-full"
                    />
                    {currentCollateral.value > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        ≈ {formatCurrency(convertAdaToNaira(currentCollateral.value, exchangeRates.adaToNgn), 'NGN')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Applies To
                    </label>
                    <select
                      value={currentCollateral.participantType}
                      onChange={(e) => updateCurrentCollateral('participantType', e.target.value)}
                      className="modern-input w-full"
                    >
                      <option value="RequesterType">All Participants</option>
                      <option value="ReserveOperatorType">Reserve Operators</option>
                      <option value="DispatchOperatorType">Dispatch Operators</option>
                    </select>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-3">
                  Set a minimum ADA collateral requirement for participants. This helps ensure commitment and reduces fraud.
                </p>
              </div>
            </div>

            {/* Commission Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-olive-600" />
                Commission Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Percentage *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={colonyData.commission.percent}
                    onChange={(e) => updateCommission('percent', parseFloat(e.target.value) || 0)}
                    className="modern-input w-full"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of delivery fees collected as commission (0-100%)
                  </p>
                  {errors.commissionPercent && (
                    <p className="text-sm text-red-600 mt-1">{errors.commissionPercent}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Address *
                  </label>
                  <input
                    type="text"
                    value={colonyData.commission.address}
                    onChange={(e) => updateCommission('address', e.target.value)}
                    placeholder="Enter Cardano wallet address"
                    className="modern-input w-full"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Wallet address where commission payments will be sent
                  </p>
                  {errors.commissionAddress && (
                    <p className="text-sm text-red-600 mt-1">{errors.commissionAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-red-800">Please fix the following errors:</h4>
                </div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!address || !walletApi}
              >
                <Building2 className="w-4 h-4 mr-2" />
                {!address ? 'Connect Wallet First' : 'Create Colony'}
              </Button>
            </div>
          </form>
        );
        
      case 'building':
        return (
          <div className="text-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Building Transaction</h3>
            <p className="text-gray-600">
              Creating your colony transaction on the Cardano blockchain...
            </p>
          </div>
        );
        
      case 'signing':
        return (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Waiting for Signature</h3>
            <p className="text-gray-600 mb-4">
              Please sign the transaction in your wallet to create the colony.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Request ID:</strong> {requestId}
              </p>
            </div>
          </div>
        );
        
      case 'submitting':
        return (
          <div className="text-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitting Transaction</h3>
            <p className="text-gray-600">
              Submitting your signed transaction to the network...
            </p>
          </div>
        );
        
      case 'complete':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Colony Created Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Your colony &quot;{colonyData.colonyName}&quot; has been created and is now active on the Cardano network.
            </p>

            {/* Colony Summary */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
              <h4 className="font-medium text-emerald-800 mb-2">Colony Summary</h4>
              <div className="space-y-1 text-sm text-emerald-700">
                <p><span className="font-medium">Name:</span> {colonyData.colonyName}</p>
                <p><span className="font-medium">Creators:</span> {colonyData.colonyParams.creators.length}</p>
                <p><span className="font-medium">Min Signatures:</span> {colonyData.colonyParams.minActiveSignatory}</p>
                <p><span className="font-medium">Commission:</span> {colonyData.commission.percent}%</p>
                <p><span className="font-medium">Operator Types:</span> {colonyData.colonyParams.colonyOf.join(', ')}</p>
                {colonyData.minCollateral.length > 0 && (
                  <p><span className="font-medium">Collateral Requirements:</span> {colonyData.minCollateral.length} types</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => router.push('/colonies')}>
                View All Colonies
              </Button>
              <Button onClick={() => router.push(`/colonies/${requestId}`)}>
                View Colony Details
              </Button>
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Creation Failed</h3>
            <p className="text-gray-600 mb-4">
              There was an error creating your colony:
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => router.push('/colonies')}>
                Back to Colonies
              </Button>
              <Button onClick={handleReset}>
                Try Again
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <RoleGate roles={['colony_owner']}>
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Create New Colony
                </CardTitle>
                {step === 'form' && (
                  <p className="text-sm text-gray-600">
                    Set up a new delivery colony to manage operations and coordinate with operators.
                  </p>
                )}
              </CardHeader>
              
              <CardContent>
                {renderStepContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </RoleGate>
    </AppLayout>
  );
}
