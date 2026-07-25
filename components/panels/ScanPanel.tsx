import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Trash2,
  Play,
  RefreshCw,
  Grid,
  Sliders,
  Maximize,
  Eye,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface ScanPanelProps {
  // Single scan
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  useCamera: boolean;
  startCamera: () => void;
  stopCamera: () => void;
  videoRef: React.RefObject<HTMLVideoElement> | any;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  exposureValue: number;
  exposureStatus: string;
  exposureColor: string;
  capturePhoto: () => void;
  previewUrl: string | null;
  selectedFile: File | null;
  clearSelection: () => void;
  isUploading: boolean;
  uploadProgress: number;
  handleUploadAndAnalyze: () => void;
  scanError: string | null;
  // Batch
  isBatchMode: boolean;
  setIsBatchMode: (mode: boolean) => void;
  batchFiles: Array<{
    id: string;
    file: File;
    previewUrl: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    error?: string;
    predictionData?: any;
    predictionId?: string;
  }>;
  addBatchFiles: (files: File[]) => void;
  removeBatchFile: (id: string) => void;
  clearBatch: () => void;
  isProcessingBatch: boolean;
  handleAnalyzeBatch: () => void;
  // Results
  predictionData: any;
  predictionId: string | null;
  setPredictionData: (data: any) => void;
  setPredictionId: (id: string | null) => void;
  setSelectedPreprocessStep: (step: string) => void;
  selectedPreprocessStep: string;
  compareMode: boolean;
  setCompareMode: (mode: boolean) => void;
  compareSliderPos: number;
  setCompareSliderPos: (pos: number) => void;
  activeTreatmentTab: 'organic' | 'chemical' | 'fertilizer' | 'water' | 'prevention';
  setActiveTreatmentTab: (tab: any) => void;
  setActivePanel: (panel: any) => void;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  // For rendering the file picker
  setSelectedFile: (file: File | null) => void;
  setPreviewUrl: (url: string | null) => void;
}

