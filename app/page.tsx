/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { auth, googleProvider } from '@/lib/firebaseClient';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import Header from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import AuthModal from '@/components/AuthModal';
import DiseaseModal from '@/components/DiseaseModal';
import HomePanel from '@/components/panels/HomePanel';
import ScanPanel from '@/components/panels/ScanPanel';
import DashboardPanel from '@/components/panels/DashboardPanel';
import DatabasePanel from '@/components/panels/DatabasePanel';
import AdminPanel from '@/components/panels/AdminPanel';
import ReportPanel from '@/components/panels/ReportPanel';

type PanelType = 'home' | 'scan' | 'dashboard' | 'database' | 'admin' | 'report';

export default function PlantDiseaseApp() {
  // ---------- AUTH ----------
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [activePanel, setActivePanel] = useState<PanelType>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // ---------- SCAN ----------
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState<any[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  const [useCamera, setUseCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [exposureValue, setExposureValue] = useState(120);
  const [exposureStatus, setExposureStatus] = useState('Excellent');
  const [exposureColor, setExposureColor] = useState('text-emerald-500');
  const exposureTimerRef = useRef<any>(null);

  // ---------- PREDICTION / RESULTS ----------
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [predictionData, setPredictionData] = useState<any>(null);
  const [selectedPreprocessStep, setSelectedPreprocessStep] = useState<string>('original');
  const [activeTreatmentTab, setActiveTreatmentTab] = useState<'organic' | 'chemical' | 'fertilizer' | 'water' | 'prevention'>('organic');
  const [scanError, setScanError] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSliderPos, setCompareSliderPos] = useState(50);

  // ---------- DASHBOARD ----------
  const [dashboardStats, setDashboardStats] = useState<any>({
    totalScans: 0,
    healthyCount: 0,
    diseasedCount: 0,
    diseaseFreq: {},
    cropFreq: {},
    recentPredictions: [],
    monthlyTrend: [],
  });
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // ---------- DATABASE / ADMIN ----------
  const [diseasesList, setDiseasesList] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);
  const [diseaseForm, setDiseaseForm] = useState({
    id: '',
    name: '',
    scientificName: '',
    plantType: '',
    severity: 'Low',
    description: '',
    symptoms: '',
    causes: '',
    chemical: '',
    organic: '',
    fertilizer: '',
    water: '',
    prevention: '',
  });

  // ---------- TOAST ----------
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const triggerToast = (message: string, type: 'success' | 'error' | 'info') => setToast({ message, type });

  // ---------- EFFECTS ----------
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) triggerToast(`Welcome, ${user.displayName}!`, 'success');
    });
    return () => unsubscribe();
  }, []);


  // ---------- DATA FETCHING ----------
  const fetchDashboardStats = async () => {
    if (!firebaseUser) return;
    setDashboardLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setDashboardStats(data.stats);
    } catch (e) {
      triggerToast('Could not load dashboard data.', 'error');
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchDiseases = async () => {
    try {
      const res = await fetch('/api/admin/diseases');
      const data = await res.json();
      if (data.success) setDiseasesList(data.diseases);
    } catch (e) {
      console.error('Failed to fetch diseases:', e);
    }
  };

  const fetchAdminData = async () => {
    if (!firebaseUser) return;
    setAdminLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const [statsRes, diseasesRes] = await Promise.all([
        fetch('/api/admin/statistics', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/diseases', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const statsData = await statsRes.json();
      const diseasesData = await diseasesRes.json();
      if (statsData.success) setAdminStats(statsData.stats);
      if (diseasesData.success) setDiseasesList(diseasesData.diseases);
    } catch (e) {
      triggerToast('Failed to load admin analytics', 'error');
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (activePanel === 'dashboard' && firebaseUser) fetchDashboardStats();
    else if (activePanel === 'admin' && firebaseUser) fetchAdminData();
    else if (activePanel === 'database') fetchDiseases();
  }, [activePanel, firebaseUser]);

  // ---------- AUTH FUNCTIONS ----------
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
      triggerToast('Signed in with Google successfully!', 'success');
    } catch (error: any) {
      setAuthError(error.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    triggerToast('Logged out', 'info');
    setActivePanel('home');
  };



  // ---------- CAMERA ----------
  const startCamera = async () => {
    setUseCamera(true);
    setScanError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      // Exposure logic (same as original)
      if (exposureTimerRef.current) clearInterval(exposureTimerRef.current);
      exposureTimerRef.current = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = 40;
            canvas.height = 40;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, 40, 40);
              const imgData = ctx.getImageData(0, 0, 40, 40);
              let total = 0;
              for (let i = 0; i < imgData.data.length; i += 4) {
                total += 0.299 * imgData.data[i] + 0.587 * imgData.data[i + 1] + 0.114 * imgData.data[i + 2];
              }
              const avg = Math.round(total / (imgData.data.length / 4));
              const expPct = Math.round((avg / 255) * 100);
              setExposureValue(expPct);
              if (expPct < 25) { setExposureStatus('Too Dark (Underexposed)'); setExposureColor('text-rose-500'); }
              else if (expPct > 80) { setExposureStatus('Too Bright (Overexposed)'); setExposureColor('text-rose-500'); }
              else if (expPct >= 25 && expPct < 38) { setExposureStatus('Low Light (Acceptable)'); setExposureColor('text-amber-500'); }
              else if (expPct > 68 && expPct <= 80) { setExposureStatus('Bright Light (Acceptable)'); setExposureColor('text-amber-500'); }
              else { setExposureStatus('Optimal Exposure'); setExposureColor('text-emerald-500'); }
            }
          } catch (err) { }
        }
      }, 350);
    } catch (err) {
      setUseCamera(false);
      triggerToast('Could not access camera. Please allow permissions.', 'error');
    }
  };

  const stopCamera = () => {
    if (cameraStream) { cameraStream.getTracks().forEach(track => track.stop()); setCameraStream(null); }
    if (exposureTimerRef.current) clearInterval(exposureTimerRef.current);
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera_${Date.now()}.png`, { type: 'image/png' });
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            stopCamera();
            triggerToast('Photo captured successfully!', 'success');
          }
        }, 'image/png');
      }
    }
  };

  // ---------- FILE HANDLING ----------
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFileSelection(e.target.files[0]);
  };

  const handleFileSelection = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) { triggerToast('Unsupported format. Use JPEG, JPG, or PNG.', 'error'); return; }
    if (file.size > 8 * 1024 * 1024) { triggerToast('File size too large. Max 8MB.', 'error'); return; }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanError(null);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPredictionData(null);
    setPredictionId(null);
    setScanError(null);
  };

  // ---------- PREDICTION ----------
  const handleUploadAndAnalyze = async () => {
    if (!selectedFile || !firebaseUser) { triggerToast('Please sign in and select a file.', 'error'); return; }
    setIsUploading(true);
    setUploadProgress(10);
    setScanError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const progressInterval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) { clearInterval(progressInterval); return 90; }
        return p + 15;
      });
    }, 150);

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await res.json();
      setUploadProgress(100);
      clearInterval(progressInterval);

      if (result.success) {
        setPredictionData(result.data);
        setPredictionId(result.predictionId);
        setSelectedPreprocessStep('original');
        triggerToast('Inference completed successfully!', 'success');
      } else {
        setScanError(result.error || 'Diagnosis failed.');
        triggerToast(result.error || 'Diagnosis failed', 'error');
      }
    } catch (e) {
      setScanError('Failed to communicate with Deep Learning Server.');
      triggerToast('Connection failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // ---------- BATCH ----------
  const addBatchFiles = (files: File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const newBatch: any[] = [];
    files.forEach((file) => {
      if (!validTypes.includes(file.type) || file.size > 8 * 1024 * 1024) return;
      newBatch.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
        progress: 0,
      });
    });
    if (newBatch.length) {
      setBatchFiles((prev) => [...prev, ...newBatch]);
      triggerToast(`Added ${newBatch.length} images to batch list.`, 'success');
    }
  };

  const removeBatchFile = (id: string) => {
    setBatchFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearBatch = () => {
    setBatchFiles([]);
    setIsProcessingBatch(false);
    triggerToast('Cleared batch list', 'info');
  };

  const handleAnalyzeBatch = async () => {
    if (batchFiles.length === 0 || isProcessingBatch || !firebaseUser) return;
    setIsProcessingBatch(true);
    const token = await firebaseUser.getIdToken();
    const filesToProcess = [...batchFiles];

    for (let i = 0; i < filesToProcess.length; i++) {
      const current = filesToProcess[i];
      if (current.status === 'completed') continue;
      setBatchFiles((prev) => prev.map((f) => (f.id === current.id ? { ...f, status: 'processing', progress: 10 } : f)));

      const formData = new FormData();
      formData.append('file', current.file);

      let pVal = 10;
      const progressInterval = setInterval(() => {
        pVal = Math.min(pVal + 15, 90);
        setBatchFiles((prev) => prev.map((f) => (f.id === current.id ? { ...f, progress: pVal } : f)));
      }, 150);

      try {
        const res = await fetch('/api/predict', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        clearInterval(progressInterval);
        const result = await res.json();
        if (result.success) {
          setBatchFiles((prev) =>
            prev.map((f) =>
              f.id === current.id
                ? { ...f, status: 'completed', progress: 100, predictionData: result.data, predictionId: result.predictionId }
                : f
            )
          );
        } else {
          setBatchFiles((prev) =>
            prev.map((f) => (f.id === current.id ? { ...f, status: 'failed', progress: 100, error: result.error || 'Diagnosis failed' } : f))
          );
        }
      } catch (e) {
        clearInterval(progressInterval);
        setBatchFiles((prev) =>
          prev.map((f) => (f.id === current.id ? { ...f, status: 'failed', progress: 100, error: 'Connection failed' } : f))
        );
      }
    }
    setIsProcessingBatch(false);
    triggerToast('Batch analysis complete!', 'success');
  };

  // ---------- ADMIN ----------
  const handleDiseaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) { triggerToast('Please sign in as admin.', 'error'); return; }
    try {
      const token = await firebaseUser.getIdToken();
      const method = diseaseForm.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/diseases', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(diseaseForm),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Disease ${diseaseForm.id ? 'updated' : 'added'} successfully`, 'success');
        setShowDiseaseModal(false);
        fetchAdminData();
        setDiseaseForm({
          id: '',
          name: '',
          scientificName: '',
          plantType: '',
          severity: 'Low',
          description: '',
          symptoms: '',
          causes: '',
          chemical: '',
          organic: '',
          fertilizer: '',
          water: '',
          prevention: '',
        });
      } else {
        triggerToast(data.error || 'Failed to save disease', 'error');
      }
    } catch (e) {
      triggerToast('Save operation failed', 'error');
    }
  };

  const handleEditDiseaseClick = (dis: any) => {
    setDiseaseForm({
      id: dis.id,
      name: dis.name,
      scientificName: dis.scientificName,
      plantType: dis.plantType,
      severity: dis.severity,
      description: dis.description,
      symptoms: dis.symptoms,
      causes: dis.causes,
      chemical: dis.treatment?.chemical || '',
      organic: dis.treatment?.organic || '',
      fertilizer: dis.treatment?.fertilizer || '',
      water: dis.treatment?.water || '',
      prevention: dis.treatment?.prevention || '',
    });
    setShowDiseaseModal(true);
  };

  const handleDeleteDisease = async (id: string) => {
    if (!confirm('Are you sure you want to delete this disease?')) return;
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`/api/admin/diseases?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        triggerToast('Disease config deleted', 'success');
        fetchAdminData();
      }
    } catch (e) {
      triggerToast('Delete failed', 'error');
    }
  };

  const triggerReportPrint = () => window.print();

  // ---------- RENDER ----------
  return (
    <div className="relative min-h-screen flex flex-col bg-[#0B120C] font-sans antialiased overflow-x-hidden">
      {/* Ambient botanical glow + fine scan grid — decorative only */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 60% at 15% -10%, rgba(74,124,89,0.16), transparent 60%),
            radial-gradient(ellipse 70% 50% at 100% 10%, rgba(201,162,39,0.08), transparent 55%),
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 42px 42px, 42px 42px',
        }}
      />
      {/* Slow vertical scan sweep — reduced-motion safe */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-40 opacity-[0.06] motion-reduce:hidden"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(74,124,89,0.9), transparent)',
          animation: 'scan-sweep 9s linear infinite',
        }}
      />
      <style>{`
        @keyframes scan-sweep {
          0% { transform: translateY(-10vh); }
          100% { transform: translateY(110vh); }
        }
      `}</style>

      <div className="sr-only" aria-live="assertive" role="status" />
      <Toast toast={toast} />

      <Header
        firebaseUser={firebaseUser}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        setShowAuthModal={setShowAuthModal}
        handleLogout={handleLogout}
      />

      <div className="relative z-10 flex flex-col min-h-screen pt-20 md:pt-40">


        <main className="relative flex-1 w-full max-w-7xl mx-auto px-4 py-10 md:px-8 md:py-1 ">
          {/* Corner scan-frame brackets, echoing the diagnostic/scan identity of the app */}
          <span aria-hidden="true" className="hidden md:block absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#4A7C59]/30 rounded-tl-sm" />
          <span aria-hidden="true" className="hidden md:block absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#4A7C59]/30 rounded-tr-sm" />
          <span aria-hidden="true" className="hidden md:block absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#4A7C59]/30 rounded-bl-sm" />
          <span aria-hidden="true" className="hidden md:block absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#4A7C59]/30 rounded-br-sm" />

          {activePanel === 'home' && <HomePanel setActivePanel={setActivePanel} />}
          {activePanel === 'scan' && (
            <ScanPanel
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              handleFileChange={handleFileChange}
              useCamera={useCamera}
              startCamera={startCamera}
              stopCamera={stopCamera}
              videoRef={videoRef}
              showGrid={showGrid}
              setShowGrid={setShowGrid}
              exposureValue={exposureValue}
              exposureStatus={exposureStatus}
              exposureColor={exposureColor}
              capturePhoto={capturePhoto}
              previewUrl={previewUrl}
              selectedFile={selectedFile}
              clearSelection={clearSelection}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              handleUploadAndAnalyze={handleUploadAndAnalyze}
              scanError={scanError}
              isBatchMode={isBatchMode}
              setIsBatchMode={setIsBatchMode}
              batchFiles={batchFiles}
              addBatchFiles={addBatchFiles}
              removeBatchFile={removeBatchFile}
              clearBatch={clearBatch}
              isProcessingBatch={isProcessingBatch}
              handleAnalyzeBatch={handleAnalyzeBatch}
              predictionData={predictionData}
              predictionId={predictionId}
              setPredictionData={setPredictionData}
              setPredictionId={setPredictionId}
              setSelectedPreprocessStep={setSelectedPreprocessStep}
              selectedPreprocessStep={selectedPreprocessStep}
              compareMode={compareMode}
              setCompareMode={setCompareMode}
              compareSliderPos={compareSliderPos}
              setCompareSliderPos={setCompareSliderPos}
              activeTreatmentTab={activeTreatmentTab}
              setActiveTreatmentTab={setActiveTreatmentTab}
              setActivePanel={setActivePanel}
              triggerToast={triggerToast}
              setSelectedFile={setSelectedFile}
              setPreviewUrl={setPreviewUrl}
            />
          )}
          {activePanel === 'dashboard' && (
            <DashboardPanel
              dashboardStats={dashboardStats}
              dashboardLoading={dashboardLoading}
              fetchDashboardStats={fetchDashboardStats}
              setActivePanel={setActivePanel}
              setPredictionData={setPredictionData}
              setPredictionId={setPredictionId}
            />
          )}
          {activePanel === 'database' && <DatabasePanel diseasesList={diseasesList} />}
          {activePanel === 'admin' && firebaseUser?.email === 'admin@system.com' && (
            <AdminPanel
              adminStats={adminStats}
              adminLoading={adminLoading}
              diseasesList={diseasesList}
              setShowDiseaseModal={setShowDiseaseModal}
              setDiseaseForm={setDiseaseForm}
              handleEditDiseaseClick={handleEditDiseaseClick}
              handleDeleteDisease={handleDeleteDisease}
            />
          )}
          {activePanel === 'report' && predictionData && (
            <ReportPanel
              predictionData={predictionData}
              predictionId={predictionId}
              setActivePanel={setActivePanel}
              triggerReportPrint={triggerReportPrint}
            />
          )}
        </main>

        <Footer />
      </div>

      <AuthModal
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        authError={authError}
        googleLoading={googleLoading}
        handleGoogleLogin={handleGoogleLogin}
      />
      <DiseaseModal
        showDiseaseModal={showDiseaseModal}
        setShowDiseaseModal={setShowDiseaseModal}
        diseaseForm={diseaseForm}
        setDiseaseForm={setDiseaseForm}
        handleDiseaseSubmit={handleDiseaseSubmit}
      />
    </div>
  );
}