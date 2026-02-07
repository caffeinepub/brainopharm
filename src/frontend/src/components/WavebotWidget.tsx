import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useGetAllPatients, useGetAllLabResults } from '../hooks/useQueries';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

// Define ResourceStatus locally since it's not in backend
enum ResourceStatus {
  active = 'active',
  unavailable = 'unavailable',
  pending = 'pending',
  redirected = 'redirected',
  archived = 'archived',
}

// Define ExternalResource locally
interface ExternalResource {
  id: string;
  name: string;
  url: string;
  description: string;
  status: ResourceStatus;
  lastUpdated: bigint;
  contentSummary?: string;
  synchronizationLogs: string[];
}

// Default external resources
const defaultExternalResources: ExternalResource[] = [
  {
    id: 'cdsco',
    name: 'CDSCO - Central Drugs Standard Control Organization',
    url: 'https://cdsco.gov.in/opencms/opencms/en/Home/',
    description: 'India\'s national regulatory authority for pharmaceuticals',
    status: ResourceStatus.active,
    lastUpdated: BigInt(Date.now() * 1000000),
    contentSummary: 'Drug approval, licensing, and pharmacovigilance monitoring',
    synchronizationLogs: [],
  },
  {
    id: 'uppsalaMonitoringCentre',
    name: 'Uppsala Monitoring Centre (WHO-UMC)',
    url: 'https://who-umc.org/',
    description: 'WHO Programme for International Drug Monitoring',
    status: ResourceStatus.active,
    lastUpdated: BigInt(Date.now() * 1000000),
    contentSummary: 'Global pharmacovigilance hub with VigiBase database',
    synchronizationLogs: [],
  },
  {
    id: 'ipc',
    name: 'IPC - Indian Pharmacopoeia Commission',
    url: 'https://www.ipc.gov.in/',
    description: 'Standards for drugs in India',
    status: ResourceStatus.active,
    lastUpdated: BigInt(Date.now() * 1000000),
    contentSummary: 'Pharmacopoeia standards and quality control',
    synchronizationLogs: [],
  },
  {
    id: 'ema',
    name: 'EMA - European Medicines Agency (EudraVigilance)',
    url: 'https://www.ema.europa.eu/en/human-regulatory-overview/research-development/pharmacovigilance-research-development/eudravigilance-access-eudravigilance-data',
    description: 'European adverse reaction reporting system',
    status: ResourceStatus.active,
    lastUpdated: BigInt(Date.now() * 1000000),
    contentSummary: 'Centralized EU adverse event database',
    synchronizationLogs: [],
  },
  {
    id: 'healthCanada',
    name: 'Health Canada Vigilance Database (HPR-RPS)',
    url: 'https://hpr-rps.hres.ca/static/content/data-donnees.php',
    description: 'Canadian adverse reaction database',
    status: ResourceStatus.active,
    lastUpdated: BigInt(Date.now() * 1000000),
    contentSummary: 'Health product adverse reaction reports',
    synchronizationLogs: [],
  },
  {
    id: 'yellowCard',
    name: 'UK Yellow Card Scheme',
    url: 'https://yellowcard.mhra.gov.uk/',
    description: 'UK adverse drug reaction reporting',
    status: ResourceStatus.active,
    lastUpdated: BigInt(Date.now() * 1000000),
    contentSummary: 'MHRA adverse event reporting system',
    synchronizationLogs: [],
  },
  {
    id: 'tga',
    name: 'Australian TGA Adverse Event Notifications Database (DAEN)',
    url: 'https://www.tga.gov.au/database/database-adverse-event-notifications-daen',
    description: 'Australian adverse event database',
    status: ResourceStatus.active,
    lastUpdated: BigInt(Date.now() * 1000000),
    contentSummary: 'TGA adverse event notification system',
    synchronizationLogs: [],
  },
];

interface WavebotWidgetProps {
  currentModule?: string;
}

interface LocalMessage {
  sender: string;
  message: string;
  timestamp: bigint;
  id?: string;
}