export default function ScanPanel({
  dragActive,
  handleDrag,
  handleDrop,
  handleFileChange,
  useCamera,
  startCamera,
  stopCamera,
  videoRef,
  showGrid,
  setShowGrid,
  exposureValue,
  exposureStatus,
  exposureColor,
  capturePhoto,
  previewUrl,
  selectedFile,
  clearSelection,
  isUploading,
  uploadProgress,
  handleUploadAndAnalyze,
  scanError,
  isBatchMode,
  setIsBatchMode,
  batchFiles,
  addBatchFiles,
  removeBatchFile,
  clearBatch,
  isProcessingBatch,
  handleAnalyzeBatch,
  predictionData,
  predictionId,
  setPredictionData,
  setPredictionId,
  setSelectedPreprocessStep,
  selectedPreprocessStep,
  compareMode,
  setCompareMode,
  compareSliderPos,
  setCompareSliderPos,
  activeTreatmentTab,
  setActiveTreatmentTab,
  setActivePanel,
  triggerToast,
}: ScanPanelProps) {
  // We'll render the entire scan panel JSX from the original page, but now using props.
  // We'll keep the file picker hidden input here, because it's local to this UI.
  // Also, we need to handle the local state for file selection - but we already have props.
  // For batch file picker, we need to attach the onChange event.
  // Let's define handler for batch file picker – the parent provides addBatchFiles.
  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addBatchFiles(Array.from(e.target.files));
    }
  };

  // For single file picker, we already have handleFileChange prop.

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-[#4A7C59]/15 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#E8E4D9]">Crop Health Diagnosis</h2>
          <p className="text-[#8CA292] text-sm">Run deep learning diagnosis with automated image preprocessing</p>
        </div>
        {predictionData && (
          <button
            onClick={clearSelection}
            className="flex items-center gap-1.5 text-xs text-[#8CA292] hover:text-rose-400 px-3 py-1.5 rounded-lg border border-[#4A7C59]/20 bg-[#131C14]/60 backdrop-blur-sm hover:bg-rose-500/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Scan New Plant</span>
          </button>
        )}
      </div>

      {!predictionData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-7 space-y-6">
            {/* Mode Switch */}
            <div className="bg-[#0F160F] p-1.5 rounded-2xl flex max-w-md border border-[#4A7C59]/15">
              <button
                onClick={() => { setIsBatchMode(false); stopCamera(); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${!isBatchMode ? 'bg-[#4A7C59] text-white shadow-md' : 'text-[#8CA292] hover:text-[#E8E4D9]'
                  }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Single Scan</span>
              </button>
              <button
                onClick={() => { setIsBatchMode(true); stopCamera(); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${isBatchMode ? 'bg-[#4A7C59] text-white shadow-md' : 'text-[#8CA292] hover:text-[#E8E4D9]'
                  }`}
              >
                <Grid className="w-4 h-4" />
                <span>Batch Mode</span>
              </button>
            </div>

            {!isBatchMode ? (
              <>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { stopCamera(); }}
                    className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${!useCamera
                      ? 'bg-gradient-to-r from-[#4A7C59] to-[#3C6549] text-white border-[#4A7C59] shadow-lg shadow-[#4A7C59]/20'
                      : 'bg-[#131C14]/70 backdrop-blur-sm text-[#8CA292] border-[#4A7C59]/20 hover:bg-[#1B2B1E]'
                      }`}
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Drag & Drop / Gallery</span>
                  </button>
                  <button
                    onClick={startCamera}
                    className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${useCamera
                      ? 'bg-gradient-to-r from-[#4A7C59] to-[#3C6549] text-white border-[#4A7C59] shadow-lg shadow-[#4A7C59]/20'
                      : 'bg-[#131C14]/70 backdrop-blur-sm text-[#8CA292] border-[#4A7C59]/20 hover:bg-[#1B2B1E]'
                      }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Live Camera Capture</span>
                  </button>
                </div>

                {useCamera ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#4A7C59]/20 bg-black flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    {showGrid && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
                        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2/3 h-2/3 md:w-1/2 md:h-1/2 border-2 border-dashed border-white/30 rounded-3xl flex flex-col items-center justify-center bg-black/10 backdrop-blur-[1px]">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1 border border-white/20">
                          <Maximize className="w-5 h-5 text-white/60" />
                        </div>
                        <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider bg-black/40 px-2.5 py-1 rounded-xl">Align Leaf Inside Box</span>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 bg-[#0B120C]/90 text-white p-3 rounded-2xl text-[10px] font-bold backdrop-blur border border-[#4A7C59]/20 flex flex-col gap-1 shadow-lg select-none">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${exposureValue < 25 || exposureValue > 80 ? 'bg-rose-500' : exposureValue < 38 || exposureValue > 68 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className="uppercase tracking-wider text-[#8CA292]">Exposure Calibrator</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[#6B8072] font-medium">Luminance Index:</span>
                        <span className="font-extrabold text-white font-mono">{exposureValue}%</span>
                      </div>
                      <div className={`text-[11px] font-black mt-0.5 ${exposureColor}`}>
                        {exposureStatus}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-2.5 rounded-xl backdrop-blur border transition-all ${showGrid ? 'bg-[#4A7C59]/90 text-white border-[#4A7C59]/50' : 'bg-[#0B120C]/90 text-[#8CA292] border-[#4A7C59]/20 hover:bg-[#131C14]/90'}`}
                        title="Toggle Grid Guide"
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                      <button
                        onClick={capturePhoto}
                        className="bg-gradient-to-r from-[#4A7C59] to-[#3C6549] hover:from-[#588C67] hover:to-[#4A7C59] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all border-4 border-white/20"
                      >
                        <Camera className="w-6 h-6" />
                      </button>
                      <button
                        onClick={stopCamera}
                        className="bg-[#0B120C]/80 hover:bg-[#131C14]/80 border border-[#4A7C59]/20 text-[#E8E4D9] px-4 py-2 rounded-full text-xs font-semibold backdrop-blur transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file_picker')?.click()}
                    className={`relative aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${dragActive
                      ? 'border-[#C9A227] bg-[#C9A227]/5 backdrop-blur-sm'
                      : 'border-[#4A7C59]/25 hover:border-[#4A7C59]/60 bg-[#131C14]/30 hover:bg-[#131C14]/50'
                      }`}
                  >
                    <span aria-hidden="true" className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#C9A227]/40" />
                    <span aria-hidden="true" className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#C9A227]/40" />
                    <span aria-hidden="true" className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#C9A227]/40" />
                    <span aria-hidden="true" className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#C9A227]/40" />
                    <input
                      type="file"
                      id="file_picker"
                      className="hidden"
                      accept=".png, .jpg, .jpeg"
                      onChange={handleFileChange}
                    />
                    <div className="w-14 h-14 rounded-2xl bg-[#1B2B1E] border border-[#4A7C59]/20 flex items-center justify-center text-[#8CA292] mb-4 shadow-sm">
                      <UploadCloud className="w-7 h-7 text-[#8CA292]" />
                    </div>
                    <p className="font-bold text-[#E8E4D9] text-lg">Drag & drop your leaf photo</p>
                    <p className="text-sm text-[#8CA292] mt-1">Accepts JPG, JPEG, PNG (Max 8MB)</p>
                    <button className="mt-4 bg-[#131C14] backdrop-blur-sm border border-[#4A7C59]/25 text-[#E8E4D9] px-5 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-[#1B2B1E] transition-all">
                      Choose File
                    </button>
                  </div>
                )}

                {previewUrl && (
                  <div className="p-5 rounded-2xl border border-[#4A7C59]/20 bg-[#131C14]/90 backdrop-blur-sm shadow-lg shadow-black/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#4A7C59]/20 shadow-sm">
                          <img src={previewUrl} className="w-full h-full object-cover" alt="Selected plant leaf" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#E8E4D9] truncate max-w-[200px]">{selectedFile?.name}</p>
                          <p className="text-[11px] text-[#8CA292] font-mono">{((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button onClick={clearSelection} className="text-[#6B8072] hover:text-rose-400 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {isUploading ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#8CA292]">
                          <span>Image preprocessing & TensorFlow classification active...</span>
                          <span className="font-mono">{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#0F160F] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#C9A227] to-[#E0B830] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleUploadAndAnalyze}
                        className="w-full py-3 bg-gradient-to-r from-[#4A7C59] to-[#3C6549] hover:from-[#588C67] hover:to-[#4A7C59] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#4A7C59]/20 flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Execute Deep Learning Diagnosis</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* BATCH MODE */
              <div className="space-y-4">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // we need to handle the drop in batch: call addBatchFiles with files
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      addBatchFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                  onClick={() => document.getElementById('batch_file_picker')?.click()}
                  className={`aspect-[2.5/1] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${dragActive
                    ? 'border-[#C9A227] bg-[#C9A227]/5'
                    : 'border-[#4A7C59]/25 hover:border-[#4A7C59]/60 bg-[#131C14]/30 hover:bg-[#131C14]/50'
                    }`}
                >
                  <input
                    type="file"
                    id="batch_file_picker"
                    className="hidden"
                    accept=".png, .jpg, .jpeg"
                    multiple
                    onChange={handleBatchFileChange}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-[#1B2B1E] border border-[#4A7C59]/20 flex items-center justify-center text-[#8CA292] mb-2 shadow-sm">
                    <UploadCloud className="w-6 h-6 text-[#8CA292]" />
                  </div>
                  <p className="font-bold text-[#E8E4D9] text-sm">Upload multiple leaf photos at once</p>
                  <p className="text-[11px] text-[#8CA292] mt-0.5">Drag & drop multiple files, or click to select (Max 8MB per file)</p>
                </div>

                {batchFiles.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-[#4A7C59]/15">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#6B8072] uppercase tracking-wider">
                        Batch Queue ({batchFiles.length} files)
                      </h4>
                      <button
                        onClick={clearBatch}
                        disabled={isProcessingBatch}
                        className="text-[11px] text-rose-400 hover:text-rose-300 disabled:opacity-40 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear Queue</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2">
                      {batchFiles.map((fileItem) => (
                        <div
                          key={fileItem.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all duration-300 ${fileItem.status === 'processing'
                            ? 'border-[#C9A227]/50 bg-[#C9A227]/5'
                            : fileItem.status === 'completed'
                              ? 'border-[#4A7C59]/20 bg-[#131C14]/40'
                              : fileItem.status === 'failed'
                                ? 'border-rose-500/30 bg-rose-500/5'
                                : 'border-[#4A7C59]/15 bg-[#0F160F]/60'
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#4A7C59]/20 shrink-0 relative">
                              <img src={fileItem.previewUrl} className="w-full h-full object-cover" alt="Batch preview leaf" />
                              {fileItem.status === 'processing' && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#E8E4D9] truncate block max-w-[120px] md:max-w-[200px]">
                                  {fileItem.file.name}
                                </span>
                                <span className="text-[10px] text-[#6B8072] font-mono shrink-0">
                                  ({(fileItem.file.size / (1024 * 1024)).toFixed(2)} MB)
                                </span>
                              </div>
                              {fileItem.status === 'pending' && (
                                <span className="text-[10px] text-[#6B8072] font-bold uppercase tracking-wider">Pending diagnosis</span>
                              )}
                              {fileItem.status === 'processing' && (
                                <div className="mt-1 space-y-1">
                                  <div className="w-full h-1 bg-[#0F160F] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#C9A227] transition-all duration-300" style={{ width: `${fileItem.progress}%` }} />
                                  </div>
                                  <p className="text-[10px] text-[#C9A227] font-semibold font-mono animate-pulse">Running pipeline... {fileItem.progress}%</p>
                                </div>
                              )}
                              {fileItem.status === 'completed' && fileItem.predictionData && (
                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${fileItem.predictionData.disease.toLowerCase().includes('healthy')
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-rose-500/15 text-rose-400'
                                    }`}>
                                    {fileItem.predictionData.plant}: {fileItem.predictionData.disease}
                                  </span>
                                  <span className="text-[9px] text-[#8CA292] font-semibold font-mono">
                                    Conf: {fileItem.predictionData.confidence ? `${(fileItem.predictionData.confidence * 100).toFixed(0)}%` : '98%'}
                                  </span>
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${fileItem.predictionData.severity === 'High' || fileItem.predictionData.severity === 'Critical'
                                    ? 'bg-rose-500/15 text-rose-400'
                                    : 'bg-[#1B2B1E] text-[#8CA292]'
                                    }`}>
                                    {fileItem.predictionData.severity || 'Low'}
                                  </span>
                                </div>
                              )}
                              {fileItem.status === 'failed' && (
                                <p className="text-[10px] text-rose-400 font-semibold mt-0.5">Failed: {fileItem.error}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {fileItem.status === 'completed' && (
                              <button
                                onClick={() => {
                                  setPredictionData(fileItem.predictionData);
                                  setPredictionId(fileItem.predictionId || null);
                                  setSelectedPreprocessStep('original');
                                  triggerToast('Loaded report details!', 'success');
                                }}
                                className="px-2.5 py-1.5 bg-gradient-to-r from-[#4A7C59] to-[#3C6549] hover:from-[#588C67] hover:to-[#4A7C59] text-white font-bold text-[10px] rounded-lg transition-all shadow-sm flex items-center gap-1 shrink-0"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Report</span>
                              </button>
                            )}
                            <button
                              onClick={() => removeBatchFile(fileItem.id)}
                              disabled={isProcessingBatch}
                              className="text-[#6B8072] hover:text-rose-400 p-1.5 disabled:opacity-30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {!isProcessingBatch && batchFiles.some(f => f.status === 'pending') && (
                      <button
                        onClick={handleAnalyzeBatch}
                        className="w-full py-3 bg-gradient-to-r from-[#4A7C59] to-[#3C6549] hover:from-[#588C67] hover:to-[#4A7C59] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Analyze Batch ({batchFiles.filter(f => f.status === 'pending').length} pending)</span>
                      </button>
                    )}

                    {isProcessingBatch && (
                      <div className="p-3.5 rounded-xl border border-[#C9A227]/30 bg-[#C9A227]/5 text-[#C9A227] text-xs flex gap-3 items-center backdrop-blur-sm">
                        <RefreshCw className="w-4 h-4 text-[#C9A227] animate-spin shrink-0" />
                        <p className="font-semibold animate-pulse">Running batch processing. Please keep this page open...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {scanError && (
              <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-300 text-xs flex gap-3 items-start backdrop-blur-sm">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <p className="leading-relaxed">{scanError}</p>
              </div>
            )}
          </div>

          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6 bg-[#131C14]/60 backdrop-blur-sm border border-[#4A7C59]/15 rounded-3xl p-6 shadow-md shadow-black/10">
            <h3 className="font-bold text-lg text-[#E8E4D9]">Acquisition Protocols</h3>
            <p className="text-sm text-[#B9C4B5] leading-relaxed">
              To maintain robust classification accuracy under environmental variance:
            </p>
            <div className="space-y-4 pt-2">
              {[
                { title: 'Centering', desc: 'Keep the leaf centered. Frame single leaves clearly to let background segmentation isolate target zones.' },
                { title: 'Avoid Severe Blur', desc: 'Verify image preview sharpness. Low focus makes micro-lesion edge detection complex.' },
                { title: 'Uniform Light', desc: 'Even under harsh shadows or weak light, CLAHE enhancement will run, but uniform illumination is best.' },
              ].map((proto, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4A7C59]/25 to-[#4A7C59]/10 text-[#8FCF9D] flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#E8E4D9]">{proto.title}</p>
                    <p className="text-[11px] text-[#8CA292] leading-relaxed mt-0.5">{proto.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-[#4A7C59]/15">
              <p className="text-[10px] text-[#6B8072] font-semibold uppercase tracking-wider">PROJECT GOALS</p>
              <p className="text-[11px] text-[#8CA292] mt-1 leading-relaxed">
                Ensuring high classification thresholds even when pictures originate from standard mobile cameras in real-world agricultural farms.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // RESULTS VIEW – we'll implement it inline (it's large)
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Left column: pipeline images */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#131C14]/90 backdrop-blur-sm border border-[#4A7C59]/20 rounded-3xl p-5 shadow-lg shadow-black/20 space-y-4">
              <div className="flex items-center justify-between border-b border-[#4A7C59]/15 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#6B8072] tracking-wider">PIPELINE ANALYSIS</span>
                  <span className="text-xs bg-[#1B2B1E] text-[#B9C4B5] px-2 py-0.5 rounded font-semibold font-mono">
                    {predictionData.preprocessing.dimensions.original} → {predictionData.preprocessing.dimensions.processed}
                  </span>
                </div>
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${compareMode
                    ? 'bg-gradient-to-r from-[#4A7C59] to-[#3C6549] text-white shadow-sm'
                    : 'bg-[#1B2B1E] text-[#B9C4B5] hover:bg-[#233024]'
                    }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{compareMode ? 'Single Stage View' : 'Before/After Split'}</span>
                </button>
              </div>

              {compareMode ? (
                <div className="aspect-square bg-black rounded-2xl overflow-hidden border border-[#4A7C59]/20 relative flex items-center justify-center select-none">
                  <img
                    src={predictionData.preprocessing.images.original}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    alt="Raw Upload"
                  />
                  <div
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - compareSliderPos}% 0 0)` }}
                  >
                    <img
                      src={predictionData.preprocessing.images[selectedPreprocessStep]}
                      className="absolute inset-0 w-full h-full object-contain"
                      alt="Preprocessed Preview"
                    />
                  </div>
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-10"
                    style={{ left: `${compareSliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#E8E4D9] text-[#0B120C] flex items-center justify-center border border-[#4A7C59]/30 shadow-xl text-xs font-bold pointer-events-auto">
                      ↔
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={compareSliderPos}
                    onChange={(e) => setCompareSliderPos(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                  />
                  <div className="absolute top-3 left-3 bg-[#0B120C]/90 text-[#E8E4D9] px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider backdrop-blur border border-[#4A7C59]/20 z-10 flex gap-1.5 items-center">
                    <span>Original</span>
                    <span className="text-[#6B8072]">vs</span>
                    <span className="text-[#C9A227]">{selectedPreprocessStep.replace(/([A-Z])/g, ' $1')}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-[#0B120C]/90 text-[#E8E4D9] px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider backdrop-blur border border-[#4A7C59]/20 z-10">
                    Drag Slider to Compare
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-[#0B120C] rounded-2xl overflow-hidden border border-[#4A7C59]/20 relative flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedPreprocessStep}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      src={predictionData.preprocessing.images[selectedPreprocessStep]}
                      className="w-full h-full object-contain absolute inset-0"
                      alt="Preprocessing stage preview"
                    />
                  </AnimatePresence>
                  <div className="absolute top-3 left-3 bg-[#0B120C]/90 text-[#E8E4D9] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur border border-[#4A7C59]/20 z-10">
                    {selectedPreprocessStep.replace(/([A-Z])/g, ' $1')}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Object.keys(predictionData.preprocessing.images).map((stepKey) => (
                  <button
                    key={stepKey}
                    onClick={() => setSelectedPreprocessStep(stepKey)}
                    className={`relative flex flex-col items-center gap-1 p-1 rounded-xl border text-[9px] font-bold uppercase transition-all ${selectedPreprocessStep === stepKey
                      ? 'border-[#C9A227] bg-[#C9A227]/10 text-[#C9A227]'
                      : 'border-[#4A7C59]/15 hover:border-[#4A7C59]/40 text-[#8CA292] bg-[#131C14]/60'
                      }`}
                  >
                    <div className="w-full aspect-square rounded-lg overflow-hidden border border-[#4A7C59]/15 relative">
                      <img src={predictionData.preprocessing.images[stepKey]} className="w-full h-full object-cover" />
                      {selectedPreprocessStep === stepKey && (
                        <motion.div
                          layoutId="activePreprocessBorder"
                          className="absolute inset-0 border-2 border-[#C9A227] rounded-lg pointer-events-none"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </div>
                    <span className="truncate w-full text-center z-10">{stepKey.substring(0, 10)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#131C14]/90 backdrop-blur-sm border border-[#4A7C59]/20 rounded-3xl p-5 shadow-lg shadow-black/20 space-y-4">
              <h3 className="font-bold text-sm text-[#E8E4D9] border-b border-[#4A7C59]/15 pb-2">Image Quality Diagnostics</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Overall Quality', val: `${predictionData.preprocessing.qualityMetrics.overallQualityScore}/100`, text: 'Signal-to-noise ratio rating' },
                  { label: 'Leaf Coverage', val: `${predictionData.preprocessing.leafCoveragePercentage}%`, text: 'Isolate percentage' },
                  { label: 'Sharpness / Blur', val: predictionData.preprocessing.qualityMetrics.blurScore, text: predictionData.preprocessing.qualityMetrics.isBlurry ? 'Blur Detected' : 'Sharp Focus' },
                  { label: 'Contrast Status', val: predictionData.preprocessing.qualityMetrics.contrastValue, text: predictionData.preprocessing.qualityMetrics.contrastStatus },
                ].map((met, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0F160F] border border-[#4A7C59]/15 space-y-1">
                    <p className="text-[10px] text-[#6B8072] font-bold uppercase tracking-wide">{met.label}</p>
                    <p className="text-base font-extrabold text-[#E8E4D9] leading-none font-mono">{met.val}</p>
                    <p className="text-[9px] text-[#8CA292] leading-none">{met.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: diagnosis report */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#131C14]/90 backdrop-blur-sm border border-[#4A7C59]/20 rounded-3xl p-6 shadow-lg shadow-black/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B8072] font-bold uppercase tracking-wide">Diagnosis Report</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${predictionData.prediction.severity === 'Critical' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' :
                  predictionData.prediction.severity === 'High' ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30' :
                    predictionData.prediction.severity === 'Moderate' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                      predictionData.prediction.severity === 'Low' ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30' :
                        'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}>
                  Severity: {predictionData.prediction.severity}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-[#E8E4D9]">{predictionData.prediction.plant} – {predictionData.prediction.disease}</h3>
                <p className="text-xs text-[#8FCF9D] font-medium italic">{predictionData.prediction.scientificName}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#4A7C59]/10 border border-[#4A7C59]/25 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#B9C4B5]">
                  <span>Classification Confidence</span>
                  <span className="text-[#8FCF9D] text-sm font-black font-mono">{predictionData.prediction.confidence}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#0F160F] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${predictionData.prediction.confidence}%` }} />
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div>
                  <span className="text-[10px] text-[#6B8072] font-bold uppercase">Description</span>
                  <p className="text-xs text-[#B9C4B5] leading-relaxed mt-0.5">{predictionData.prediction.description}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B8072] font-bold uppercase">Clinical Symptoms</span>
                  <p className="text-xs text-[#B9C4B5] leading-relaxed mt-0.5">{predictionData.prediction.symptoms}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B8072] font-bold uppercase">Epidemiology & Causes</span>
                  <p className="text-xs text-[#B9C4B5] leading-relaxed mt-0.5">{predictionData.prediction.causes}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#131C14]/90 backdrop-blur-sm border border-[#4A7C59]/20 rounded-3xl p-6 shadow-lg shadow-black/20 space-y-4">
              <h4 className="font-extrabold text-sm text-[#E8E4D9] pb-2 border-b border-[#4A7C59]/15">Recommended Treatment Schedule</h4>
              <div className="flex border-b border-[#4A7C59]/15 gap-1 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'organic', label: 'Organic', icon: 'O', bg: 'bg-emerald-500/15 text-emerald-300' },
                  { id: 'chemical', label: 'Chemical', icon: 'C', bg: 'bg-indigo-500/15 text-indigo-300' },
                  { id: 'fertilizer', label: 'Fertilizer', icon: 'F', bg: 'bg-amber-500/15 text-amber-300' },
                  { id: 'water', label: 'Irrigation', icon: 'W', bg: 'bg-sky-500/15 text-sky-300' },
                  { id: 'prevention', label: 'Prevention', icon: 'P', bg: 'bg-rose-500/15 text-rose-300' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTreatmentTab(tab.id as any)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTreatmentTab === tab.id ? 'text-white' : 'text-[#8CA292] hover:bg-[#1B2B1E]'
                      }`}
                  >
                    {activeTreatmentTab === tab.id && (
                      <motion.div
                        layoutId="activeTreatmentTabBg"
                        className={`absolute inset-0 rounded-xl ${tab.id === 'organic' ? 'bg-emerald-600' :
                          tab.id === 'chemical' ? 'bg-indigo-600' :
                            tab.id === 'fertilizer' ? 'bg-amber-600' :
                              tab.id === 'water' ? 'bg-sky-600' : 'bg-rose-600'
                          }`}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${activeTreatmentTab === tab.id ? 'bg-white/20 text-white' : tab.bg
                      }`}>
                      {tab.icon}
                    </span>
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTreatmentTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="p-4 bg-[#0F160F] border border-[#4A7C59]/15 rounded-2xl min-h-[100px] flex flex-col justify-center"
                >
                  {activeTreatmentTab === 'organic' && (
                    <div>
                      <p className="text-xs font-bold text-[#E8E4D9] mb-1">Organic Intervention</p>
                      <p className="text-[11px] text-[#B9C4B5] leading-relaxed">{predictionData.prediction.treatment.organic || 'No specific organic treatment recommended.'}</p>
                    </div>
                  )}
                  {activeTreatmentTab === 'chemical' && (
                    <div>
                      <p className="text-xs font-bold text-[#E8E4D9] mb-1">Chemical Intervention</p>
                      <p className="text-[11px] text-[#B9C4B5] leading-relaxed">{predictionData.prediction.treatment.chemical || 'No specific chemical treatment recommended.'}</p>
                    </div>
                  )}
                  {activeTreatmentTab === 'fertilizer' && (
                    <div>
                      <p className="text-xs font-bold text-[#E8E4D9] mb-1">Nutrient & Fertilizer Schedule</p>
                      <p className="text-[11px] text-[#B9C4B5] leading-relaxed">{predictionData.prediction.treatment.fertilizer || 'No specific fertilizer advice recommended.'}</p>
                    </div>
                  )}
                  {activeTreatmentTab === 'water' && (
                    <div>
                      <p className="text-xs font-bold text-[#E8E4D9] mb-1">Irrigation Advice</p>
                      <p className="text-[11px] text-[#B9C4B5] leading-relaxed">{predictionData.prediction.treatment.water || 'Standard watering patterns are sufficient.'}</p>
                    </div>
                  )}
                  {activeTreatmentTab === 'prevention' && (
                    <div>
                      <p className="text-xs font-bold text-[#E8E4D9] mb-1">Prevention Tactics</p>
                      <p className="text-[11px] text-[#B9C4B5] leading-relaxed">{predictionData.prediction.treatment.prevention || 'Maintain pristine hygiene in the field to prevent further onset.'}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="pt-4 border-t border-[#4A7C59]/15 flex items-center justify-between gap-4">
                <button
                  onClick={() => setActivePanel('report')}
                  className="flex-1 py-2.5 rounded-xl border border-[#4A7C59]/25 text-xs font-bold hover:bg-[#1B2B1E] transition-all text-[#E8E4D9] flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Report</span>
                </button>
                <button
                  onClick={clearSelection}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4A7C59] to-[#3C6549] hover:from-[#588C67] hover:to-[#4A7C59] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#4A7C59]/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Inference Next Leaf</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}