export default function Footer() {
  return (
    <footer className="border-t-2 border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 py-8 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <img 
            src="/assets/BRAINOPHARM  Pharmacovigilance System.png" 
            alt="BRAINOPHARM Logo" 
            className="h-16 w-auto object-contain opacity-90"
            style={{ maxWidth: '300px' }}
            loading="lazy"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <p className="font-semibold">© 2025 BRAINOPHARM</p>
              <p className="text-xs max-w-2xl text-blue-600 dark:text-blue-400">
                For educational and academic research purposes only. Not intended for diagnostic or treatment use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
