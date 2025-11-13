'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useProfile, useInteractionMode, useUIComplexity } from '../../hooks/useProfile';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveUI, useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { ZivaAssistant } from '../ziva/ZivaAssistant';
import { 
  ArrowLeft,
  Building, 
  FileText, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Plus,
  Download,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  issuedDate: string;
}

interface CashflowData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    clientName: 'Acme Corp',
    amount: 150000,
    dueDate: '2024-01-20',
    status: 'pending',
    issuedDate: '2024-01-05'
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    clientName: 'Global Tech Ltd',
    amount: 85000,
    dueDate: '2024-01-15',
    status: 'overdue',
    issuedDate: '2023-12-28'
  },
  {
    id: '3',
    invoiceNumber: 'INV-003',
    clientName: 'StartUp Inc',
    amount: 200000,
    dueDate: '2024-01-10',
    status: 'paid',
    issuedDate: '2023-12-20'
  },
];

const mockCashflowData: CashflowData[] = [
  { month: 'Sep', income: 450000, expenses: 280000, net: 170000 },
  { month: 'Oct', income: 380000, expenses: 320000, net: 60000 },
  { month: 'Nov', income: 520000, expenses: 290000, net: 230000 },
  { month: 'Dec', income: 420000, expenses: 310000, net: 110000 },
  { month: 'Jan', income: 480000, expenses: 340000, net: 140000 },
  { month: 'Feb', income: 380000, expenses: 280000, net: 100000 }
];

