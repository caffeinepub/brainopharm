import React from 'react';
import { DrugMonograph } from '../data/drugMonographsDataset';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  Activity, 
  AlertTriangle, 
  Users, 
  FileText, 
  Clock, 
  TrendingUp,
  Info
} from 'lucide-react';

interface DrugMonographSectionsProps {
  monograph: DrugMonograph | null;
  drugName: string; // For display when monograph is null
}

export default function DrugMonographSections({ monograph, drugName }: DrugMonographSectionsProps) {
  const NotAvailableMessage = () => (
    <p className="text-gray-500 dark:text-gray-400 italic text-sm">
      Not available in the built-in dataset
    </p>
  );

  return (
    <div className="space-y-6">
      {/* Pharmacokinetics Section */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
          <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Pharmacokinetics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {monograph ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Cmax:</span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 ml-6">
                  {monograph.pharmacokinetics.cmax || 'Not specified'}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Tmax:</span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 ml-6">
                  {monograph.pharmacokinetics.tmax || 'Not specified'}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Half-life (t½):</span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 ml-6">
                  {monograph.pharmacokinetics.halfLife || 'Not specified'}
                </p>
              </div>
              
              {monograph.pharmacokinetics.bioavailability && (
                <div className="space-y-1">
                  <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Bioavailability:</span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {monograph.pharmacokinetics.bioavailability}
                  </p>
                </div>
              )}
              
              {monograph.pharmacokinetics.proteinBinding && (
                <div className="space-y-1">
                  <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Protein Binding:</span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {monograph.pharmacokinetics.proteinBinding}
                  </p>
                </div>
              )}
              
              {monograph.pharmacokinetics.metabolism && (
                <div className="space-y-1">
                  <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Metabolism:</span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {monograph.pharmacokinetics.metabolism}
                  </p>
                </div>
              )}
              
              {monograph.pharmacokinetics.elimination && (
                <div className="space-y-1">
                  <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Elimination:</span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {monograph.pharmacokinetics.elimination}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <NotAvailableMessage />
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Side Effects Section */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="bg-orange-50 dark:bg-orange-950/30">
          <CardTitle className="text-lg font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Side Effects
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {monograph && monograph.sideEffects.length > 0 ? (
            <ul className="space-y-2">
              {monograph.sideEffects.map((effect, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span className="text-gray-900 dark:text-gray-100">{effect}</span>
                </li>
              ))}
            </ul>
          ) : (
            <NotAvailableMessage />
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Contraindications Section */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader className="bg-red-50 dark:bg-red-950/30">
          <CardTitle className="text-lg font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Contraindications
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {monograph && monograph.contraindications.length > 0 ? (
            <ul className="space-y-2">
              {monograph.contraindications.map((contraindication, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-gray-900 dark:text-gray-100">{contraindication}</span>
                </li>
              ))}
            </ul>
          ) : (
            <NotAvailableMessage />
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Special Populations Section */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader className="bg-purple-50 dark:bg-purple-950/30">
          <CardTitle className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Special Populations (Pharmacovigilance)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {monograph ? (
            <>
              {/* Eligible Populations */}
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-300">
                    Eligible Populations
                  </Badge>
                </h4>
                {monograph.specialPopulations.eligiblePopulations.length > 0 ? (
                  <ul className="space-y-1 ml-4">
                    {monograph.specialPopulations.eligiblePopulations.map((pop, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-900 dark:text-gray-100">{pop}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic text-sm ml-4">Not specified</p>
                )}
              </div>

              {/* Restricted Populations */}
              <div>
                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-300">
                    Restricted Populations
                  </Badge>
                </h4>
                {monograph.specialPopulations.restrictedPopulations.length > 0 ? (
                  <ul className="space-y-1 ml-4">
                    {monograph.specialPopulations.restrictedPopulations.map((pop, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">⚠</span>
                        <span className="text-gray-900 dark:text-gray-100">{pop}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic text-sm ml-4">Not specified</p>
                )}
              </div>
            </>
          ) : (
            <NotAvailableMessage />
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* References Section */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gray-50 dark:bg-gray-900/30">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            References
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {monograph && monograph.references.length > 0 ? (
            <ul className="space-y-2">
              {monograph.references.map((reference, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1 text-sm">[{index + 1}]</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{reference}</span>
                </li>
              ))}
            </ul>
          ) : (
            <NotAvailableMessage />
          )}
        </CardContent>
      </Card>

      {/* Data Source Attribution */}
      {!monograph && (
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Monograph Not Available
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                Detailed pharmacokinetic and safety data for "{drugName}" is not currently available in the built-in dataset. 
                Please consult official drug information sources such as MIMS India, CDSCO, or FDA prescribing information for comprehensive monograph data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
