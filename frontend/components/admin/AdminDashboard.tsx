'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { 
  BarChart, 
  Users, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  Accessibility,
  Globe,
  Mic,
  Settings,
  Download,
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar } from 'recharts';

interface AnalyticsData {
  period: string;
  totalUsers: number;
  voiceUsers: number;
  accessibilityUsers: number;
  transactions: number;
  errorRate: number;
}

interface UserSegment {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

interface FrictionPoint {
  id: string;
  page: string;
  action: string;
  errorRate: number;
  impact: 'high' | 'medium' | 'low';
  usersAffected: number;
}

const mockAnalytics: AnalyticsData[] = [
  { period: 'Jan', totalUsers: 1250, voiceUsers: 875, accessibilityUsers: 312, transactions: 4580, errorRate: 2.1 },
  { period: 'Feb', totalUsers: 1420, voiceUsers: 994, accessibilityUsers: 355, transactions: 5240, errorRate: 1.8 },
  { period: 'Mar', totalUsers: 1680, voiceUsers: 1176, accessibilityUsers: 420, transactions: 6120, errorRate: 1.5 },
  { period: 'Apr', totalUsers: 1890, voiceUsers: 1323, accessibilityUsers: 472, transactions: 6890, errorRate: 1.3 },
  { period: 'May', totalUsers: 2150, voiceUsers: 1505, accessibilityUsers: 538, transactions: 7650, errorRate: 1.1 },
  { period: 'Jun', totalUsers: 2480, voiceUsers: 1736, accessibilityUsers: 620, transactions: 8920, errorRate: 0.9 }
];

const userSegments: UserSegment[] = [
  { type: 'Visual Impairment', count: 620, percentage: 25, color: '#C81D25' },
  { type: 'Motor Impairment', count: 372, percentage: 15, color: '#F29E2E' },
  { type: 'Hearing Impairment', count: 248, percentage: 10, color: '#2BA84A' },
  { type: 'Cognitive Support', count: 496, percentage: 20, color: '#0077B6' },
  { type: 'No Specific Needs', count: 744, percentage: 30, color: '#B0B0B0' }
];

const frictionPoints: FrictionPoint[] = [
  {
    id: '1',
    page: 'Money Transfer',
    action: 'Voice Confirmation',
    errorRate: 12.5,
    impact: 'high',
    usersAffected: 156
  },
  {
    id: '2', 
    page: 'Bill Payment',
    action: 'Provider Selection',
    errorRate: 8.2,
    impact: 'medium',
    usersAffected: 89
  },
  {
    id: '3',
    page: 'Onboarding',
    action: 'Cognitive Test',
    errorRate: 6.7,
    impact: 'low',
    usersAffected: 45
  }
];

const languageDistribution = [
  { name: 'English', value: 65, users: 1612 },
  { name: 'Pidgin', value: 20, users: 496 },
  { name: 'Yoruba', value: 8, users: 198 },
  { name: 'Igbo', value: 4, users: 99 },
  { name: 'Hausa', value: 3, users: 75 }
];

const COLORS = ['#C81D25', '#0077B6', '#2BA84A', '#F29E2E', '#B0B0B0'];

export function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [activeTab, setActiveTab] = useState('overview');
  
  const { speak } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();

