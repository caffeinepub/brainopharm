import React, { useState, useMemo, useEffect } from 'react';
import { useGetAllDrugs, useGetApprovedDrugs, useGetBannedDrugs, useGetMultiSourceLastUpdated, useGetMultiSourceSyncStatus, useRefreshAndVerifyDrugTable, useGetLastDrugVerification, useIsCallerAdmin, useGetDrugTableVerificationReport, useGetDrugTableLastRefreshTimestamp } from '../hooks/useQueries';
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
import { Search, CheckCircle2, XCircle, Database, RefreshCw, Clock, Moon, Sun, TrendingDown, Filter, Info, ExternalLink, Download, Loader2, AlertCircle, X, ChevronLeft, ChevronRight, Upload, AlertTriangle } from 'lucide-react';
import { DrugStatus, type Drug } from '../backend';
import { useTheme } from 'next-themes';
import DrugDetailsModal from './DrugDetailsModal';
import MonthlyBanTrendsChart from './MonthlyBanTrendsChart';
import DrugBulkImportDialog from './DrugBulkImportDialog';
import { verifyDrugList } from '../services/drugListVerification';

const ITEMS_PER_PAGE = 50;

export default function DrugTableModule() {
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'banned'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [showTrendsChart, setShowTrendsChart] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
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
  const { data: isAdmin = false } = useIsCallerAdmin();
  const { data: verificationReport } = useGetDrugTableVerificationReport();
  const { data: lastRefreshTimestamp } = useGetDrugTableLastRefreshTimestamp();

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

  // Calculate drug counters from backend-provided lists (authoritative)
  const drugCounters = useMemo(() => {
    return {
      total: allDrugs.length,
      approved: approvedDrugs.length,
      banned: bannedDrugs.length,
    };
  }, [allDrugs.length, approvedDrugs.length, bannedDrugs.length]);

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

  const formatTimestamp = (timestamp: bigint | null | undefined) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(Number(timestamp) / 1000000);
      return date.toLocaleString('en-US', {
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
        <Badge variant="default" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
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
      'General': 'bg-stone-500/10 text-stone-700 dark:text-stone-400 border-stone-500/20',
      'Antibiotic': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      'Painkiller': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      'FDC': 'bg-stone-600/10 text-stone-700 dark:text-stone-400 border-stone-600/20',
      'Vitamin': 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-600/20',
    };

    return (
      <Badge variant="outline" className={colors[safeCategory] || colors['General']}>
        {safeCategory}
      </Badge>
    );
  };

  const getSourceBadge = (source: Drug['source']) => {
    let sourceName = 'Unknown';
    let color = 'bg-stone-500/10 text-stone-700 dark:text-stone-400 border-stone-500/20';

    try {
      if (source.__kind__ === 'cdsco') {
        sourceName = 'CDSCO';
        color = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      } else if (source.__kind__ === 'mimsIndia') {
        sourceName = 'MIMS';
        color = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      } else if (source.__kind__ === 'other') {
        sourceName = source.other || 'Unknown';
        if (sourceName === 'Gazette of India') {
          color = 'bg-amber-600/10 text-amber-700 dark:text-amber-400 border-amber-600/20';
        } else if (sourceName === 'Merck Manuals') {
          color = 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-600/20';
        } else if (sourceName === 'DDInter') {
          color = 'bg-stone-600/10 text-stone-700 dark:text-stone-400 border-stone-600/20';
        } else if (sourceName === 'Micromedex') {
          color = 'bg-stone-700/10 text-stone-700 dark:text-stone-400 border-stone-700/20';
        } else if (sourceName === 'FDA') {
          color = 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
        } else if (sourceName === 'UTD') {
          color = 'bg-emerald-700/10 text-emerald-700 dark:text-emerald-400 border-emerald-700/20';
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
      
      // Display backend verification summary
      const approvedCount = result.verifiedApprovedDrugs.length;
      const bannedCount = result.verifiedBannedDrugs.length;
      const totalCount = result.allDrugs.length;
      
      setVerificationResult({
        passed: true,
        summary: `✓ Backend verification passed: ${totalCount} total drugs verified (${approvedCount} approved, ${bannedCount} banned) at ${formatTimestamp(result.verificationTimestamp)}`,
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

  // Check if dataset is unexpectedly low
  const isDatasetLow = drugCounters.total < 550;

  return (
    <>
      <Card className="bg-white dark:bg-slate-900 border-stone-200 dark:border-stone-800 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-600 dark:bg-emerald-500">
                <Database className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                  Complete CDSCO Drug Database | 500+ Drugs | Auto-Updated
                </CardTitle>
                <CardDescription className="text-stone-700 dark:text-stone-300 mt-1">
                  Comprehensive pharmaceutical information from authoritative sources with backend verification
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {isAdmin && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowImportDialog(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Upload className="h-4 w-4" />
                  Import Database
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="flex items-center gap-2 border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900"
              >
                <Download className="h-4 w-4" />
                CSV Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTrendsChart(true)}
                className="flex items-center gap-2 border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900"
              >
                <TrendingDown className="h-4 w-4" />
                Ban Trends
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAndVerify}
                disabled={refreshAndVerify.isPending}
                className="flex items-center gap-2 border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900"
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

          {/* Authoritative Dataset Status Line */}
          <div className="mt-4 flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
              <Clock className="h-4 w-4" />
              <span>Last backend refresh: {formatTimestamp(lastRefreshTimestamp)}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-md ${isDatasetLow ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'}`}>
              {isDatasetLow ? <AlertTriangle className="h-4 w-4" /> : <Database className="h-4 w-4" />}
              <span className="font-semibold">
                Backend: {drugCounters.total} total ({drugCounters.approved} approved, {drugCounters.banned} banned)
              </span>
            </div>
            {isSyncing && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Syncing...
              </span>
            )}
          </div>

          {/* Verification Result Banner */}
          {verificationResult && (
            <div className={`mt-4 p-3 rounded-lg border ${verificationResult.passed ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {verificationResult.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <p className={`text-sm ${verificationResult.passed ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}>
                    {verificationResult.summary}
                  </p>
                </div>
                <button
                  onClick={() => setVerificationResult(null)}
                  className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'approved' | 'banned')}>
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <TabsList className="bg-stone-100 dark:bg-stone-800">
                <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-stone-700">
                  All Drugs ({drugCounters.total})
                </TabsTrigger>
                <TabsTrigger value="approved" className="data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950">
                  Approved ({drugCounters.approved})
                </TabsTrigger>
                <TabsTrigger value="banned" className="data-[state=active]:bg-red-50 dark:data-[state=active]:bg-red-950">
                  Banned ({drugCounters.banned})
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Search drugs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 border-stone-300 dark:border-stone-700"
                  />
                  {autocompleteSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-stone-200 dark:border-stone-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {autocompleteSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchTerm(suggestion);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-stone-50 dark:hover:bg-stone-700 text-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48 border-stone-300 dark:border-stone-700">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="antibiotic">Antibiotic</SelectItem>
                    <SelectItem value="painkiller">Painkiller</SelectItem>
                    <SelectItem value="fdc">FDC</SelectItem>
                    <SelectItem value="vitamin">Vitamin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-stone-50 dark:bg-stone-900">
                          <TableHead className="font-semibold text-stone-900 dark:text-stone-100">Drug Name</TableHead>
                          <TableHead className="font-semibold text-stone-900 dark:text-stone-100">Status</TableHead>
                          <TableHead className="font-semibold text-stone-900 dark:text-stone-100">Category</TableHead>
                          <TableHead className="font-semibold text-stone-900 dark:text-stone-100">Source</TableHead>
                          <TableHead className="font-semibold text-stone-900 dark:text-stone-100">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedDrugs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 text-stone-500 dark:text-stone-400">
                              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No drugs found matching your criteria</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedDrugs.map((drug, idx) => (
                            <TableRow
                              key={idx}
                              className="cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                              onClick={() => handleDrugClick(drug)}
                            >
                              <TableCell className="font-medium text-stone-900 dark:text-stone-100">
                                {drug.name || 'Unknown'}
                              </TableCell>
                              <TableCell>{getStatusBadge(drug.status, isNewDrug(drug.date))}</TableCell>
                              <TableCell>{getCategoryBadge(drug.category)}</TableCell>
                              <TableCell>{getSourceBadge(drug.source)}</TableCell>
                              <TableCell className="text-stone-600 dark:text-stone-400">{formatDate(drug.date)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredDrugs.length)} of {filteredDrugs.length} results
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="border-stone-300 dark:border-stone-700"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm text-stone-600 dark:text-stone-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="border-stone-300 dark:border-stone-700"
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
          isOpen={!!selectedDrug}
          onClose={() => setSelectedDrug(null)}
          drug={selectedDrug}
        />
      )}

      <MonthlyBanTrendsChart
        isOpen={showTrendsChart}
        onClose={() => setShowTrendsChart(false)}
        drugs={allDrugs}
      />

      {isAdmin && (
        <DrugBulkImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
        />
      )}
    </>
  );
}