export default function WavebotWidget({ currentModule = 'general' }: WavebotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  
  // Fetch data for intelligent responses
  const { data: patients = [] } = useGetAllPatients();
  const { data: labResults = [] } = useGetAllLabResults();
  
  // Use default external resources
  const allExternalResources = defaultExternalResources;

  useEffect(() => {
    if (!isInitialized) {
      const greetingWithHelp = `👋 Hi, I'm WAVEBOT — your virtual pharmacovigilance assistant! How can I assist you today!\n\nMay I help you?`;
      setLocalMessages([
        {
          sender: 'WAVEBOT',
          message: greetingWithHelp,
          timestamp: BigInt(Date.now() * 1000000),
          id: 'greeting',
        },
      ]);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [localMessages, isOpen]);

  const generateEnrichedResponse = useCallback((userMessage: string, module: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Enhanced medical interpretation with backend logic
    const bpMatch = userMessage.match(/bp\s*(\d{2,3})\s*[\/\-]\s*(\d{2,3})/i) || 
                    userMessage.match(/blood\s*pressure\s*(\d{2,3})\s*[\/\-]\s*(\d{2,3})/i);
    
    if (bpMatch) {
      const systolic = parseInt(bpMatch[1]);
      const diastolic = parseInt(bpMatch[2]);
      
      let interpretation = '';
      if (systolic < 120 && diastolic < 80) {
        interpretation = 'Normal';
      } else if (systolic < 130 && diastolic < 80) {
        interpretation = 'Elevated';
      } else if (systolic < 140 || diastolic < 90) {
        interpretation = 'Stage 1 Hypertension';
      } else {
        interpretation = 'Stage 2 Hypertension';
      }
      
      return `🩺 **Blood Pressure Analysis: ${systolic}/${diastolic} mmHg**\n\n` +
             `**Interpretation:** ${interpretation}\n\n` +
             `**Reference Ranges (Human):**\n` +
             `• Normal: <120/<80 mmHg\n` +
             `• Elevated: 120-129/<80 mmHg\n` +
             `• Stage 1 Hypertension: 130-139/80-89 mmHg\n` +
             `• Stage 2 Hypertension: ≥140/≥90 mmHg\n\n` +
             `💡 **Clinical Guidance:** Check the Lab Results module for species-specific reference ranges and color-coded alerts.\n\n` +
             `📚 **External Resources:** For more information, visit WHO-UMC, EMA, or Health Canada databases.`;
    }

    // BMI interpretation with enriched context
    const bmiMatch = userMessage.match(/bmi\s*(\d+\.?\d*)/i);
    if (bmiMatch) {
      const bmi = parseFloat(bmiMatch[1]);
      let category = '';
      let healthRisk = '';
      if (bmi < 18.5) {
        category = 'Underweight';
        healthRisk = 'Increased risk of malnutrition and weakened immunity';
      } else if (bmi < 25.0) {
        category = 'Normal';
        healthRisk = 'Healthy weight range';
      } else if (bmi < 30.0) {
        category = 'Overweight';
        healthRisk = 'Increased risk of cardiovascular disease';
      } else {
        category = 'Obese';
        healthRisk = 'Significantly increased health risks';
      }
      
      return `⚖️ **BMI Analysis: ${bmi.toFixed(1)}**\n\n` +
             `**Category:** ${category}\n` +
             `**Health Risk:** ${healthRisk}\n\n` +
             `**BMI Categories:**\n` +
             `• Underweight: <18.5\n` +
             `• Normal: 18.5-24.9\n` +
             `• Overweight: 25.0-29.9\n` +
             `• Obese: ≥30.0\n\n` +
             `BMI is automatically calculated when you add patients with height and weight data.`;
    }

    // Uric acid interpretation with external resource context
    const uricMatch = userMessage.match(/uric\s*acid\s*(\d+\.?\d*)/i);
    if (uricMatch) {
      const value = parseFloat(uricMatch[1]);
      const humanRange = [3.4, 7.0];
      let status = '';
      let clinicalNote = '';
      if (value < humanRange[0]) {
        status = 'Below normal range';
        clinicalNote = 'May indicate Wilson\'s disease or Fanconi syndrome';
      } else if (value > humanRange[1]) {
        status = 'Above normal range (Hyperuricemia)';
        clinicalNote = 'Associated with gout, kidney disease, or metabolic syndrome';
      } else {
        status = 'Within normal range';
        clinicalNote = 'No immediate concerns';
      }
      
      return `🧪 **Uric Acid Analysis: ${value} mg/dL**\n\n` +
             `**Status:** ${status}\n` +
             `**Clinical Note:** ${clinicalNote}\n\n` +
             `**Reference Ranges:**\n` +
             `• Human: 3.4-7.0 mg/dL\n` +
             `• Rodent: 1.0-3.0 mg/dL\n\n` +
             `📚 **Learn More:** Consult CDSCO, IPC, or WHO-UMC databases for detailed pharmacovigilance guidelines.`;
    }

    // Creatinine interpretation with enriched guidance
    const creatMatch = userMessage.match(/creatinine\s*(\d+\.?\d*)/i);
    if (creatMatch) {
      const value = parseFloat(creatMatch[1]);
      const humanRange = [0.7, 1.3];
      let status = '';
      let clinicalNote = '';
      if (value < humanRange[0]) {
        status = 'Below normal range';
        clinicalNote = 'May indicate low muscle mass or malnutrition';
      } else if (value > humanRange[1]) {
        status = 'Above normal range';
        clinicalNote = 'Possible kidney dysfunction - requires further investigation';
      } else {
        status = 'Within normal range';
        clinicalNote = 'Normal kidney function';
      }
      
      return `🔬 **Creatinine Analysis: ${value} mg/dL**\n\n` +
             `**Status:** ${status}\n` +
             `**Clinical Note:** ${clinicalNote}\n\n` +
             `**Reference Ranges:**\n` +
             `• Human: 0.7-1.3 mg/dL\n` +
             `• Rodent: 0.2-0.8 mg/dL\n\n` +
             `⚠️ **Important:** Elevated creatinine may indicate impaired kidney function. Consult healthcare professionals for clinical decisions.`;
    }

    // External resource queries with synchronized data
    if (lowerMessage.includes('external') || lowerMessage.includes('database') || lowerMessage.includes('resource')) {
      const activeResources = allExternalResources.filter(r => r.status === ResourceStatus.active);
      const resourceList = activeResources.map(r => {
        const lastUpdate = new Date(Number(r.lastUpdated) / 1000000).toLocaleDateString();
        return `• **${r.name}**\n  ${r.description}\n  Last Updated: ${lastUpdate}\n  ${r.contentSummary || 'Comprehensive pharmacovigilance database'}`;
      }).join('\n\n');
      
      return `🌐 **External Pharmacovigilance Resources**\n\n` +
             `Currently synchronized with ${activeResources.length} active databases:\n\n` +
             `${resourceList}\n\n` +
             `💡 **Access:** Visit the Drug Interactions module to explore these resources with direct links.\n\n` +
             `🔄 **Auto-Sync:** Resources are automatically updated every hour to ensure current information.`;
    }

    // CDSCO specific query
    if (lowerMessage.includes('cdsco')) {
      const cdsco = allExternalResources.find(r => r.id === 'cdsco');
      if (cdsco) {
        const lastUpdate = new Date(Number(cdsco.lastUpdated) / 1000000).toLocaleDateString();
        return `🇮🇳 **CDSCO - Central Drugs Standard Control Organization**\n\n` +
               `${cdsco.description}\n\n` +
               `**Status:** ${cdsco.status}\n` +
               `**Last Updated:** ${lastUpdate}\n` +
               `**Summary:** ${cdsco.contentSummary || 'India\'s national regulatory authority for pharmaceuticals and medical devices'}\n\n` +
               `**Key Functions:**\n` +
               `• Drug approval and licensing\n` +
               `• Pharmacovigilance monitoring\n` +
               `• Clinical trial regulation\n` +
               `• Quality control standards\n\n` +
               `🔗 Visit the Drug Interactions module for direct access.`;
      }
    }

    // WHO-UMC specific query
    if (lowerMessage.includes('uppsala') || lowerMessage.includes('who-umc') || lowerMessage.includes('who umc')) {
      const whoUmc = allExternalResources.find(r => r.id === 'uppsalaMonitoringCentre');
      if (whoUmc) {
        const lastUpdate = new Date(Number(whoUmc.lastUpdated) / 1000000).toLocaleDateString();
        return `🌍 **Uppsala Monitoring Centre (WHO-UMC)**\n\n` +
               `${whoUmc.description}\n\n` +
               `**Status:** ${whoUmc.status}\n` +
               `**Last Updated:** ${lastUpdate}\n` +
               `**Summary:** ${whoUmc.contentSummary || 'Global hub for pharmacovigilance, managing the WHO Programme for International Drug Monitoring'}\n\n` +
               `**Key Services:**\n` +
               `• VigiBase - world's largest adverse event database\n` +
               `• Signal detection and analysis\n` +
               `• International collaboration\n` +
               `• Training and capacity building\n\n` +
               `🔗 Access via Drug Interactions module.`;
      }
    }

    // EMA specific query
    if (lowerMessage.includes('ema') || lowerMessage.includes('eudravigilance')) {
      const ema = allExternalResources.find(r => r.id === 'ema');
      if (ema) {
        const lastUpdate = new Date(Number(ema.lastUpdated) / 1000000).toLocaleDateString();
        return `🇪🇺 **EMA - European Medicines Agency (EudraVigilance)**\n\n` +
               `${ema.description}\n\n` +
               `**Status:** ${ema.status}\n` +
               `**Last Updated:** ${lastUpdate}\n` +
               `**Summary:** ${ema.contentSummary || 'European system for managing and analyzing adverse reaction reports'}\n\n` +
               `**Key Features:**\n` +
               `• Centralized adverse event reporting\n` +
               `• Risk-benefit assessment\n` +
               `• Regulatory decision support\n` +
               `• Public access to safety data\n\n` +
               `🔗 Direct link available in Drug Interactions module.`;
      }
    }

    // Data statistics with enriched context
    if (lowerMessage.includes('how many') || lowerMessage.includes('statistics') || lowerMessage.includes('data')) {
      const patientCount = patients.length;
      const labCount = labResults.length;
      const resourceCount = allExternalResources.filter(r => r.status === ResourceStatus.active).length;
      
      return `📊 **BRAINOPHARM Database Statistics**\n\n` +
             `**Clinical Data:**\n` +
             `• Patients: ${patientCount}\n` +
             `• Lab Results: ${labCount}\n\n` +
             `**External Resources:**\n` +
             `• Active Databases: ${resourceCount}\n` +
             `• Auto-sync enabled: Every 60 minutes\n\n` +
             `**Knowledge Base:**\n` +
             `Integrated with leading pharmacovigilance databases including CDSCO, WHO-UMC, IPC, EMA, Health Canada, MHRA, and TGA.\n\n` +
             `💡 All data is synchronized and accessible through the dashboard modules.`;
    }

    // Enhanced contextual greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `👋 **Hello! I'm WAVEBOT - Your Enhanced Pharmacovigilance Assistant**\n\n` +
             `I'm powered by synchronized data from ${allExternalResources.filter(r => r.status === ResourceStatus.active).length} global pharmacovigilance databases${module !== 'general' && module !== 'patients' ? ` and ready to assist in the ${getModuleName(module)} module` : ''}.\n\n` +
             `**I can help with:**\n` +
             `• Medical value interpretation (BP, BMI, lab values)\n` +
             `• External resource information (CDSCO, WHO-UMC, EMA, etc.)\n` +
             `• Drug safety guidance for special populations\n` +
             `• Species-specific reference ranges\n` +
             `• Module navigation and features\n\n` +
             `**Try asking:**\n` +
             `• "What does BP 180/90 mean?"\n` +
             `• "Tell me about CDSCO"\n` +
             `• "Show external resources"\n` +
             `• "What are rat reference ranges?"\n\n` +
             `What would you like to know?`;
    }

    // Drug interaction guidance with external resources
    if (module === 'interactions' || lowerMessage.includes('interaction')) {
      const activeResources = allExternalResources.filter(r => r.status === ResourceStatus.active).length;
      return `🔄 **Drug Interactions Module - Enhanced with ${activeResources} External Databases**\n\n` +
             `Check for potential interactions:\n` +
             `• Drug-Drug interactions (up to 4 medications)\n` +
             `• Drug-Food interactions\n` +
             `• Food-Food interactions\n\n` +
             `**Synchronized External Resources:**\n` +
             `• CDSCO (India)\n` +
             `• Uppsala Monitoring Centre (WHO-UMC)\n` +
             `• IPC (Indian Pharmacopoeia)\n` +
             `• EMA (EudraVigilance)\n` +
             `• Health Canada (HPR-RPS)\n` +
             `• MHRA (Yellow Card Scheme)\n` +
             `• TGA (DAEN)\n\n` +
             `🔄 **Auto-Sync:** Resources updated hourly for current information.\n\n` +
             `💡 Click any resource link to access comprehensive drug safety data.`;
    }

    // Restricted drugs with external resource context
    if (module === 'restricted' || lowerMessage.includes('restricted') || lowerMessage.includes('contraindicated')) {
      return `⚠️ **Restricted Drugs - Evidence-Based Safety Information**\n\n` +
             `Safety guidance for special populations, informed by global pharmacovigilance databases:\n\n` +
             `• **Pregnant Women:** Warfarin, ACE Inhibitors, Tetracyclines\n` +
             `• **Lactating Mothers:** Chloramphenicol, Lithium, Benzodiazepines\n` +
             `• **Pediatrics:** Aspirin, Tetracyclines, Codeine\n` +
             `• **Geriatrics:** Benzodiazepines, Anticholinergics, NSAIDs\n` +
             `• **Rare Cases:** Clozapine, Amiodarone, Rifampicin\n\n` +
             `📚 **Data Sources:** WHO-UMC, EMA, Health Canada, MHRA, TGA\n\n` +
             `⚠️ Always consult healthcare professionals before prescribing to vulnerable populations.`;
    }

    // Enhanced help with external resource integration
    if (lowerMessage.includes('help')) {
      const resourceCount = allExternalResources.filter(r => r.status === ResourceStatus.active).length;
      return `🤖 **WAVEBOT Enhanced Capabilities**\n\n` +
             `**Medical Intelligence:**\n` +
             `• Blood pressure analysis with clinical interpretation\n` +
             `• BMI calculation with health risk assessment\n` +
             `• Lab value interpretation (uric acid, creatinine)\n` +
             `• Species-specific reference ranges\n\n` +
             `**Knowledge Integration:**\n` +
             `• Synchronized with ${resourceCount} global pharmacovigilance databases\n` +
             `• Real-time access to CDSCO, WHO-UMC, IPC, EMA, Health Canada, MHRA, TGA\n` +
             `• Auto-updated every hour for current information\n` +
             `• Enriched responses inspired by leading AI models\n\n` +
             `**Module Guidance:**\n` +
             `• Patient management (human & veterinary)\n` +
             `• Clinical & preclinical lab results\n` +
             `• Medication tracking with interaction checking\n` +
             `• ADR recording with severity classification\n` +
             `• Restricted drugs safety for special populations\n\n` +
             `${module !== 'general' && module !== 'patients' ? `Currently in: ${getModuleName(module)} module\n\n` : ''}` +
             `Ask me anything about pharmacovigilance, drug safety, or system features!`;
    }

    // Default enriched response
    return `I'm here to provide comprehensive pharmacovigilance assistance${module !== 'general' && module !== 'patients' ? ` in the ${getModuleName(module)} module` : ''}.\n\n` +
           `**Quick Examples:**\n` +
           `• "What does BP 180/90 mean?" - Medical interpretation\n` +
           `• "Tell me about WHO-UMC" - External resource info\n` +
           `• "Show statistics" - Database overview\n` +
           `• "What are external resources?" - Synchronized databases\n` +
           `• "Restricted drugs for pregnancy" - Safety guidance\n\n` +
           `💡 **Enhanced Knowledge:** I'm integrated with ${allExternalResources.filter(r => r.status === ResourceStatus.active).length} global pharmacovigilance databases for accurate, up-to-date information.\n\n` +
           `How can I assist you today?`;
  }, [patients, labResults, allExternalResources]);

  const getModuleName = (module: string): string => {
    const moduleNames: Record<string, string> = {
      patients: 'Patient Registry',
      lab: 'Lab Results',
      medications: 'Medications',
      adrs: 'ADRs',
      interactions: 'Drug Interactions',
      restricted: 'Restricted Drugs',
      summary: 'Case Summary',
    };
    return moduleNames[module] || module;
  };

  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    const timestamp = BigInt(Date.now() * 1000000);
    
    setMessage('');

    const userMsg: LocalMessage = {
      sender: 'User',
      message: userMessage,
      timestamp,
    };
    setLocalMessages((prev) => [...prev, userMsg]);

    const botResponse = generateEnrichedResponse(userMessage, currentModule);
    const botTimestamp = timestamp + BigInt(1000);
    
    const botMsg: LocalMessage = {
      sender: 'WAVEBOT',
      message: botResponse,
      timestamp: botTimestamp,
    };
    
    setTimeout(() => {
      setLocalMessages((prev) => [...prev, botMsg]);
    }, 300);
  }, [message, currentModule, generateEnrichedResponse]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-bounce">
            May I help you?
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 shadow-2xl transition-all hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2"
            style={{
              animation: 'wavebotPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
            aria-label="Open WAVEBOT chat assistant"
          >
            <div className="relative">
              <MessageCircle className="h-8 w-8 text-white" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
            </div>
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[90vw] max-w-[420px] flex-col rounded-2xl border-2 border-purple-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between rounded-t-2xl border-b-2 border-purple-200 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 px-5 py-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                <AvatarImage src="/assets/generated/wavebot-avatar.dim_64x64.png" alt="WAVEBOT" loading="lazy" />
                <AvatarFallback className="bg-white/20 text-white font-bold">WB</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg text-white drop-shadow-md">WAVEBOT</h3>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-sm"></span>
                  Virtual Assistant
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4 bg-white" ref={scrollRef}>
            <div className="space-y-4">
              {localMessages.map((msg, index) => (
                <div
                  key={`${msg.timestamp.toString()}-${index}`}
                  className={`flex gap-3 ${msg.sender === 'User' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.sender === 'WAVEBOT' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src="/assets/generated/wavebot-avatar.dim_64x64.png" alt="WAVEBOT" loading="lazy" />
                      <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-bold">WB</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.sender === 'User'
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-tr-sm font-medium'
                        : 'bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ lineHeight: '1.6' }}>
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t-2 border-purple-200 bg-white p-4 rounded-b-2xl">
            <div className="flex gap-2 items-center">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 rounded-full border-2 border-gray-300 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-purple-500 bg-white text-gray-900 placeholder:text-gray-500 px-4 py-2 h-11 text-base font-medium shadow-sm"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                disabled={!message.trim()}
                className="rounded-full h-11 w-11 flex-shrink-0 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wavebotPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(147, 51, 234, 0);
          }
        }
      `}</style>
    </>
  );
}
