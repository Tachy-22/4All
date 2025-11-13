'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProfile, useLanguage, useInteractionMode } from '@/hooks/useProfile';
import { useVoice } from '@/hooks/useVoice';
import { useAdaptiveUI } from '@/hooks/useAdaptiveUI';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Download,
  Mic,
  MicOff,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'transfer' | 'bill_payment' | 'deposit' | 'withdrawal';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  recipient?: string;
  sender?: string;
  description: string;
  reference: string;
  timestamp: number;
  timeline: TransactionTimelineEvent[];
  metadata: {
    channel: string;
    location?: string;
    confirmationMethod?: string;
  };
}

interface TransactionTimelineEvent {
  status: string;
  timestamp: number;
  description: string;
  location?: string;
}

export function TransactionTrackerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const profile = useProfile();
  const language = useLanguage();
  const interactionMode = useInteractionMode();
  const { speak, startListening, stopListening, isSupported, transcript, clearTranscript } = useVoice();
  const { trackEvent, trackVoiceInteraction, trackTextInteraction } = useAnalytics();
  const { t } = useTranslation();
  const adaptiveUI = useAdaptiveUI();

  useEffect(() => {
    loadTransactions();
    speak("Transaction tracker loaded. You can search by reference number or say 'show pending transactions'.");
    trackEvent('transaction_tracker_view');
  }, [speak, trackEvent]);

  useEffect(() => {
    filterTransactions();
  }, [searchQuery, statusFilter, typeFilter, transactions]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      // Fetch real transaction data from API
      const response = await fetch('/api/transactions?limit=20&offset=0', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        throw new Error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      speak("Failed to load transactions. Showing offline data.");

      // Fallback to mock data when API is unavailable
      const mockTransactions: Transaction[] = [
        {
          id: 'txn_001',
          type: 'transfer',
          status: 'completed',
          amount: 50000,
          currency: 'NGN',
          recipient: 'John Doe',
          description: 'Salary transfer',
          reference: 'TXN001234567',
          timestamp: Date.now() - 3600000,
          timeline: [
            { status: 'initiated', timestamp: Date.now() - 3600000, description: 'Transfer initiated' },
            { status: 'processing', timestamp: Date.now() - 3300000, description: 'Processing payment' },
            { status: 'completed', timestamp: Date.now() - 3000000, description: 'Transfer successful' }
          ],
          metadata: {
            channel: 'voice',
            location: 'Lagos',
            confirmationMethod: 'biometric'
          }
        },
        {
          id: 'txn_002',
          type: 'bill_payment',
          status: 'processing',
          amount: 12500,
          currency: 'NGN',
          recipient: 'PHCN Electricity',
          description: 'Electricity bill payment',
          reference: 'TXN001234568',
          timestamp: Date.now() - 1800000,
          timeline: [
            { status: 'initiated', timestamp: Date.now() - 1800000, description: 'Bill payment initiated' },
            { status: 'processing', timestamp: Date.now() - 1500000, description: 'Contacting service provider' }
          ],
          metadata: {
            channel: 'text',
            location: 'Lagos'
          }
        }
      ];
      setTransactions(mockTransactions);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(txn =>
        txn.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.sender?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(txn => txn.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(txn => txn.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  };

  const handleVoiceSearch = () => {
    if (!isSupported) {
      speak("Voice search is not supported on this device.");
      return;
    }

    setIsListening(true);
    speak("What would you like to search for?");
    startListening();

    // Set up a timeout to stop listening after 10 seconds
    setTimeout(() => {
      if (isListening) {
        stopListening();
        setIsListening(false);
      }
    }, 10000);
  };

  // Handle voice recognition results
  useEffect(() => {
    if (transcript && isListening) {
      setIsListening(false);

      // Process voice commands
      const command = transcript.toLowerCase();

      if (command.includes('pending')) {
        setStatusFilter('pending');
        speak(`Showing ${filteredTransactions.filter(t => t.status === 'pending').length} pending transactions.`);
      } else if (command.includes('failed')) {
        setStatusFilter('failed');
        speak(`Showing ${filteredTransactions.filter(t => t.status === 'failed').length} failed transactions.`);
      } else if (command.includes('completed')) {
        setStatusFilter('completed');
        speak(`Showing ${filteredTransactions.filter(t => t.status === 'completed').length} completed transactions.`);
      } else if (command.includes('transfer')) {
        setTypeFilter('transfer');
        speak(`Showing ${filteredTransactions.filter(t => t.type === 'transfer').length} transfers.`);
      } else if (command.includes('bill')) {
        setTypeFilter('bill_payment');
        speak(`Showing ${filteredTransactions.filter(t => t.type === 'bill_payment').length} bill payments.`);
      } else if (command.includes('clear') || command.includes('show all')) {
        setStatusFilter('all');
        setTypeFilter('all');
        setSearchQuery('');
        speak(`Showing all ${transactions.length} transactions.`);
      } else {
        setSearchQuery(transcript);
        speak(`Searching for: ${transcript}`);
      }

      trackVoiceInteraction('transaction_search', true);
      clearTranscript(); // Clear after processing
    }
  }, [transcript, isListening, filteredTransactions, transactions.length, speak, trackVoiceInteraction, clearTranscript]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string, amount: number) => {
    if (type === 'deposit' || type === 'withdrawal') {
      return type === 'deposit' ?
        <ArrowDownLeft className="w-4 h-4 text-green-500" /> :
        <ArrowUpRight className="w-4 h-4 text-red-500" />;
    }
    return amount > 0 ?
      <ArrowUpRight className="w-4 h-4 text-red-500" /> :
      <ArrowDownLeft className="w-4 h-4 text-green-500" />;
  };

  const formatAmount = (amount: number, currency: string) => {
    // Validate inputs
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '₦0.00';
    }

    if (!currency || typeof currency !== 'string') {
      currency = 'NGN'; // Default to Nigerian Naira
    }

    try {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      console.error('Error formatting amount:', error, 'amount:', amount, 'currency:', currency);
      // Fallback to simple formatting
      return `₦${amount.toLocaleString()}`;
    }
  };

  const formatDate = (timestamp: number) => {
    // Validate timestamp before formatting
    if (!timestamp || isNaN(timestamp) || !isFinite(timestamp)) {
      return 'Invalid date';
    }

    try {
      return new Intl.DateTimeFormat('en-NG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(timestamp));
    } catch (error) {
      console.error('Error formatting date:', error, 'timestamp:', timestamp);
      return 'Invalid date';
    }
  };

  const exportTransactions = () => {
    const csvData = filteredTransactions.map(txn => ({
      Reference: txn.reference,
      Type: txn.type.replace('_', ' '),
      Amount: txn.amount,
      Currency: txn.currency,
      Status: txn.status,
      Description: txn.description,
      Date: formatDate(txn.timestamp)
    }));

    // Create CSV content
    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    speak("Transaction history exported successfully.");
    trackEvent('transaction_export', { count: filteredTransactions.length });
  };

  return (
    <div className="space-y-6 p-4" style={{ fontSize: adaptiveUI.fontSize.base }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-gray-900"
            style={{ fontSize: adaptiveUI.fontSize.xl }}
          >
            Transaction Tracker
          </h1>
          <p
            className="text-gray-600 mt-1"
            style={{ fontSize: adaptiveUI.fontSize.sm }}
          >
            Track and search your transaction history
          </p>
        </div>

        <Button
          onClick={exportTransactions}
          disabled={filteredTransactions.length === 0}
          style={{
            minHeight: `${adaptiveUI.touchTarget.min}px`,
            fontSize: adaptiveUI.fontSize.sm
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by reference, description, or recipient..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    trackTextInteraction('transaction_search');
                  }}
                  className="pl-10"
                  style={{
                    minHeight: `${adaptiveUI.touchTarget.min}px`,
                    fontSize: adaptiveUI.fontSize.base
                  }}
                />
                {interactionMode === 'voice' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={handleVoiceSearch}
                    disabled={isListening}
                    aria-label="Voice search"
                    style={{ minHeight: `${adaptiveUI.touchTarget.min - 8}px` }}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </Button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              style={{
                minHeight: `${adaptiveUI.touchTarget.min}px`,
                fontSize: adaptiveUI.fontSize.base
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              style={{
                minHeight: `${adaptiveUI.touchTarget.min}px`,
                fontSize: adaptiveUI.fontSize.base
              }}
            >
              <option value="all">All Types</option>
              <option value="transfer">Transfers</option>
              <option value="bill_payment">Bill Payments</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
            </select>
          </div>

          {/* Results Summary */}
          <div
            className="mt-4 text-sm text-gray-600"
            style={{ fontSize: adaptiveUI.fontSize.sm }}
          >
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Loading transactions...
              </div>
            </CardContent>
          </Card>
        ) : filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p
                  className="text-gray-500"
                  style={{ fontSize: adaptiveUI.fontSize.base }}
                >
                  No transactions found matching your criteria.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card
              key={transaction.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTransaction(transaction)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Transaction Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(transaction.type, transaction.amount)}
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3
                            className="font-medium text-gray-900 truncate"
                            style={{ fontSize: adaptiveUI.fontSize.base }}
                          >
                            {transaction.description}
                          </h3>
                          <p
                            className="text-gray-500 text-sm mt-1"
                            style={{ fontSize: adaptiveUI.fontSize.sm }}
                          >
                            {transaction.recipient || transaction.sender} • {transaction.reference}
                          </p>
                          <p
                            className="text-gray-400 text-xs mt-1"
                            style={{ fontSize: adaptiveUI.fontSize.xs }}
                          >
                            {formatDate(transaction.timestamp)} • {transaction.metadata?.channel || 'Unknown'}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className="font-semibold text-gray-900"
                            style={{ fontSize: adaptiveUI.fontSize.base }}
                          >
                            {transaction.type === 'deposit' ? '+' : '-'}
                            {formatAmount(transaction.amount, transaction.currency)}
                          </p>
                          <div className="flex items-center justify-end mt-2">
                            {getStatusIcon(transaction.status)}
                            <Badge
                              className={`ml-2 ${getStatusColor(transaction.status)}`}
                              style={{ fontSize: adaptiveUI.fontSize.xs }}
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 p-0">
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle style={{ fontSize: adaptiveUI.fontSize.lg }}>
                    Transaction Details
                  </CardTitle>
                  <p
                    className="text-gray-600 mt-1"
                    style={{ fontSize: adaptiveUI.fontSize.sm }}
                  >
                    {selectedTransaction.reference}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTransaction(null)}
                  style={{ minHeight: `${adaptiveUI.touchTarget.min}px` }}
                >
                  Close
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6 pt-0">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p
                    className="text-lg font-semibold"
                    style={{ fontSize: adaptiveUI.fontSize.base }}
                  >
                    {formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="flex items-center mt-1">
                    {getStatusIcon(selectedTransaction.status)}
                    <Badge
                      className={`ml-2 ${getStatusColor(selectedTransaction.status)}`}
                    >
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p style={{ fontSize: adaptiveUI.fontSize.base }}>
                    {selectedTransaction.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Channel</p>
                  <p style={{ fontSize: adaptiveUI.fontSize.base }}>
                    {selectedTransaction.metadata?.channel?.replace('_', ' ') || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4
                  className="font-medium text-gray-900 mb-4"
                  style={{ fontSize: adaptiveUI.fontSize.base }}
                >
                  Transaction Timeline
                </h4>
                <div className="space-y-4">
                  {selectedTransaction.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1">
                        <p
                          className="font-medium"
                          style={{ fontSize: adaptiveUI.fontSize.sm }}
                        >
                          {event.description}
                        </p>
                        <p
                          className="text-gray-500 text-xs"
                          style={{ fontSize: adaptiveUI.fontSize.xs }}
                        >
                          {formatDate(event.timestamp)}
                          {event.location && ` • ${event.location}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h4
                  className="font-medium text-gray-900 mb-3"
                  style={{ fontSize: adaptiveUI.fontSize.base }}
                >
                  Additional Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Transaction ID:</span>
                    <span
                      className="text-sm font-mono"
                      style={{ fontSize: adaptiveUI.fontSize.xs }}
                    >
                      {selectedTransaction.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm">
                      {new Date(selectedTransaction.timestamp).toLocaleDateString('en-NG', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {selectedTransaction.metadata.location && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="text-sm">{selectedTransaction.metadata.location}</span>
                    </div>
                  )}
                  {selectedTransaction.metadata.confirmationMethod && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Confirmation:</span>
                      <span className="text-sm">{selectedTransaction.metadata.confirmationMethod}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}