export default function Footer() {
  return (
    <footer className="relative bg-[#080D08] text-[#8CA292] py-12 sm:py-16 px-6 sm:px-8 lg:px-12 border-t border-[#4A7C59]/15 print:hidden mt-16">
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#4A7C59]/40 to-transparent" />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 md:divide-x md:divide-[#4A7C59]/10">
        <div className="space-y-4 md:pr-10">
          <h4 className="font-bold text-[#E8E4D9] text-lg">Plant Disease Detection System</h4>
          <p className="text-sm leading-relaxed">
            An academic final year research project focusing on robust deep learning computer vision frameworks operating under environmental lighting and focus variations.
          </p>
          <p className="text-[10px] text-[#6B8072] font-mono">
            © {new Date().getFullYear()} Plant Disease Detection Center. All rights reserved.
          </p>
        </div>
        <div className="space-y-3 md:px-10">
          <h5 className="font-bold text-[#E8E4D9] text-sm">OpenCV Preprocessing Pipelines</h5>
          <ul className="text-xs space-y-2.5">
            {[
              'Contrast Limited Adaptive Hist. Equalization (CLAHE)',
              'Fast Non-Local Means Denoising & Filtering',
              'Morphological Otsu Foreground Segmentation',
              'Laplacian Sharpness Blur Telemetry',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C9A227] shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 md:pl-10">
          <h5 className="font-bold text-[#E8E4D9] text-sm">Academic Project Credits</h5>
          <p className="text-xs leading-relaxed text-[#B9C4B5]">
            <strong className="text-[#E8E4D9]">S. Glory</strong>{' '}
            <a href="mailto:oyetunjie5@gmail.com" className="text-[#8FCF9D] hover:text-[#C9A227] transition-colors">
              (sundayglory5@gmail.com)
            </a>
            <br />
            Final Year Project Submission
          </p>
          <div className="pt-2">
            <span className="text-[10px] bg-[#131C14] text-[#8FCF9D] border border-[#4A7C59]/20 px-2 py-1 rounded font-mono">
              Build Version: 1.0.0-Stable
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}