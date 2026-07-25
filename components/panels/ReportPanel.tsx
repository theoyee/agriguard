import { ArrowLeft, Download } from 'lucide-react';

interface ReportPanelProps {
  predictionData: any;
  predictionId: string | null;
  setActivePanel: (panel: any) => void;
  triggerReportPrint: () => void;
}

export default function ReportPanel({
  predictionData,
  predictionId,
  setActivePanel,
  triggerReportPrint,
}: ReportPanelProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between bg-[#131C14]/90 backdrop-blur-sm border border-[#4A7C59]/20 p-4 rounded-2xl print:hidden shadow-sm shadow-black/10">
        <button
          onClick={() => setActivePanel('scan')}
          className="flex items-center gap-1.5 text-xs text-[#8CA292] font-semibold hover:text-[#E8E4D9] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Diagnostic Details</span>
        </button>
        <button
          onClick={triggerReportPrint}
          className="flex items-center gap-2 bg-gradient-to-r from-[#4A7C59] to-[#3C6549] hover:from-[#588C67] hover:to-[#4A7C59] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#4A7C59]/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download Printable PDF Report</span>
        </button>
      </div>

      {/*
        The report sheet itself stays on a white paper background deliberately —
        this is what gets printed to PDF, so it should read as a clean, high-contrast
        clinical document rather than mirror the app's dark shell.
      */}
      <div className="bg-white border-4 border-slate-200 p-8 sm:p-12 shadow-md space-y-8 text-slate-950 font-serif max-w-full relative" id="clinical_report_sheet">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4A7C59] via-[#C9A227] to-[#4A7C59] print:hidden" />
        <div className="border-b-4 border-slate-950 pb-6 pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight uppercase leading-none">Plant Pathology Diagnosis Center</h3>
            <p className="text-xs font-sans text-slate-500 font-medium mt-1 uppercase tracking-widest">Plant Disease Detection System Research Division</p>
            <p className="text-[10px] font-sans text-slate-400 font-medium">Sunday Glory</p>
          </div>
          <div className="text-left sm:text-right font-sans text-xs space-y-1">
            <p><span className="font-semibold uppercase text-slate-500 text-[10px]">REPORT ID:</span> <span className="font-mono">{predictionId || 'REP-GUEST-001'}</span></p>
            <p><span className="font-semibold uppercase text-slate-500 text-[10px]">DATE GENERATED:</span> <span className="font-mono">{new Date().toLocaleDateString()}</span></p>
            <p><span className="font-semibold uppercase text-slate-500 text-[10px]">CROP SUBJECT:</span> {predictionData.prediction.plant}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
          <div className="space-y-3">
            <h4 className="font-sans font-extrabold text-[11px] uppercase tracking-wider text-slate-400">Diagnosed Plant Disease</h4>
            <div className="font-serif">
              <p className="text-2xl font-black">{predictionData.prediction.disease}</p>
              <p className="text-xs text-emerald-700 font-bold italic mt-0.5">{predictionData.prediction.scientificName}</p>
            </div>
            <p className="text-xs leading-relaxed text-slate-700">{predictionData.prediction.description}</p>
            <div className="pt-2 font-sans space-y-1.5 text-xs">
              <p><span className="font-bold text-slate-500 text-[10px] uppercase">DIAGNOSTIC CONFIDENCE:</span> <span className="font-mono">{predictionData.prediction.confidence}%</span></p>
              <p><span className="font-bold text-slate-500 text-[10px] uppercase">SEVERITY RATING:</span> {predictionData.prediction.severity}</p>
              <p><span className="font-bold text-slate-500 text-[10px] uppercase">PREPROCESSING RATIO:</span> <span className="font-mono">{predictionData.preprocessing.leafCoveragePercentage}%</span></p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-sans font-extrabold text-[11px] uppercase tracking-wider text-slate-400">Captured Leaf Foliage</h4>
            <div className="border border-slate-200 aspect-video rounded-xl overflow-hidden bg-slate-50">
              <img src={predictionData.preprocessing.images.segmented} className="w-full h-full object-cover" />
            </div>
            <span className="block text-[10px] text-slate-400 font-sans text-center">Foliage Segmented Isolation Mask</span>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t">
          <h4 className="font-sans font-extrabold text-[11px] uppercase tracking-wider text-slate-400">Diagnostic Interventions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed">
            <div className="space-y-1">
              <p className="font-sans font-extrabold text-[10px] uppercase text-emerald-800">Organic Intervention</p>
              <p className="text-slate-800 font-medium">{predictionData.prediction.treatment.organic}</p>
            </div>
            <div className="space-y-1">
              <p className="font-sans font-extrabold text-[10px] uppercase text-indigo-800">Chemical Intervention</p>
              <p className="text-slate-800 font-medium">{predictionData.prediction.treatment.chemical}</p>
            </div>
            <div className="space-y-1">
              <p className="font-sans font-extrabold text-[10px] uppercase text-amber-800">Nutrient Recommendation</p>
              <p className="text-slate-800 font-medium">{predictionData.prediction.treatment.fertilizer}</p>
            </div>
            <div className="space-y-1">
              <p className="font-sans font-extrabold text-[10px] uppercase text-slate-800">Pathology Prevention tips</p>
              <p className="text-slate-800 font-medium">{predictionData.prediction.treatment.prevention}</p>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t-2 border-slate-900 flex justify-between items-end gap-6 font-sans">
          <div className="text-left space-y-1">
            <div className="w-32 border-b border-slate-900 h-8" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CENTER OFFICIAL SIGNATURE</p>
            <p className="text-xs font-semibold text-slate-800">System Automation Lab</p>
          </div>
          <div className="text-right space-y-1">
            <div className="w-32 border-b border-slate-900 h-8 ml-auto" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">STUDENT SIGN-OFF</p>
            <p className="text-xs font-semibold text-slate-800">Sunday. Glory (Project Lead)</p>
          </div>
        </div>
      </div>
    </div>
  );
}