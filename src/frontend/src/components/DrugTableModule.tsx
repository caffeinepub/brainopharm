import React, { useState, useMemo, useEffect } from 'react';
import { useGetAllDrugs, useGetApprovedDrugs, useGetBannedDrugs, useGetMultiSourceLastUpdated, useGetMultiSourceSyncStatus, useRefreshAndVerifyDrugTable, useGetLastDrugVerification } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Search, CheckCircle2, XCircle, Database, RefreshCw, Clock, Moon, Sun, TrendingDown, Filter, Info, ExternalLink, Download, Loader2, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DrugStatus, type Drug } from '../backend';
import { useTheme } from 'next-themes';
import DrugDetailsModal from './DrugDetailsModal';
import MonthlyBanTrendsChart from './MonthlyBanTrendsChart';
import { verifyDrugList } from '../services/drugListVerification';

const ITEMS_PER_PAGE = 50;

export default function DrugTableModule() {
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'banned'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [showTrendsChart, setShowTrendsChart] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [verificationResult, setVerificationResult] = useState<{ passed: boolean; summary: string } | null>(null);
  const { theme, setTheme } = useTheme();

  // Use separate hooks for each tab to get authoritative backend data
  const { data: allDrugs = [], isLoading: isLoadingAll } = useGetAllDrugs();
  const { data: approvedDrugs = [], isLoading: isLoadingApproved } = useGetApprovedDrugs();
  const { data: bannedDrugs = [], isLoading: isLoadingBanned } = useGetBannedDrugs();
  const { data: lastUpdated } = useGetMultiSourceLastUpdated();
  const { data: syncStatus } = useGetMultiSourceSyncStatus();
  const refreshAndVerify = useRefreshAndVerifyDrugTable();
  const { data: lastVerification } = useGetLastDrugVerification();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch, categoryFilter]);

  // Calculate drug counters from allDrugs (authoritative source)
  const drugCounters = useMemo(() => {
    const banned = allDrugs.filter(d => d.status === DrugStatus.banned).length;
    const approved = allDrugs.filter(d => d.status === DrugStatus.approved).length;
    return { banned, approved, total: allDrugs.length };
  }, [allDrugs]);

  // Get the current dataset based on active tab (use backend-provided lists)
  const currentDataset = useMemo(() => {
    if (activeTab === 'approved') return approvedDrugs;
    if (activeTab === 'banned') return bannedDrugs;
    return allDrugs;
  }, [activeTab, allDrugs, approvedDrugs, bannedDrugs]);

  // Filter drugs based on search term and category (from current dataset)
  const filteredDrugs = useMemo(() => {
    let drugs: Drug[] = currentDataset;

    // Filter by category
    if (categoryFilter !== 'all') {
      drugs = drugs.filter(d => (d.category || '').toLowerCase() === categoryFilter.toLowerCase());
    }

    // Filter by search term with safe string handling
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      drugs = drugs.filter(
        (drug) =>
          (drug.name || '').toLowerCase().includes(searchLower) ||
          (drug.category || '').toLowerCase().includes(searchLower) ||
          (drug.description || '').toLowerCase().includes(searchLower)
      );
    }

    return drugs;
  }, [currentDataset, debouncedSearch, categoryFilter]);

  // Paginate the filtered drugs for display
  const paginatedDrugs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredDrugs.slice(startIndex, endIndex);
  }, [filteredDrugs, currentPage]);

  const totalPages = Math.ceil(filteredDrugs.length / ITEMS_PER_PAGE);

  // Check if drug is newly added (within last 7 days)
  const isNewDrug = (drugDate: bigint): boolean => {
    try {
      const drugTimestamp = Number(drugDate) / 1000000;
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return drugTimestamp > sevenDaysAgo;
    } catch {
      return false;
    }
  };

  // Autocomplete suggestions with safe string handling
  const autocompleteSuggestions = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];
    
    const searchLower = searchTerm.toLowerCase();
    const suggestions = allDrugs
      .filter(d => (d.name || '').toLowerCase().includes(searchLower))
      .slice(0, 5)
      .map(d => d.name || 'Unknown');
    
    return [...new Set(suggestions)];
  }, [searchTerm, allDrugs]);

  const formatDate = (timestamp: bigint) => {
    try {
      const date = new Date(Number(timestamp) / 1000000);
      if (isNaN(date.getTime())) {
        return 'Not available';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Not available';
    }
  };

  const formatLastUpdated = (date: Date | null | undefined) => {
    if (!date) return 'Never';
    
    try {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Not available';
    }
  };

  const getStatusBadge = (status: DrugStatus, isNew: boolean = false) => {
    if (status === DrugStatus.approved) {
      return (
        <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className={`${isNew ? 'bg-red-600 text-white border-red-600 animate-pulse' : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'}`}>
        <XCircle className="h-3 w-3 mr-1" />
        Banned
        {isNew && <span className="ml-1 text-xs">NEW</span>}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const safeCategory = category || 'General';
    const colors: Record<string, string> = {
      'General': 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
      'Antibiotic': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
      'Painkiller': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
      'FDC': 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
      'Vitamin': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    };

    return (
      <Badge variant="outline" className={colors[safeCategory] || colors['General']}>
        {safeCategory}
      </Badge>
    );
  };

  const getSourceBadge = (source: Drug['source']) => {
    let sourceName = 'Unknown';
    let color = 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';

    try {
      if (source.__kind__ === 'cdsco') {
        sourceName = 'CDSCO';
        color = 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      } else if (source.__kind__ === 'mimsIndia') {
        sourceName = 'MIMS';
        color = 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      } else if (source.__kind__ === 'other') {
        sourceName = source.other || 'Unknown';
        if (sourceName === 'Gazette of India') {
          color = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
        } else if (sourceName === 'Merck Manuals') {
          color = 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20';
        } else if (sourceName === 'DDInter') {
          color = 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
        } else if (sourceName === 'Micromedex') {
          color = 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20';
        } else if (sourceName === 'FDA') {
          color = 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
        } else if (sourceName === 'UTD') {
          color = 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
        }
      }
    } catch {
      sourceName = 'Unknown';
    }

    return (
      <Badge variant="outline" className={`${color} text-xs`}>
        {sourceName}
      </Badge>
    );
  };

  const handleRefreshAndVerify = async () => {
    try {
      const result = await refreshAndVerify.mutateAsync();
      
      // Run client-side verification on the returned data
      const clientVerification = verifyDrugList(result.allDrugs);
      setVerificationResult({
        passed: clientVerification.passed,
        summary: clientVerification.summary,
      });
    } catch (error) {
      console.error('Refresh and verify failed:', error);
      setVerificationResult({
        passed: false,
        summary: '✗ Verification failed: Unable to refresh drug table. Please try again.',
      });
    }
  };

  const handleDrugClick = (drug: Drug) => {
    setSelectedDrug(drug);
  };

  const handleExportCSV = () => {
    // Export ALL filtered drugs, not just the visible page
    const headers = ['Drug Name', 'Status', 'Date', 'Category', 'Reference Source', 'Description', 'Safety Info'];
    const rows = filteredDrugs.map(drug => {
      let sourceName = 'Unknown';
      try {
        if (drug.source.__kind__ === 'cdsco') sourceName = 'CDSCO';
        else if (drug.source.__kind__ === 'mimsIndia') sourceName = 'MIMS India';
        else if (drug.source.__kind__ === 'other') sourceName = drug.source.other || 'Unknown';
      } catch {
        sourceName = 'Unknown';
      }

      return [
        drug.name || 'Not available',
        drug.status === DrugStatus.approved ? 'Approved' : 'Banned',
        formatDate(drug.date),
        drug.category || 'Not available',
        sourceName,
        drug.description || 'Not available',
        drug.safetyInfo || 'Not available'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `drug_database_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if sync is in progress
  const isSyncing = syncStatus && syncStatus.cdsco?.status === 'pending';

  // Determine loading state based on active tab
  const isLoading = activeTab === 'all' ? isLoadingAll : activeTab === 'approved' ? isLoadingApproved : isLoadingBanned;

  return (
    <>
      <Card className="bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-600 dark:bg-blue-500">
                <Database className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-blue-900 dark:text-blue-100">Drug Database</CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300 mt-1">
                  Comprehensive pharmaceutical information from 8 authoritative sources with automatic daily updates at 2 AM IST
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="flex items-center gap-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900"
              >
                <Download className="h-4 w-4" />
                CSV Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTrendsChart(true)}
                className="flex items-center gap-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900"
              >
                <TrendingDown className="h-4 w-4" />
                Ban Trends
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAndVerify}
                disabled={refreshAndVerify.isPending}
                className="flex items-center gap-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900"
              >
                <RefreshCw className={`h-4 w-4 ${refreshAndVerify.isPending ? 'animate-spin' : ''}`} />
                Refresh & Verify
              </Button>
              <div className="flex items-center gap-2">
                <Label htmlFor="theme-toggle" className="sr-only">Toggle theme</Label>
                <Switch
                  id="theme-toggle"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <Clock className="h-4 w-4" />
            <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
            {isSyncing && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Syncing...
              </span>
            )}
          </div>

          {/* Verification Result Banner */}
          {verificationResult && (
            <div className={`mt-4 p-3 rounded-lg border ${verificationResult.passed ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {verificationResult.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <p className={`text-sm ${verificationResult.passed ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    {verificationResult.summary}
                  </p>
                </div>
                <button
                  onClick={() => setVerificationResult(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Last Verification Info */}
          {lastVerification && !verificationResult && (
            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Info className="h-4 w-4" />
                <span>
                  Last verification: {formatLastUpdated(new Date(Number(lastVerification.verificationTimestamp) / 1000000))} 
                  {' '}({lastVerification.allDrugs.length} drugs verified)
                </span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Drugs</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{drugCounters.total}</p>
                  </div>
                  <Database className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Approved</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{drugCounters.approved}</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Banned</p>
                    <p className="text-3xl font-bold text-red-900 dark:text-red-100">{drugCounters.banned}</p>
                  </div>
                  <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'approved' | 'banned')} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All Drugs</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="banned">Banned</TabsTrigger>
            </TabsList>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search drugs by name, category, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {autocompleteSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                    {autocompleteSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchTerm(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="antibiotic">Antibiotic</SelectItem>
                  <SelectItem value="painkiller">Painkiller</SelectItem>
                  <SelectItem value="fdc">FDC</SelectItem>
                  <SelectItem value="vitamin">Vitamin</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredDrugs.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No drugs found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    {searchTerm || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'The database is empty'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border border-gray-200 dark:border-gray-700">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[30%]">Drug Name</TableHead>
                          <TableHead className="w-[15%]">Status</TableHead>
                          <TableHead className="w-[15%]">Category</TableHead>
                          <TableHead className="w-[15%]">Source</TableHead>
                          <TableHead className="w-[15%]">Date</TableHead>
                          <TableHead className="w-[10%]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedDrugs.map((drug, index) => (
                          <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                            <TableCell className="font-medium">{drug.name || 'Not available'}</TableCell>
                            <TableCell>{getStatusBadge(drug.status, isNewDrug(drug.date))}</TableCell>
                            <TableCell>{getCategoryBadge(drug.category)}</TableCell>
                            <TableCell>{getSourceBadge(drug.source)}</TableCell>
                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">{formatDate(drug.date)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDrugClick(drug)}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredDrugs.length)} of {filteredDrugs.length} results
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedDrug && (
        <DrugDetailsModal
          drug={selectedDrug}
          isOpen={!!selectedDrug}
          onClose={() => setSelectedDrug(null)}
        />
      )}

      {showTrendsChart && (
        <MonthlyBanTrendsChart
          drugs={allDrugs}
          isOpen={showTrendsChart}
          onClose={() => setShowTrendsChart(false)}
        />
      )}
    </>
  );
}
