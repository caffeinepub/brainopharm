import React, { useState, useMemo, useEffect } from 'react';
import { useGetAllDrugsSorted, useGetMultiSourceLastUpdated, useGetMultiSourceSyncStatus, useRefreshMultiSourceData } from '../hooks/useQueries';
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
import { Search, CheckCircle2, XCircle, Database, RefreshCw, Clock, Moon, Sun, TrendingDown, Filter, Info, ExternalLink, Download, Loader2, AlertCircle } from 'lucide-react';
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

  const { data: allDrugs = [], isLoading: isLoadingAll } = useGetAllDrugsSorted();
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
      drugs = drugs.filter(d => d.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Filter by search term
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      drugs = drugs.filter(
        (drug) =>
          drug.name.toLowerCase().includes(searchLower) ||
          drug.category.toLowerCase().includes(searchLower) ||
          drug.description.toLowerCase().includes(searchLower)
      );
    }

    return drugs;
  }, [activeTab, allDrugs, debouncedSearch, categoryFilter]);

  // Check if drug is newly added (within last 7 days)
  const isNewDrug = (drugDate: bigint): boolean => {
    const drugTimestamp = Number(drugDate) / 1000000;
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return drugTimestamp > sevenDaysAgo;
  };

  // Autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];
    
    const searchLower = searchTerm.toLowerCase();
    const suggestions = allDrugs
      .filter(d => d.name.toLowerCase().includes(searchLower))
      .slice(0, 5)
      .map(d => d.name);
    
    return [...new Set(suggestions)];
  }, [searchTerm, allDrugs]);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLastUpdated = (date: Date | null | undefined) => {
    if (!date) return 'Never';
    
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
    const colors: Record<string, string> = {
      'General': 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
      'Antibiotic': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
      'Painkiller': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
      'FDC': 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
      'Vitamin': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    };

    return (
      <Badge variant="outline" className={colors[category] || colors['General']}>
        {category}
      </Badge>
    );
  };

  const getSourceBadge = (source: Drug['source']) => {
    let sourceName = 'Unknown';
    let color = 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';

    if (source.__kind__ === 'cdsco') {
      sourceName = 'CDSCO';
      color = 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    } else if (source.__kind__ === 'mimsIndia') {
      sourceName = 'MIMS';
      color = 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
    } else if (source.__kind__ === 'other') {
      sourceName = source.other;
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
      if (drug.source.__kind__ === 'cdsco') sourceName = 'CDSCO';
      else if (drug.source.__kind__ === 'mimsIndia') sourceName = 'MIMS India';
      else if (drug.source.__kind__ === 'other') sourceName = drug.source.other;

      return [
        drug.name,
        drug.status === DrugStatus.approved ? 'Approved' : 'Banned',
        formatDate(drug.date),
        drug.category,
        sourceName,
        drug.description,
        drug.safetyInfo
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
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
                title="Manual refresh - Automatic updates run daily at 2 AM IST"
              >
                {refreshMultiSource.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700">
                <Sun className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Moon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Live Sync Status Indicator */}
          {syncStatus && (
            <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Live Synchronization Status</span>
                <span className="text-xs text-blue-600 dark:text-blue-400 ml-auto">Next auto-update: 2 AM IST</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {Object.entries(syncStatus).map(([source, status]) => (
                  <div key={source} className="flex items-center gap-1 text-xs">
                    {status.status === 'success' ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : status.status === 'error' ? (
                      <AlertCircle className="h-3 w-3 text-red-600" />
                    ) : (
                      <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
                    )}
                    <span className="text-blue-700 dark:text-blue-300 uppercase">{source}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drug Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Drugs</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{drugCounters.total}</p>
                </div>
                <Database className="h-10 w-10 text-blue-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-red-200 dark:border-red-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Banned</p>
                  <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-1">{drugCounters.banned}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-green-200 dark:border-green-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Approved</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">{drugCounters.approved}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-500 opacity-50" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Search Bar with Autocomplete */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
            <Input
              placeholder="Search by drug name (e.g., Nimesulide, Cetirizine)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-base"
            />
            {autocompleteSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {autocompleteSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchTerm(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <Label htmlFor="category-filter" className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Filter by Category:
            </Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category-filter" className="w-[200px] border-2 border-blue-200 dark:border-blue-700">
                <SelectValue placeholder="All Categories" />
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

          {/* Tabs for filtering */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'approved' | 'banned')}>
            <TabsList className="grid w-full grid-cols-3 bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-700 h-12">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold text-base"
              >
                All Drugs
                <span className="ml-2 text-xs opacity-80">({drugCounters.total})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="banned" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold text-base"
              >
                <XCircle className="h-4 w-4 mr-1" />
                BANNED
                <span className="ml-2 text-xs opacity-80">({drugCounters.banned})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="approved" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-semibold text-base"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                APPROVED
                <span className="ml-2 text-xs opacity-80">({drugCounters.approved})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <DrugTable 
                drugs={filteredDrugs} 
                isLoading={isLoadingAll} 
                formatDate={formatDate} 
                getStatusBadge={getStatusBadge} 
                getCategoryBadge={getCategoryBadge}
                getSourceBadge={getSourceBadge}
                isNewDrug={isNewDrug}
                onDrugClick={handleDrugClick}
              />
            </TabsContent>

            <TabsContent value="banned" className="mt-6">
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-lg">
                <a
                  href="https://cdsco.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-red-900 dark:text-red-100 hover:text-red-700 dark:hover:text-red-300 transition-colors group"
                >
                  <span className="text-base sm:text-lg font-bold leading-relaxed">
                    Total banned drugs: 444+ from CDSCO. Update: cdsco.gov.in
                  </span>
                  <ExternalLink className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                </a>
              </div>
              
              <DrugTable 
                drugs={filteredDrugs} 
                isLoading={isLoadingAll} 
                formatDate={formatDate} 
                getStatusBadge={getStatusBadge} 
                getCategoryBadge={getCategoryBadge}
                getSourceBadge={getSourceBadge}
                isNewDrug={isNewDrug}
                onDrugClick={handleDrugClick}
              />
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <DrugTable 
                drugs={filteredDrugs} 
                isLoading={isLoadingAll} 
                formatDate={formatDate} 
                getStatusBadge={getStatusBadge} 
                getCategoryBadge={getCategoryBadge}
                getSourceBadge={getSourceBadge}
                isNewDrug={isNewDrug}
                onDrugClick={handleDrugClick}
              />
            </TabsContent>
          </Tabs>

          {/* Last Updated Timestamp */}
          <div className="flex items-center justify-center gap-2 pt-4 border-t-2 border-blue-200 dark:border-blue-700">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Multi-source data last updated: <span className="font-semibold text-blue-900 dark:text-blue-100">{formatLastUpdated(lastUpdated)}</span>
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
              (Auto-updates daily at 2 AM IST)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Drug Details Modal */}
      {selectedDrug && (
        <DrugDetailsModal
          drug={selectedDrug}
          isOpen={!!selectedDrug}
          onClose={() => setSelectedDrug(null)}
          isNewDrug={isNewDrug(selectedDrug.date)}
        />
      )}

      {/* Monthly Ban Trends Chart Modal */}
      <MonthlyBanTrendsChart
        isOpen={showTrendsChart}
        onClose={() => setShowTrendsChart(false)}
        drugs={allDrugs}
      />
    </>
  );
}

interface DrugTableProps {
  drugs: Drug[];
  isLoading: boolean;
  formatDate: (timestamp: bigint) => string;
  getStatusBadge: (status: DrugStatus, isNew?: boolean) => React.ReactElement;
  getCategoryBadge: (category: string) => React.ReactElement;
  getSourceBadge: (source: Drug['source']) => React.ReactElement;
  isNewDrug: (drugDate: bigint) => boolean;
  onDrugClick: (drug: Drug) => void;
}

function DrugTable({ drugs, isLoading, formatDate, getStatusBadge, getCategoryBadge, getSourceBadge, isNewDrug, onDrugClick }: DrugTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (drugs.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50/50 dark:bg-blue-950/50">
        <Database className="h-16 w-16 text-blue-400 dark:text-blue-600 mx-auto mb-4 opacity-50" />
        <p className="text-blue-900 dark:text-blue-100 font-semibold text-lg">No drugs found</p>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-blue-200 dark:border-blue-700 overflow-hidden bg-white dark:bg-slate-800 shadow-md">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-100 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900 border-b-2 border-blue-200 dark:border-blue-700">
              <TableHead className="font-bold text-blue-900 dark:text-blue-100 text-base">Drug Name</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100 text-base">Status</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100 text-base">Date</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100 text-base">Category</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100 text-base">Reference Source</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100 text-base text-center">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drugs.map((drug, index) => {
              const isNew = isNewDrug(drug.date);
              return (
                <TableRow 
                  key={`${drug.name}-${index}`}
                  className={`hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors cursor-pointer border-b border-blue-100 dark:border-blue-800 ${isNew ? 'bg-red-50 dark:bg-red-950/20' : ''}`}
                  onClick={() => onDrugClick(drug)}
                >
                  <TableCell className="font-medium">
                    <div>
                      <div className={`font-semibold ${isNew ? 'text-red-700 dark:text-red-400' : 'text-blue-900 dark:text-blue-100'}`}>
                        {drug.name}
                        {isNew && <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">NEW</span>}
                      </div>
                      {drug.description && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 line-clamp-1">
                          {drug.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(drug.status, isNew)}</TableCell>
                  <TableCell className="text-blue-700 dark:text-blue-300">
                    {formatDate(drug.date)}
                  </TableCell>
                  <TableCell>{getCategoryBadge(drug.category)}</TableCell>
                  <TableCell>{getSourceBadge(drug.source)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDrugClick(drug);
                      }}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
