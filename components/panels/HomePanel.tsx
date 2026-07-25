import { motion } from 'motion/react';
import {
  Sparkles,
  UploadCloud,
  Database,
  Check,
  Activity,
  RefreshCw,
  LineChart,
  ChevronRight,
} from 'lucide-react';

interface HomePanelProps {
  setActivePanel: (panel: any) => void;
}

export default function HomePanel({ setActivePanel }: HomePanelProps) {
  return (
    <div className="space-y-16 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-full text-[#C9A227] text-xs font-bold backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI‑Powered Plant Health Intelligence</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[#E8E4D9] leading-[1.1]">
            Revolutionize Plant Disease Detection with{' '}
            <span className="bg-gradient-to-r from-[#4A7C59] to-[#C9A227] bg-clip-text text-transparent">Deep Learning</span>
          </h1>
          <p className="text-[#B9C4B5] text-lg leading-relaxed max-w-2xl">
            An enterprise‑grade computer vision platform using advanced image preprocessing (CLAHE, segmentation) and
            state‑of‑the‑art CNN models to deliver real‑time crop diagnoses – even in challenging field conditions.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => setActivePanel('scan')}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4A7C59] to-[#3C6549] hover:scale-105 transition-all text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-[#4A7C59]/30"
            >
              <UploadCloud className="w-5 h-5" />
              <span>Start Diagnosis</span>
            </button>
            <button
              onClick={() => setActivePanel('database')}
              className="flex items-center gap-2 bg-[#131C14]/80 backdrop-blur-sm border border-[#4A7C59]/25 hover:border-[#4A7C59]/50 hover:bg-[#4A7C59]/10 text-[#E8E4D9] px-8 py-4 rounded-2xl font-semibold transition-all shadow-sm"
            >
              <Database className="w-5 h-5" />
              <span>Explore Catalog</span>
            </button>
          </div>
        </div>
        <div className="lg:col-span-5 relative">
          <div className="bg-gradient-to-br from-[#131C14]/90 to-[#0F160F] rounded-3xl p-6 border border-[#4A7C59]/20 shadow-2xl shadow-black/40 overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#4A7C59]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C9A227]/15 rounded-full blur-3xl" />
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#4A7C59]/20 bg-[#0B120C]/60 backdrop-blur-sm shadow-inner flex flex-col justify-between p-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#6B8072] font-mono tracking-wider">
                <span>PREPROCESSING VIEW</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> CLAHE ENABLED
                </span>
              </div>
              <div className="my-auto flex flex-col items-center">
                <div className="w-36 h-36 rounded-full bg-[#4A7C59]/10 border border-[#4A7C59]/25 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className="w-24 h-24 rounded-full border-4 border-dashed border-[#4A7C59] flex items-center justify-center"
                  >
                    <Activity className="w-10 h-10 text-[#8FCF9D]" />
                  </motion.div>
                </div>
                <span className="mt-4 font-bold text-[#E8E4D9] text-sm">Segmentation: Otsu{`'`}s Threshold</span>
                <span className="text-[11px] text-[#8CA292]">Isolation of leaf chlorosis & necrosis spots</span>
              </div>
              <div className="bg-[#0B120C]/90 backdrop-blur-sm rounded-xl p-3 text-white flex items-center justify-between text-xs border border-[#4A7C59]/20">
                <div>
                  <p className="font-semibold text-emerald-400">Tomato Early Blight</p>
                  <p className="text-[10px] text-[#6B8072]">Severity: High</p>
                </div>
                <span className="bg-[#C9A227]/15 text-[#C9A227] px-2 py-1 rounded font-bold font-mono">98.7% Conf</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Crops */}
      <div className="space-y-6 pt-8 border-t border-[#4A7C59]/15">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-[#E8E4D9]">Supported Crops</h2>
          <p className="text-[#8CA292] text-sm">Trained on 38 clinically validated plant disease classes</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { name: 'Tomato', count: 'Early/Late Blight, Mold, Healthy', bg: 'bg-rose-500/10 border-rose-500/25 text-rose-300' },
            { name: 'Potato', count: 'Early/Late Blight, Healthy', bg: 'bg-amber-500/10 border-amber-500/25 text-amber-300' },
            { name: 'Corn (Maize)', count: 'Common Rust, Northern Blight', bg: 'bg-yellow-500/10 border-yellow-500/25 text-yellow-300' },
            { name: 'Apple & Pepper', count: 'Scab, Cedar Rust, Bacterial Spot', bg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' },
          ].map((crop, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${crop.bg} text-center space-y-1 shadow-sm hover:shadow-md hover:shadow-black/20 transition-all hover:-translate-y-0.5`}
            >
              <p className="font-bold text-lg">{crop.name}</p>
              <p className="text-xs opacity-80">{crop.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline */}
      <div className="space-y-8 pt-8 border-t border-[#4A7C59]/15">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-[#E8E4D9]">Robust Image Processing Pipeline</h2>
          <p className="text-[#8CA292] text-sm">How we maintain accuracy under environmental variance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: '1. Environmental Normalization',
              desc: 'Applies CLAHE and fast non‑local means denoising to restore detail in dark, overexposed, or noisy conditions.',
              icon: <RefreshCw className="w-6 h-6 text-amber-400" />,
              bg: 'bg-amber-500/5 border-amber-500/20',
            },
            {
              title: '2. Foliage Segmentation',
              desc: 'Segments green leaves from background clutter, mulch, or plastic tunnels, feeding pure leaf pixels to the neural network.',
              icon: <Activity className="w-6 h-6 text-emerald-400" />,
              bg: 'bg-emerald-500/5 border-emerald-500/20',
            },
            {
              title: '3. CNN Inference',
              desc: 'Feeds 224×224×3 preprocessed tensor to a MobileNetV2/ResNet‑based model to compute disease class probabilities and treatment charts.',
              icon: <LineChart className="w-6 h-6 text-indigo-400" />,
              bg: 'bg-indigo-500/5 border-indigo-500/20',
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${step.bg} backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-black/20 transition-all hover:-translate-y-1`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#131C14]/80 border border-[#4A7C59]/20 flex items-center justify-center shadow-sm">
                {step.icon}
              </div>
              <h3 className="font-bold text-base text-[#E8E4D9] mt-3">{step.title}</h3>
              <p className="text-xs text-[#B9C4B5] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#2E4A36] to-[#1B2B1E] border border-[#4A7C59]/20 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-black/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4A7C59]/25 rounded-full blur-3xl" />
        <div className="relative space-y-4 max-w-xl">
          <h3 className="text-3xl font-bold">Ready to Diagnose?</h3>
          <p className="text-[#B9C4B5] text-sm leading-relaxed">
            Analyze crop health instantly. Log in with Google to save histories, generate clinical PDF reports, and track
            your farm{`'`}s health statistics.
          </p>
          <button
            onClick={() => setActivePanel('scan')}
            className="bg-[#E8E4D9] text-[#0B120C] px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <span>Launch Analyzer</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}