export function SMEToolsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    clientName: '',
    amount: '',
    dueDate: '',
    description: ''
  });

  const router = useRouter();
  const profile = useProfile();
  const interactionMode = useInteractionMode();
  const uiComplexity = useUIComplexity();
  const { speak } = useVoice();
  const adaptiveUI = useAdaptiveUI();
  const adaptiveClasses = useAdaptiveClasses();

  useEffect(() => {
    const message = uiComplexity === 'simplified'
      ? "Welcome to business tools. Manage your invoices and track your money flow."
      : "Welcome to SME Business Tools. Here you can manage invoices, track cashflow, and get business insights to grow your business.";
    setTimeout(() => speak(message), 1000);
  }, [speak, uiComplexity]);

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-white';
      case 'overdue': return 'bg-danger text-white';
      default: return 'bg-muted-gray text-white';
    }
  };

  const totalInvoiceValue = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = mockInvoices.filter(inv => inv.status === 'paid');
  const pendingInvoices = mockInvoices.filter(inv => inv.status === 'pending');
  const overdueInvoices = mockInvoices.filter(inv => inv.status === 'overdue');

  const currentMonthCashflow = mockCashflowData[mockCashflowData.length - 1];
  const previousMonthCashflow = mockCashflowData[mockCashflowData.length - 2];
  const cashflowChange = currentMonthCashflow.net - previousMonthCashflow.net;
  const cashflowPercentChange = ((cashflowChange / previousMonthCashflow.net) * 100).toFixed(1);

  const handleCreateInvoice = async () => {
    if (!newInvoice.clientName || !newInvoice.amount) {
      speak("Please fill in the required fields.");
      return;
    }

    speak("Creating invoice...");
    // Simulate API call
    setTimeout(() => {
      speak(`Invoice created for ${newInvoice.clientName}.`);
      setShowCreateInvoice(false);
      setNewInvoice({ clientName: '', amount: '', dueDate: '', description: '' });
    }, 1000);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={cn(adaptiveClasses.card, "bg-primary-red text-white")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Invoices</p>
              <p className="text-2xl font-bold">{formatCurrency(totalInvoiceValue)}</p>
            </div>
            <FileText className="w-8 h-8 text-white/60" />
          </div>
        </Card>

        <Card className={cn(adaptiveClasses.card, "bg-success text-white")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Paid</p>
              <p className="text-2xl font-bold">{paidInvoices.length}</p>
              <p className="text-sm text-white/80">
                {formatCurrency(paidInvoices.reduce((sum, inv) => sum + inv.amount, 0))}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-white/60" />
          </div>
        </Card>

        <Card className={cn(adaptiveClasses.card, "bg-warning text-white")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Pending</p>
              <p className="text-2xl font-bold">{pendingInvoices.length}</p>
              <p className="text-sm text-white/80">
                {formatCurrency(pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0))}
              </p>
            </div>
            <Clock className="w-8 h-8 text-white/60" />
          </div>
        </Card>

        <Card className={cn(adaptiveClasses.card, "bg-danger text-white")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Overdue</p>
              <p className="text-2xl font-bold">{overdueInvoices.length}</p>
              <p className="text-sm text-white/80">
                {formatCurrency(overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0))}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-white/60" />
          </div>
        </Card>
      </div>

      {/* Cashflow Chart */}
      <Card className={adaptiveClasses.card}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={cn(adaptiveClasses.text, "text-xl font-semibold text-text")}>
              Cashflow Analysis
            </h3>
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              Your business money flow over the last 6 months
            </p>
          </div>
          <div className="text-right">
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              This month vs last month
            </p>
            <div className="flex items-center gap-1">
              {cashflowChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger" />
              )}
              <span className={cn(
                adaptiveClasses.text,
                "font-medium",
                cashflowChange >= 0 ? "text-success" : "text-danger"
              )}>
                {cashflowPercentChange}%
              </span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockCashflowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#2BA84A" 
                strokeWidth={2}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#E53E3E" 
                strokeWidth={2}
                name="Expenses"
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#0077B6" 
                strokeWidth={3}
                name="Net Cashflow"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>Income</p>
            <p className={cn(adaptiveClasses.text, "text-lg font-semibold text-success")}>
              {formatCurrency(currentMonthCashflow.income)}
            </p>
          </div>
          <div>
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>Expenses</p>
            <p className={cn(adaptiveClasses.text, "text-lg font-semibold text-danger")}>
              {formatCurrency(currentMonthCashflow.expenses)}
            </p>
          </div>
          <div>
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>Net Cashflow</p>
            <p className={cn(adaptiveClasses.text, "text-lg font-semibold text-highlight-blue")}>
              {formatCurrency(currentMonthCashflow.net)}
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button
          onClick={() => setActiveTab('invoices')}
          className={cn(
            adaptiveClasses.button,
            "h-auto p-6 bg-primary-red text-white hover:bg-primary-red/90 flex-col gap-2"
          )}
        >
          <Plus className="w-6 h-6" />
          <span>Create Invoice</span>
        </Button>

        <Button
          onClick={() => speak("Cashflow forecast: Based on current trends, you'll have ₦120,000 net cashflow next month.")}
          variant="outline"
          className={cn(
            adaptiveClasses.button,
            "h-auto p-6 flex-col gap-2"
          )}
        >
          <TrendingUp className="w-6 h-6 text-highlight-blue" />
          <span>Get Forecast</span>
        </Button>

        <Button
          variant="outline"
          className={cn(
            adaptiveClasses.button,
            "h-auto p-6 flex-col gap-2"
          )}
        >
          <Download className="w-6 h-6 text-muted-gray" />
          <span>Export Report</span>
        </Button>
      </div>

      {interactionMode === 'voice' && (
        <Card className="p-4 bg-highlight-blue/5 border-highlight-blue">
          <p className={cn(adaptiveClasses.text, "text-sm text-highlight-blue")}>
            💡 Voice Tip: Say "Create invoice for Acme Corp" or "Show me cashflow forecast" to get started quickly
          </p>
        </Card>
      )}
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className={cn(adaptiveClasses.text, "text-xl font-semibold text-text")}>
            Invoices
          </h3>
          <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
            Manage your business invoices
          </p>
        </div>
        <Button
          onClick={() => setShowCreateInvoice(true)}
          className={cn(
            adaptiveClasses.button,
            "bg-primary-red text-white hover:bg-primary-red/90"
          )}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {showCreateInvoice && (
        <Card className={adaptiveClasses.card}>
          <div className="space-y-4">
            <h4 className={cn(adaptiveClasses.text, "font-semibold text-text")}>
              Create New Invoice
            </h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className={cn(adaptiveClasses.text, "font-medium")}>
                  Client Name *
                </Label>
                <Input
                  placeholder="Enter client name"
                  value={newInvoice.clientName}
                  onChange={(e) => setNewInvoice({...newInvoice, clientName: e.target.value})}
                  className={adaptiveClasses.input}
                />
              </div>

              <div>
                <Label className={cn(adaptiveClasses.text, "font-medium")}>
                  Amount *
                </Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                  className={adaptiveClasses.input}
                />
              </div>

              <div>
                <Label className={cn(adaptiveClasses.text, "font-medium")}>
                  Due Date
                </Label>
                <Input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                  className={adaptiveClasses.input}
                />
              </div>

              <div>
                <Label className={cn(adaptiveClasses.text, "font-medium")}>
                  Description
                </Label>
                <Input
                  placeholder="Invoice description"
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                  className={adaptiveClasses.input}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateInvoice(false)}
                className={adaptiveClasses.button}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvoice}
                className={cn(
                  adaptiveClasses.button,
                  "bg-primary-red text-white hover:bg-primary-red/90"
                )}
              >
                Create Invoice
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {mockInvoices.map((invoice) => (
          <Card key={invoice.id} className={adaptiveClasses.card}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="w-6 h-6 text-muted-gray" />
                <div>
                  <h4 className={cn(adaptiveClasses.text, "font-medium text-text")}>
                    {invoice.invoiceNumber}
                  </h4>
                  <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                    {invoice.clientName}
                  </p>
                  <p className={cn(adaptiveClasses.text, "text-xs text-muted-gray")}>
                    Due: {invoice.dueDate}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={cn(adaptiveClasses.text, "text-lg font-semibold text-text")}>
                  {formatCurrency(invoice.amount)}
                </p>
                <Badge className={cn("text-xs", getStatusColor(invoice.status))}>
                  {invoice.status}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                {invoice.status === 'pending' && (
                  <Button
                    size="sm"
                    className="text-xs bg-primary-red text-white hover:bg-primary-red/90"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCashflow = () => (
    <div className="space-y-6">
      <div>
        <h3 className={cn(adaptiveClasses.text, "text-xl font-semibold text-text")}>
          Cashflow Analysis
        </h3>
        <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
          Detailed view of your business money flow
        </p>
      </div>

      <Card className={adaptiveClasses.card}>
        <h4 className={cn(adaptiveClasses.text, "font-semibold text-text mb-4")}>
          Monthly Breakdown
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockCashflowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Bar dataKey="income" fill="#2BA84A" name="Income" />
              <Bar dataKey="expenses" fill="#E53E3E" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={adaptiveClasses.card}>
          <h4 className={cn(adaptiveClasses.text, "font-semibold text-text mb-3")}>
            Cashflow Forecast
          </h4>
          <p className={cn(adaptiveClasses.text, "text-muted-gray mb-4")}>
            Based on current trends, here's your projected cashflow:
          </p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={cn(adaptiveClasses.text, "text-sm")}>Next Month</span>
              <span className={cn(adaptiveClasses.text, "font-medium text-success")}>
                +₦120,000
              </span>
            </div>
            <div className="flex justify-between">
              <span className={cn(adaptiveClasses.text, "text-sm")}>Next Quarter</span>
              <span className={cn(adaptiveClasses.text, "font-medium text-success")}>
                +₦380,000
              </span>
            </div>
            <div className="flex justify-between">
              <span className={cn(adaptiveClasses.text, "text-sm")}>Low Cash Alert</span>
              <span className={cn(adaptiveClasses.text, "font-medium text-warning")}>
                March 15th
              </span>
            </div>
          </div>
        </Card>

        <Card className={adaptiveClasses.card}>
          <h4 className={cn(adaptiveClasses.text, "font-semibold text-text mb-3")}>
            Business Insights
          </h4>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5" />
              <p className={cn(adaptiveClasses.text, "text-sm")}>
                Your income is trending upward (+12% this quarter)
              </p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
              <p className={cn(adaptiveClasses.text, "text-sm")}>
                You have ₦235,000 in overdue invoices to collect
              </p>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-highlight-blue mt-0.5" />
              <p className={cn(adaptiveClasses.text, "text-sm")}>
                Consider setting aside ₦50,000 for next month's expenses
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-gray hover:text-text"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div>
            <h1 className={cn(adaptiveClasses.heading, "text-primary-red")}>
              SME Business Tools
            </h1>
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              Manage your business finances and grow your enterprise
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn(
            "grid w-full",
            uiComplexity === 'simplified' ? 'grid-cols-2' : 'grid-cols-3'
          )}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            {uiComplexity !== 'simplified' && (
              <TabsTrigger value="cashflow">Cashflow</TabsTrigger>
            )}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview">{renderOverview()}</TabsContent>
            <TabsContent value="invoices">{renderInvoices()}</TabsContent>
            {uiComplexity !== 'simplified' && (
              <TabsContent value="cashflow">{renderCashflow()}</TabsContent>
            )}
          </div>
        </Tabs>
      </div>

      {/* Ziva Assistant */}
      {/* <ZivaAssistant /> */}
    </div>
  );
}