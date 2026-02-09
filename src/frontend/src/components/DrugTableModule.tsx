import React, { useState, useMemo, useEffect } from 'react';
import { useGetAllDrugs, useGetMultiSourceLastUpdated, useGetMultiSourceSyncStatus, useRefreshMultiSourceData } from '../hooks/useQueries';
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
import { Search, CheckCircle2, XCircle, Database, RefreshCw, Clock, Moon, Sun, TrendingDown, Filter, Info, ExternalLink, Download, Loader2, AlertCircle, X } from 'lucide-react';
import { DrugStatus, type Drug } from '../backend';
import { useTheme } from 'next-themes';
import DrugDetailsModal from './DrugDetailsModal';
import MonthlyBanTrendsChart from './MonthlyBanTrendsChart';

export default function DrugTableModule() {
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'banned'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [showTrendsChart, setShowTrendsChart] = useState(false);
  const { theme, setTheme } = useTheme();

  const { data: allDrugs = [], isLoading: isLoadingAll } = useGetAllDrugs();
  const { data: lastUpdated } = useGetMultiSourceLastUpdated();
  const { data: syncStatus } = useGetMultiSourceSyncStatus();
  const refreshMultiSource = useRefreshMultiSourceData();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Calculate drug counters
  const drugCounters = useMemo(() => {
    const banned = allDrugs.filter(d => d.status === DrugStatus.banned).length;
    const approved = allDrugs.filter(d => d.status === DrugStatus.approved).length;
    return { banned, approved, total: allDrugs.length };
  }, [allDrugs]);

  // Filter drugs based on active tab, search term, and category
  const filteredDrugs = useMemo(() => {
    let drugs: Drug[] = allDrugs;
    
    // Filter by status tab
    if (activeTab === 'approved') {
      drugs = drugs.filter(d => d.status === DrugStatus.approved);
    } else if (activeTab === 'banned') {
      drugs = drugs.filter(d => d.status === DrugStatus.banned);
    }

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
  }, [activeTab, allDrugs, debouncedSearch, categoryFilter]);

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

  const handleRefresh = () => {
    refreshMultiSource.mutate();
  };

  const handleDrugClick = (drug: Drug) => {
    setSelectedDrug(drug);
  };

  const handleExportCSV = () => {
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
                onClick={handleRefresh}
                disabled={refreshMultiSource.isPending}
                className="flex items-center gap-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900"
              >
                <RefreshCw className={`h-4 w-4 ${refreshMultiSource.isPending ? 'animate-spin' : ''}`} />
                Refresh
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

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search drugs by name, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {autocompleteSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-white dark:bg-slate-900 shadow-lg">
                  {autocompleteSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-blue-950"
                      onClick={() => {
                        setSearchTerm(suggestion);
                        setDebouncedSearch(suggestion);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="antibiotic">Antibiotic</SelectItem>
                  <SelectItem value="painkiller">Painkiller</SelectItem>
                  <SelectItem value="fdc">FDC</SelectItem>
                  <SelectItem value="vitamin">Vitamin</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Drugs ({drugCounters.total})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({drugCounters.approved})</TabsTrigger>
              <TabsTrigger value="banned">Banned ({drugCounters.banned})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoadingAll ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredDrugs.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">No drugs found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Drug Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDrugs.map((drug, idx) => (
                        <TableRow
                          key={idx}
                          className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          onClick={() => handleDrugClick(drug)}
                        >
                          <TableCell className="font-medium">{drug.name || 'Not available'}</TableCell>
                          <TableCell>{getStatusBadge(drug.status, isNewDrug(drug.date))}</TableCell>
                          <TableCell>{formatDate(drug.date)}</TableCell>
                          <TableCell>{getCategoryBadge(drug.category)}</TableCell>
                          <TableCell>{getSourceBadge(drug.source)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <DrugDetailsModal drug={selectedDrug} isOpen={!!selectedDrug} onClose={() => setSelectedDrug(null)} />

      {showTrendsChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-auto bg-white dark:bg-slate-900 rounded-lg">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Monthly Ban Trends</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowTrendsChart(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <MonthlyBanTrendsChart drugs={allDrugs} isOpen={showTrendsChart} onClose={() => setShowTrendsChart(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
