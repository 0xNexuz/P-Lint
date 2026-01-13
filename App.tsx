
import React, { useState, useRef, useEffect } from 'react';
import { ScanResult } from './types';
import { PrivacyEngine, AuditLog } from './services/privacyEngine';
import ScoreCard from './components/ScoreCard';
import AnalysisResults from './components/AnalysisResults';
import { MOCK_DAPP_ADDRESS } from './constants';

const App: React.FC = () => {
  const [address, setAddress] = useState(MOCK_DAPP_ADDRESS);
  const [customData, setCustomData] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [useShield, setUseShield] = useState(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'docs'>('scan');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const handleScan = async () => {
    if (!address) return;
    setIsScanning(true);
    setScanResult(null);
    setLogs([]);
    
    try {
      const result = await PrivacyEngine.scanWithProgress(
        address, 
        customData, 
        useShield, 
        (newLog) => setLogs(prev => [...prev, newLog])
      );
      setScanResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex flex-col">
      <nav className="border-b border-gray-800 bg-[#030712]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">PrivacyLint</h1>
              <p className="text-[9px] sm:text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Solana Guard</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setActiveTab('scan')} className={`text-sm font-medium transition-colors ${activeTab === 'scan' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}>Linter</button>
            <button onClick={() => setActiveTab('docs')} className={`text-sm font-medium transition-colors ${activeTab === 'docs' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}>Rules</button>
            <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm font-medium flex items-center gap-2 border border-gray-700">v2.4.5</div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-[#030712] p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <button 
              onClick={() => { setActiveTab('scan'); setIsMobileMenuOpen(false); }} 
              className={`text-left px-4 py-2 rounded-lg ${activeTab === 'scan' ? 'bg-indigo-600/10 text-indigo-400' : 'text-gray-400'}`}
            >
              Linter Pipeline
            </button>
            <button 
              onClick={() => { setActiveTab('docs'); setIsMobileMenuOpen(false); }} 
              className={`text-left px-4 py-2 rounded-lg ${activeTab === 'docs' ? 'bg-indigo-600/10 text-indigo-400' : 'text-gray-400'}`}
            >
              Security Rules
            </button>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {activeTab === 'scan' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Audit Pipeline <br/>
                  <span className="text-indigo-500 text-xl sm:text-2xl">High Precision Analysis</span>
                </h2>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Target Address</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm mono focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex justify-between">
                    <span>Transaction Payload</span>
                    <span className="text-indigo-400 lowercase font-medium">Optional</span>
                  </label>
                  <textarea 
                    value={customData}
                    onChange={(e) => setCustomData(e.target.value)}
                    placeholder="Paste Instruction JSON or trace logs..."
                    className="w-full h-32 sm:h-40 bg-black border border-gray-700 rounded-xl px-4 py-3 text-[11px] sm:text-xs mono focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${useShield ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Shield SDK</h4>
                      <p className="text-[10px] text-gray-500">Simulated encryption</p>
                    </div>
                  </div>
                  <button onClick={() => setUseShield(!useShield)} className={`relative w-12 h-6 rounded-full transition-colors ${useShield ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${useShield ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <button 
                  onClick={handleScan} 
                  disabled={isScanning} 
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                >
                  {isScanning ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scanning...
                    </>
                  ) : 'Start Deep Audit'}
                </button>
              </div>

              {/* Terminal Console */}
              <div className="bg-[#050505] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-gray-900 px-4 py-3 flex items-center gap-2 border-b border-gray-800">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 ml-2 mono uppercase tracking-wider">Audit Console v2.4.5</span>
                </div>
                <div 
                  ref={consoleRef}
                  className="p-4 h-48 sm:h-56 overflow-y-auto font-mono text-[10px] sm:text-[11px] leading-relaxed scroll-smooth bg-black/40"
                >
                  {logs.length === 0 ? (
                    <span className="text-gray-700 italic">Waiting for analysis sequence initiation...</span>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="mb-1.5 border-l-2 border-transparent hover:border-indigo-500/30 pl-2 transition-colors">
                        <span className="text-gray-600 mr-2">[{log.timestamp}]</span>
                        <span className={
                          log.level === 'error' ? 'text-red-400' : 
                          log.level === 'warn' ? 'text-yellow-400' : 
                          log.level === 'success' ? 'text-green-400' : 'text-indigo-300'
                        }>
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                  {isScanning && <div className="animate-pulse inline-block w-2 h-4 bg-indigo-500 ml-1 mt-1"></div>}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              {scanResult ? (
                <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <ScoreCard score={scanResult.score} />
                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Audit Consensus</h4>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${scanResult.score > 80 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                          <span className="font-bold text-xl">{scanResult.score > 80 ? 'PROTECTED' : 'VULNERABLE'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mt-4">
                        Analysis detected {scanResult.findings.filter(f => f.detected).length} privacy vectors requiring attention. Review the detailed findings below for mitigation steps.
                      </p>
                    </div>
                  </div>
                  <AnalysisResults result={scanResult} />
                </div>
              ) : (
                <div className="h-full border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center p-8 sm:p-12 text-center min-h-[400px] lg:min-h-[600px] bg-indigo-500/[0.02] transition-colors hover:bg-indigo-500/[0.04]">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-900/50 rounded-2xl flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Initialize Deep Scan</h3>
                  <p className="text-gray-500 max-w-sm mx-auto text-sm">
                    Enter a Solana wallet or dApp address to begin. Providing instruction payloads will trigger advanced heuristic analysis.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-12 sm:p-20 border border-gray-800 rounded-3xl bg-gray-900/20">
            <h2 className="text-2xl font-bold">Privacy Rulebook</h2>
            <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">
              PrivacyLint utilizes a combination of Shannon Entropy analysis, address clustering heuristics, and pattern matching to detect data exfiltration.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
                <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                    <h4 className="font-bold text-indigo-400 mb-2">Entropy Scanner</h4>
                    <p className="text-xs text-gray-400">Detects if data payloads are likely plaintext (low entropy) or properly encrypted (high entropy).</p>
                </div>
                <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                    <h4 className="font-bold text-indigo-400 mb-2">Cluster Heuristics</h4>
                    <p className="text-xs text-gray-400">Identifies account linkage between disparate transactions using behavioral pattern recognition.</p>
                </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 py-10 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-gray-500 text-center md:text-left">
          <div>
            <p className="font-semibold text-gray-300 mb-1">PrivacyLint Engine v2.4.5</p>
            <p>© 2024. Open Source Solana Privacy Guard.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy SDK</a>
            <a href="#" className="hover:text-white transition-colors">Solana Docs</a>
            <a href="#" className="hover:text-white transition-colors">Vulnerability Registry</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
