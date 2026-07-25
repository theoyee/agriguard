import { motion } from 'motion/react';

interface DiseaseModalProps {
  showDiseaseModal: boolean;
  setShowDiseaseModal: (show: boolean) => void;
  diseaseForm: any;
  setDiseaseForm: (form: any) => void;
  handleDiseaseSubmit: (e: React.FormEvent) => void;
}

export default function DiseaseModal({
  showDiseaseModal,
  setShowDiseaseModal,
  diseaseForm,
  setDiseaseForm,
  handleDiseaseSubmit,
}: DiseaseModalProps) {
  if (!showDiseaseModal) return null;

  const inputClass =
    'w-full p-2 border border-[#4A7C59]/20 rounded-xl bg-[#0F160F] text-[#E8E4D9] placeholder:text-[#5A6B5D] focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#131C14]/95 backdrop-blur-md border border-[#4A7C59]/20 rounded-3xl p-6 w-full max-w-xl space-y-6 shadow-2xl shadow-black/50 relative max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-[#4A7C59]/15 pb-3">
          <h3 className="font-extrabold text-base text-[#E8E4D9]">
            {diseaseForm.id ? 'Edit Disease & Treatment' : 'Add Disease Pathology'}
          </h3>
          <button onClick={() => setShowDiseaseModal(false)} className="text-[#8CA292] hover:text-[#E8E4D9] font-bold text-xs">
            Close
          </button>
        </div>
        <form onSubmit={handleDiseaseSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#B9C4B5]">Disease Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Early Blight"
                value={diseaseForm.name}
                onChange={(e) => setDiseaseForm({ ...diseaseForm, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[#B9C4B5]">Scientific Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alternaria solani"
                value={diseaseForm.scientificName}
                onChange={(e) => setDiseaseForm({ ...diseaseForm, scientificName: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#B9C4B5]">Plant / Crop Type</label>
              <input
                type="text"
                required
                placeholder="e.g. Tomato"
                value={diseaseForm.plantType}
                onChange={(e) => setDiseaseForm({ ...diseaseForm, plantType: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[#B9C4B5]">Severity Level</label>
              <select
                value={diseaseForm.severity}
                onChange={(e) => setDiseaseForm({ ...diseaseForm, severity: e.target.value })}
                className={inputClass}
              >
                <option value="None">None (Healthy)</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-[#B9C4B5]">Pathology Description</label>
            <textarea
              rows={2}
              placeholder="Explain the pathology..."
              value={diseaseForm.description}
              onChange={(e) => setDiseaseForm({ ...diseaseForm, description: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-[#B9C4B5]">Clinical Symptoms</label>
            <textarea
              rows={2}
              placeholder="List main visual symptoms..."
              value={diseaseForm.symptoms}
              onChange={(e) => setDiseaseForm({ ...diseaseForm, symptoms: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-[#B9C4B5]">Epidemiology & Causes</label>
            <textarea
              rows={2}
              placeholder="Explain environmental causes..."
              value={diseaseForm.causes}
              onChange={(e) => setDiseaseForm({ ...diseaseForm, causes: e.target.value })}
              className={inputClass}
            />
          </div>
          <h4 className="font-bold text-[#6B8072] border-b border-[#4A7C59]/15 pb-1 pt-2 uppercase text-[10px] tracking-wider">
            Intervention Parameters
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#B9C4B5]">Organic Treatment</label>
              <input
                type="text"
                placeholder="e.g. Neem oil spray"
                value={diseaseForm.organic}
                onChange={(e) => setDiseaseForm({ ...diseaseForm, organic: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[#B9C4B5]">Chemical Treatment</label>
              <input
                type="text"
                placeholder="e.g. Copper oxychloride"
                value={diseaseForm.chemical}
                onChange={(e) => setDiseaseForm({ ...diseaseForm, chemical: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#B9C4B5]">Nutrients/Fertilizers</label>
              <input
                type="text"
                placeholder="e.g. High potassium"
                value={diseaseForm.fertilizer}
                onChange={(e) => setDiseaseForm({ ...diseaseForm, fertilizer: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[#B9C4B5]">Irrigation Plan</label>
              <input
                type="text"
                placeholder="e.g. Drip irrigation"
                value={diseaseForm.water}
                onChange={(e) => setDiseaseForm({ ...diseaseForm, water: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-[#B9C4B5]">General Prevention Tips</label>
            <input
              type="text"
              placeholder="e.g. Prune lower leaf levels"
              value={diseaseForm.prevention}
              onChange={(e) => setDiseaseForm({ ...diseaseForm, prevention: e.target.value })}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-[#4A7C59] to-[#3C6549] hover:from-[#588C67] hover:to-[#4A7C59] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#4A7C59]/20"
          >
            Save Pathology Configuration
          </button>
        </form>
      </motion.div>
    </div>
  );
}