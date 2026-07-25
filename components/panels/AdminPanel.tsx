import { Edit, Plus, Trash2, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  adminStats: any;
  adminLoading: boolean;
  diseasesList: any[];
  setShowDiseaseModal: (show: boolean) => void;
  setDiseaseForm: (form: any) => void;
  handleEditDiseaseClick: (dis: any) => void;
  handleDeleteDisease: (id: string) => void;
}

export default function AdminPanel({
  adminStats,
  adminLoading,
  diseasesList,
  setShowDiseaseModal,
  setDiseaseForm,
  handleEditDiseaseClick,
  handleDeleteDisease,
}: AdminPanelProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200/70 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">System Administrator Console</h2>
          <p className="text-slate-500 text-sm">Manage disease pathology database, view system logs, and inspect server analytics</p>
        </div>
        <button
          onClick={() => {
            setDiseaseForm({
              id: '',
              name: '',
              scientificName: '',
              plantType: 'Tomato',
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
            setShowDiseaseModal(true);
          }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Crop Disease</span>
        </button>
      </div>

      {adminLoading || !adminStats ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
          <span>Synchronizing administrative logs...</span>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Registered Users', value: adminStats.totalUsers },
              { label: 'Diagnosed Pathologies', value: adminStats.totalDiseases },
              { label: 'Total Scan Telemetry', value: adminStats.totalScans },
              {
                label: 'Healthy Foliage Ratio',
                value: adminStats.totalScans > 0 ? `${Math.round((adminStats.healthyCount / adminStats.totalScans) * 100)}%` : '0%',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-5 bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-3xl shadow-md space-y-1 hover:shadow-lg transition-all">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</p>
                <p className="text-3xl font-black text-slate-800 leading-none">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="font-extrabold text-base text-slate-800">Pathology Catalogue Editor</h3>
              <div className="divide-y divide-slate-200/50">
                {diseasesList.map((dis) => (
                  <div key={dis.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="truncate max-w-[400px]">
                      <p className="font-bold text-slate-800 text-sm">{dis.plantType} – {dis.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{dis.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditDiseaseClick(dis)}
                        className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100/50 text-slate-500 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDisease(dis.id)}
                        className="p-2 border border-slate-200 rounded-lg hover:bg-rose-50/50 text-rose-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="font-extrabold text-base text-slate-800">Diagnosis Heatmap</h3>
              <div className="space-y-4">
                {Object.entries(adminStats.diseaseFreq).map(([dis, count]: any) => (
                  <div key={dis} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>{dis}</span>
                      <span>{count} scans</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: `${(count / adminStats.totalScans) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}