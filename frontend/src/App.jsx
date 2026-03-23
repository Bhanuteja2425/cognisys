import { useState } from 'react'
import axios from 'axios'

function App() {
  const [file, setFile] = useState(null)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [status, setStatus] = useState("Ready")
  const [loading, setLoading] = useState(false)

  const API_BASE_URL = "http://localhost:8000"

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF first!")
    const formData = new FormData()
    formData.append("file", file)
    try {
      setStatus("Encoding...")
      setLoading(true)
      const res = await axios.post(`${API_BASE_URL}/upload`, formData)
      setStatus(`Source Locked: ${res.data.filename}`)
    } catch (err) {
      setStatus("System Error: Backend Offline")
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    if (!window.confirm("Wipe all synchronized memory?")) return;
    try {
      setStatus("Wiping...")
      setLoading(true)
      await axios.post(`${API_BASE_URL}/clear`)
      setStatus("Memory Cleared")
      setAnswer("") 
    } catch (err) {
      setStatus("Wipe Failed")
    } finally {
      setLoading(false)
    }
  }

  const handleAsk = async () => {
    if (!question.trim()) return
    try {
      setAnswer("Processing neural query...")
      setLoading(true)
      const res = await axios.post(`${API_BASE_URL}/chat`, { question })
      setAnswer(res.data.answer)
      setQuestion("") 
    } catch (err) {
      setAnswer("Communication link severed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen bg-[#0F172A] flex flex-col font-sans text-slate-200 selection:bg-indigo-500/30 overflow-hidden">
      
      {/* HEADER */}
      <header className="w-full bg-slate-900/50 backdrop-blur-md border-b border-slate-800 py-4 px-8 flex justify-between items-center shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">C</div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-white leading-none">COGNISYS</h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em] mt-1">Neural Repository</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status.includes('Locked') ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
              <span className="font-mono text-[11px] uppercase tracking-wider">{status}</span>
           </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Visual Flare Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none"></div>

        {/* SIDEBAR */}
        <aside className="w-80 bg-slate-900/80 border-r border-slate-800 p-6 flex flex-col z-10 shrink-0">
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Injest Intelligence</h2>
            <div className="space-y-4">
              <div className="relative group">
                <input type="file" accept=".pdf" id="file-upload" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer bg-slate-800/30 hover:bg-slate-800/60 hover:border-indigo-500 transition-all">
                  <p className="text-[11px] font-bold text-slate-500 text-center px-4 truncate w-full">
                    {file ? file.name : "Drop PDF Protocol"}
                  </p>
                </label>
              </div>
              <button onClick={handleUpload} disabled={loading || !file} className="w-full py-4 border border-slate-700 bg-slate-900 text-slate-200 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all">
                Sync with Cognisys
              </button>
            </div>
          </div>
          <div className="mt-auto">
            <button onClick={handleClear} className="w-full py-3 border border-slate-800 hover:text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
              Wipe Core Memory
            </button>
          </div>
        </aside>

        {/* MAIN INTERFACE SECTION */}
        <section className="flex-1 p-6 md:p-10 flex flex-col z-10 overflow-hidden">
          
          {/* 1. MINIMAL QUERY BOX (Reduced height) */}
          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-1 shadow-2xl focus-within:border-indigo-500/40 transition-all mb-6 shrink-0">
            <div className="flex items-center">
              <textarea 
                rows={1} // Minimal rows
                value={question} 
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAsk()}
                placeholder="Interrogate the knowledge base..."
                className="flex-1 bg-transparent p-4 text-lg text-white placeholder:text-slate-700 focus:outline-none resize-none"
              />
              <div className="px-2">
                <button 
                  onClick={handleAsk} 
                  disabled={loading || !question}
                  className="px-6 py-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:border-indigo-500 transition-all disabled:opacity-30"
                >
                  Interrogate
                </button>
              </div>
            </div>
          </div>

          {/* 2. BIGGER NEURAL OUTPUT (flex-1 makes it fill all remaining space) */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-4 mb-4">
               <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Neural Output</span>
               <div className="h-[1px] flex-grow bg-slate-800/50"></div>
            </div>

            <div className={`flex-1 bg-slate-900/20 border border-slate-800/50 rounded-[2rem] p-8 md:p-12 relative overflow-y-auto custom-scrollbar ${!answer ? 'flex items-center justify-center' : ''}`}>
              {answer ? (
                <div className="w-full max-w-none animate-in fade-in duration-500">
                  <p className="text-slate-300 text-xl md:text-3xl font-light leading-relaxed whitespace-pre-wrap">
                    {answer}
                  </p>
                </div>
              ) : (
                <div className="text-center opacity-10 select-none">
                  <div className="text-[15rem] font-black leading-none">?</div>
                  <p className="font-bold uppercase tracking-[0.5em] text-sm">Awaiting neural input</p>
                </div>
              )}

              {answer && !loading && (
                 <button 
                  onClick={() => navigator.clipboard.writeText(answer)}
                  className="absolute top-6 right-8 text-slate-700 hover:text-indigo-400 p-2 hover:bg-slate-800 rounded-lg"
                 >
                   <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                   </svg>
                 </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App