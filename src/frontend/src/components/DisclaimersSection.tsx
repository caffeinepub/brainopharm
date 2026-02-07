import { Card, CardContent } from './ui/card';
import { AlertTriangle, Shield, Lock, Info } from 'lucide-react';

export default function DisclaimersSection() {
  // Static disclaimers since backend doesn't have this functionality
  const disclaimers = [
    'This application is for educational and informational purposes only. It is not intended to provide medical advice or replace professional healthcare consultation.',
    'GDPR-compliant data handling: All patient data is stored securely and handled in accordance with data protection regulations.',
    'No external trackers or analytics: This application does not use third-party tracking or analytics services to protect user privacy.',
    'Always consult with qualified healthcare professionals before making any clinical decisions or treatment changes.',
    'The drug interaction information and safety guidelines are provided as reference material and should be verified with current medical literature.',
  ];

  const getIconForDisclaimer = (disclaimer: string, index: number) => {
    const lowerDisclaimer = disclaimer.toLowerCase();
    if (lowerDisclaimer.includes('educational')) return <Info className="h-5 w-5 text-blue-500" />;
    if (lowerDisclaimer.includes('gdpr') || lowerDisclaimer.includes('compliance')) return <Shield className="h-5 w-5 text-green-500" />;
    if (lowerDisclaimer.includes('tracker') || lowerDisclaimer.includes('analytics')) return <Lock className="h-5 w-5 text-purple-500" />;
    return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  };

  return (
    <Card className="mb-6 border-2 border-amber-200/50 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-amber-50/80 dark:border-amber-800/50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 backdrop-blur-sm shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
              Important Disclaimers
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Please read the following information carefully
            </p>
          </div>
        </div>
        
        <ul className="space-y-3 text-left">
          {disclaimers.map((disclaimer, index) => (
            <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-900/30 border border-amber-200/30 dark:border-amber-800/30 hover:bg-white/80 dark:hover:bg-gray-900/50 transition-colors">
              <div className="flex-shrink-0 mt-0.5">
                {getIconForDisclaimer(disclaimer, index)}
              </div>
              <span className="text-sm leading-relaxed text-gray-800 dark:text-gray-200" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
                {disclaimer}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
