interface DatabasePanelProps {
  diseasesList: any[];
}

export default function DatabasePanel({ diseasesList }: DatabasePanelProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-[#4A7C59]/15 pb-4">
        <h2 className="text-3xl font-extrabold text-[#E8E4D9]">Academic Crop Pathology Database</h2>
        <p className="text-[#8CA292] text-sm">Public educational reference on plant pathogens, morphology, symptoms, and treatments</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {diseasesList.map((dis) => (
          <div key={dis.id} className="bg-[#131C14]/90 backdrop-blur-sm border border-[#4A7C59]/20 rounded-3xl p-6 shadow-md shadow-black/10 hover:shadow-lg hover:border-[#4A7C59]/40 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8FCF9D] font-bold bg-[#4A7C59]/15 px-2 py-0.5 rounded-full border border-[#4A7C59]/30">
                  {dis.plantType}
                </span>
                <h3 className="text-xl font-black text-[#E8E4D9] mt-1">{dis.name}</h3>
                <p className="text-xs text-[#8CA292] font-medium italic mt-0.5">{dis.scientificName}</p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${dis.severity === 'Critical'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : dis.severity === 'High'
                    ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                    : dis.severity === 'Moderate'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}
              >
                {dis.severity} Severity
              </span>
            </div>
            <p className="text-sm text-[#B9C4B5] leading-relaxed">{dis.description}</p>
            <div className="space-y-2 pt-2 border-t border-[#4A7C59]/15 text-xs">
              <p className="font-bold text-[#E8E4D9]">Key Symptoms:</p>
              <p className="text-[#B9C4B5] text-[11px] leading-relaxed">{dis.symptoms}</p>
              <div className="pt-2">
                <p className="font-bold text-[11px] uppercase tracking-wider text-[#6B8072]">ORGANIC TREATMENT</p>
                <p className="text-[#B9C4B5] text-[11px] mt-0.5">{dis.treatment?.organic}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}