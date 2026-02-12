import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TrendingDown, Calendar } from 'lucide-react';
import { Drug, DrugStatus } from '../backend';

interface MonthlyBanTrendsChartProps {
  isOpen: boolean;
  onClose: () => void;
  drugs: Drug[];
}

export default function MonthlyBanTrendsChart({ isOpen, onClose, drugs }: MonthlyBanTrendsChartProps) {
  const banTrends = useMemo(() => {
    const bannedDrugs = drugs.filter(d => d.status === DrugStatus.banned);
    const yearlyBans: Record<number, number> = {};

    bannedDrugs.forEach(drug => {
      const year = new Date(Number(drug.date) / 1000000).getFullYear();
      yearlyBans[year] = (yearlyBans[year] || 0) + 1;
    });

    const sortedYears = Object.keys(yearlyBans)
      .map(Number)
      .sort((a, b) => b - a);

    return sortedYears.map(year => ({
      year,
      bans: yearlyBans[year],
    }));
  }, [drugs]);

  const maxBans = Math.max(...banTrends.map(t => t.bans), 1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-stone-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-red-600" />
            Monthly Ban Trends
          </DialogTitle>
          <DialogDescription className="text-stone-700 dark:text-stone-300">
            Statistical analysis of drug bans per year for academic research
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Total Bans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                  {banTrends.reduce((sum, t) => sum + t.bans, 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-stone-50 dark:bg-stone-950/30 border-2 border-stone-200 dark:border-stone-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-stone-700 dark:text-stone-300">Years Tracked</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {banTrends.length}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Peak Year</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {banTrends.length > 0 ? banTrends[0].year : 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart */}
          <Card className="bg-white dark:bg-slate-800 border-2 border-stone-200 dark:border-stone-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Yearly Ban Statistics
              </CardTitle>
              <CardDescription className="text-stone-700 dark:text-stone-300">
                Number of drugs banned per year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {banTrends.map((trend) => (
                  <div key={trend.year} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {trend.year}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-red-700 dark:text-red-400">
                        {trend.bans} ban{trend.bans !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="relative h-8 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                        style={{ width: `${(trend.bans / maxBans) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">
                          {trend.bans}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {banTrends.length === 0 && (
                <div className="py-12 text-center">
                  <TrendingDown className="h-12 w-12 text-stone-400 mx-auto mb-4 opacity-50" />
                  <p className="text-stone-600 dark:text-stone-400">No ban data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Academic Note */}
          <div className="bg-stone-50 dark:bg-stone-950/30 rounded-lg p-4 border border-stone-200 dark:border-stone-700">
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              <strong>Academic Research Note:</strong> This statistical analysis is based on official CDSCO data 
              and regulatory databases. The trends shown represent documented drug bans and regulatory actions. 
              Data is updated daily at 2 AM IST for accuracy and research reliability.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
