"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import Link from "next/link";
import { FileUpload } from "@/components/FileUpload";
import { TransactionManager } from "@/components/TransactionManager";
import { UserProfile } from "@/components/UserProfile";
import { AISidebar } from "@/components/AISidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { SpendingTrendsChart } from "@/components/SpendingTrendsChart";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";
import { MonthlyComparisonChart } from "@/components/MonthlyComparisonChart";
import { ChartTips } from "@/components/ChartTips";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useUserData } from "@/hooks/useUserData";
import { createUploadedFile, updateFileStatus } from "@/lib/database";
import { testSupabaseConnection } from "@/lib/test-supabase";
import { 
  sampleFinancialMetrics, 
  sampleSpendingData, 
  sampleTransactions, 
  initialUploadStatus 
} from "@/data/sampleData";
import { FileUploadStatus } from "@/types";
import { 
  Upload, 
  CreditCard, 
  User,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Plus,
  FileText,
  Wallet,
  Activity,
  Users,
  ChevronDown,
  Download,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Search,
  Target,
  BarChart3,
  Settings,
  LogOut,
  PiggyBank
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { sidebarWidth } = useSidebar();
  const { 
    user: dbUser, 
    transactions, 
    financialMetrics, 
    spendingCategories, 
    loading: dataLoading, 
    error, 
    refreshData 
  } = useUserData();

  const [uploadStatus, setUploadStatus] = useState<FileUploadStatus>(initialUploadStatus);
  const [activeTab, setActiveTab] = useState("overview");
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access the dashboard.</p>
          <Link href="/login" className="text-primary hover:underline">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Show loading while data is being fetched
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  // Show error if data loading failed
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Error Loading Data</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          
          <div className="space-y-4">
            <button 
              onClick={refreshData}
              className="text-primary hover:underline mr-4"
            >
              Try Again
            </button>
            
            <button 
              onClick={async () => {
                const result = await testSupabaseConnection();
                console.log('Supabase test result:', result);
                alert(`Supabase test: ${result.success ? 'Success' : 'Failed'}\nCheck console for details`);
              }}
              className="text-secondary hover:underline"
            >
              Test Supabase Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (file: File) => {
    if (!dbUser) return;
    
    setUploadStatus({ status: "uploading", progress: 0 });
    
    try {
      // Create FormData for API request
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', (dbUser as any).id);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadStatus(prev => {
          if (prev.progress! >= 90) {
            clearInterval(progressInterval);
            return { ...prev, status: "processing" };
          }
          return { ...prev, progress: prev.progress! + 10 };
        });
      }, 200);

      // Call the upload API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setUploadStatus({ 
          status: "success", 
          message: `Successfully processed ${result.data.transactionsCount} transactions` 
        });
        
        // Refresh data to show new transactions
        await refreshData();
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setUploadStatus(initialUploadStatus);
        }, 3000);
      } else {
        throw new Error(result.error || 'Processing failed');
      }
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus({ 
        status: "error", 
        message: error instanceof Error ? error.message : "Failed to upload file" 
      });
    }
  };


  const hasData = transactions.length > 0 || financialMetrics;

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleChat={handleToggleChat} isChatOpen={isChatOpen} />

      <main 
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ease-in-out"
        style={{
          transform: isChatOpen ? 'translateX(-12rem)' : 'translateX(0)',
          width: isChatOpen ? `calc(100% - ${sidebarWidth}px)` : '100%'
        }}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {(dbUser as any)?.first_name || user?.firstName || 'User'}! Here&apos;s what&apos;s happening with your finances.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
           
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Modern Design */}
          <TabsContent value="overview" className="space-y-6">
            {hasData ? (
              <div className="space-y-6">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(financialMetrics?.totalIncome || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600 flex items-center">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          +12.5%
                        </span>
                        Trending up this month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(financialMetrics?.totalExpenses || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-red-600 flex items-center">
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                          -20%
                        </span>
                        Down 20% this period
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Savings</CardTitle>
                      <PiggyBank className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(financialMetrics?.savings || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600 flex items-center">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          +12.5%
                        </span>
                        Strong savings rate
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{financialMetrics?.savingsRate?.toFixed(1) || '0'}%</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600 flex items-center">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          +4.5%
                        </span>
                        Steady performance increase
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Guide */}
                <Card className="border-muted">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        Legend
                      </h3>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Income</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Expenses</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Savings</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Charts Section */}
                <div className="space-y-6">
                  {/* Main Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SpendingTrendsChart transactions={transactions} />
                    <CategoryBreakdownChart transactions={transactions} />
                  </div>
                  
                  {/* Monthly Comparison Chart */}
                  <MonthlyComparisonChart transactions={transactions} />
                  
                  {/* Recent Transactions */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Recent Transactions</CardTitle>
                          <CardDescription>Latest financial activity</CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={refreshData}
                          disabled={dataLoading}
                        >
                          {dataLoading ? "Loading..." : "Refresh"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-4">
                          {transactions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>No transactions found</p>
                              <p className="text-sm">Upload a CSV file or add transactions manually</p>
                            </div>
                          ) : (
                            transactions.slice(0, 8).map((transaction) => (
                            <div key={transaction.id} className="flex items-center space-x-4">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{transaction.description}</p>
                                <p className="text-xs text-muted-foreground">{transaction.category}</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(transaction.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Documents/Upload Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Financial Documents</CardTitle>
                        <CardDescription>Manage your uploaded financial files</CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab("upload")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Document
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Bank Statement - January 2024</p>
                          <p className="text-xs text-muted-foreground">CSV • 2.3 MB • Processed</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">Completed</Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Credit Card Statement - December 2023</p>
                          <p className="text-xs text-muted-foreground">CSV • 1.8 MB • Processed</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">Completed</Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <PieChart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload documents or add transactions to get started
                </p>
                <Button 
                  onClick={() => setActiveTab("upload")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            {dbUser && typeof dbUser === 'object' && dbUser !== null ? (
              <TransactionManager
                transactions={transactions}
                userId={user?.id || ''}
                onTransactionChange={refreshData}
              />
            ) : null}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Financial Documents</CardTitle>
                  <CardDescription>
                    Upload your bank statements, credit card statements, or other financial documents to get started.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    uploadStatus={uploadStatus}
                    onUploadSuccess={refreshData}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            {dbUser && typeof dbUser === 'object' && dbUser !== null ? (
              <div className="max-w-2xl mx-auto">
                <UserProfile
                  user={dbUser as any}
                  onUserUpdate={refreshData}
                />
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </main>

      {/* AI Sidebar */}
      <AISidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}