  useEffect(() => {
    speak("Welcome to the 4All Admin Dashboard. Viewing inclusivity metrics and user analytics.");
  }, [speak]);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-danger';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-gray';
    }
  };

  const currentMonth = mockAnalytics[mockAnalytics.length - 1];
  const previousMonth = mockAnalytics[mockAnalytics.length - 2];
  const userGrowth = ((currentMonth.totalUsers - previousMonth.totalUsers) / previousMonth.totalUsers) * 100;
  const voiceAdoption = (currentMonth.voiceUsers / currentMonth.totalUsers) * 100;
  const accessibilityAdoption = (currentMonth.accessibilityUsers / currentMonth.totalUsers) * 100;
  const errorReduction = previousMonth.errorRate - currentMonth.errorRate;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={cn(adaptiveClasses.card, "bg-primary-red text-white")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{formatNumber(currentMonth.totalUsers)}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs">+{formatPercentage(userGrowth)} this month</span>
              </div>
            </div>
            <Users className="w-8 h-8 text-white/60" />
          </div>
        </Card>

        <Card className={cn(adaptiveClasses.card, "bg-highlight-blue text-white")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Voice Adoption</p>
              <p className="text-2xl font-bold">{formatPercentage(voiceAdoption)}</p>
              <p className="text-xs text-white/80">{formatNumber(currentMonth.voiceUsers)} users</p>
            </div>
            <Mic className="w-8 h-8 text-white/60" />
          </div>
        </Card>

        <Card className={cn(adaptiveClasses.card, "bg-success text-white")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Accessibility Users</p>
              <p className="text-2xl font-bold">{formatPercentage(accessibilityAdoption)}</p>
              <p className="text-xs text-white/80">{formatNumber(currentMonth.accessibilityUsers)} users</p>
            </div>
            <Accessibility className="w-8 h-8 text-white/60" />
          </div>
        </Card>

        <Card className={cn(adaptiveClasses.card, "bg-warning text-white")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Error Rate</p>
              <p className="text-2xl font-bold">{formatPercentage(currentMonth.errorRate)}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3" />
                <span className="text-xs">-{formatPercentage(errorReduction)} improved</span>
              </div>
            </div>
            <Activity className="w-8 h-8 text-white/60" />
          </div>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card className={adaptiveClasses.card}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={cn(adaptiveClasses.text, "text-xl font-semibold text-text")}>
              Inclusivity Adoption Trends
            </h3>
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              Voice-first and accessibility feature usage over time
            </p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
              <SelectItem value="last6months">Last 6 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockAnalytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="totalUsers" 
                stroke="#C81D25" 
                strokeWidth={2}
                name="Total Users"
              />
              <Line 
                type="monotone" 
                dataKey="voiceUsers" 
                stroke="#0077B6" 
                strokeWidth={2}
                name="Voice Users"
              />
              <Line 
                type="monotone" 
                dataKey="accessibilityUsers" 
                stroke="#2BA84A" 
                strokeWidth={2}
                name="Accessibility Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={adaptiveClasses.card}>
          <h4 className={cn(adaptiveClasses.text, "font-semibold text-text mb-3")}>
            Transaction Success
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-success">98.9%</p>
              <p className="text-sm text-muted-gray">Success Rate</p>
            </div>
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
        </Card>

        <Card className={adaptiveClasses.card}>
          <h4 className={cn(adaptiveClasses.text, "font-semibold text-text mb-3")}>
            Customer Satisfaction
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-highlight-blue">4.7</p>
              <p className="text-sm text-muted-gray">Average Rating</p>
            </div>
            <TrendingUp className="w-8 h-8 text-highlight-blue" />
          </div>
        </Card>

        <Card className={adaptiveClasses.card}>
          <h4 className={cn(adaptiveClasses.text, "font-semibold text-text mb-3")}>
            Support Tickets
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-warning">23</p>
              <p className="text-sm text-muted-gray">Open This Month</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderUserInsights = () => (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* User Segmentation */}
        <Card className={adaptiveClasses.card}>
          <h4 className={cn(adaptiveClasses.text, "font-semibold text-text mb-4")}>
            User Accessibility Segmentation
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userSegments}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ type, percentage }) => `${type}: ${percentage}%`}
                >
                  {userSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Language Distribution */}
        <Card className={adaptiveClasses.card}>
          <h4 className={cn(adaptiveClasses.text, "font-semibold text-text mb-4")}>
            Language Preference
          </h4>
          <div className="space-y-3">
            {languageDistribution.map((lang, index) => (
              <div key={lang.name} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: COLORS[index] }}
                />
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>{lang.name}</span>
                    <span>{lang.value}% ({formatNumber(lang.users)})</span>
                  </div>
                  <div className="w-full bg-muted-gray/20 rounded-full h-1.5 mt-1">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${lang.value}%`,
                        backgroundColor: COLORS[index]
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={adaptiveClasses.card}>
          <div className="text-center">
            <Globe className="w-8 h-8 text-primary-red mx-auto mb-2" />
            <h5 className={cn(adaptiveClasses.text, "font-medium text-text")}>Multi-language</h5>
            <p className="text-2xl font-bold text-primary-red">35%</p>
            <p className="text-sm text-muted-gray">Non-English users</p>
          </div>
        </Card>

        <Card className={adaptiveClasses.card}>
          <div className="text-center">
            <Mic className="w-8 h-8 text-highlight-blue mx-auto mb-2" />
            <h5 className={cn(adaptiveClasses.text, "font-medium text-text")}>Voice-First</h5>
            <p className="text-2xl font-bold text-highlight-blue">70%</p>
            <p className="text-sm text-muted-gray">Prefer voice interaction</p>
          </div>
        </Card>

        <Card className={adaptiveClasses.card}>
          <div className="text-center">
            <Accessibility className="w-8 h-8 text-success mx-auto mb-2" />
            <h5 className={cn(adaptiveClasses.text, "font-medium text-text")}>Adaptive UI</h5>
            <p className="text-2xl font-bold text-success">25%</p>
            <p className="text-sm text-muted-gray">Use accessibility features</p>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderFrictionPoints = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className={cn(adaptiveClasses.text, "text-xl font-semibold text-text")}>
            Friction Points Analysis
          </h3>
          <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
            Areas where users experience difficulties or errors
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="space-y-3">
        {frictionPoints.map((point) => (
          <Card key={point.id} className={adaptiveClasses.card}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  point.impact === 'high' && "bg-danger/10",
                  point.impact === 'medium' && "bg-warning/10", 
                  point.impact === 'low' && "bg-success/10"
                )}>
                  <AlertTriangle className={cn("w-5 h-5", getImpactColor(point.impact))} />
                </div>
                
                <div>
                  <h4 className={cn(adaptiveClasses.text, "font-medium text-text")}>
                    {point.page} - {point.action}
                  </h4>
                  <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                    {formatNumber(point.usersAffected)} users affected
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={cn(adaptiveClasses.text, "text-lg font-semibold", getImpactColor(point.impact))}>
                  {formatPercentage(point.errorRate)}
                </p>
                <Badge
                  className={cn(
                    "text-xs",
                    point.impact === 'high' && "bg-danger text-white",
                    point.impact === 'medium' && "bg-warning text-white",
                    point.impact === 'low' && "bg-success text-white"
                  )}
                >
                  {point.impact} impact
                </Badge>
              </div>

              <Button size="sm" variant="outline">
                <Eye className="w-3 h-3 mr-1" />
                Analyze
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Error Trends */}
      <Card className={adaptiveClasses.card}>
        <h4 className={cn(adaptiveClasses.text, "font-semibold text-text mb-4")}>
          Error Rate Trends
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockAnalytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value: number) => [`${value}%`, 'Error Rate']} />
              <Line 
                type="monotone" 
                dataKey="errorRate" 
                stroke="#E53E3E" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className={cn(adaptiveClasses.heading, "text-primary-red")}>
              4All Admin Dashboard
            </h1>
            <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
              Inclusivity analytics and user insights
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="border-muted-gray text-muted-gray"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="border-muted-gray text-muted-gray"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">User Insights</TabsTrigger>
            <TabsTrigger value="friction">Friction Points</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview">{renderOverview()}</TabsContent>
            <TabsContent value="insights">{renderUserInsights()}</TabsContent>
            <TabsContent value="friction">{renderFrictionPoints()}</TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}