import React from 'react';
import { Activity, Clock, FileCheck, ExternalLink, Loader2 } from 'lucide-react';

export const OutputDashboard: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 border border-emerald-100 rounded-full mb-4">
          <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Optimization Triggered</h1>
        <p className="text-slate-500">The route optimization process has been initiated successfully.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Status Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 ring-1 ring-slate-900/5 rounded-2xl p-6 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-24 h-24 text-sky-500" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Job Status</h2>
            <p className="text-sm text-slate-500 mb-6">Real-time execution details</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Processing Trip Data</div>
                  <div className="text-xs text-slate-500">Just now</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 opacity-60">
                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                <div>
                  <div className="text-sm font-medium text-slate-400">Generating Routes</div>
                  <div className="text-xs text-slate-400">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Placeholder */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 ring-1 ring-slate-900/5 rounded-2xl p-6 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FileCheck className="w-24 h-24 text-emerald-500" />
          </div>

          <div className="relative z-10 h-full flex flex-col">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Results & Output</h2>
            <p className="text-sm text-slate-500 mb-6">Generated artifacts will appear here</p>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="w-12 h-12 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center mb-3">
                <Activity className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-700">Waiting for Results...</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                Once the optimization is complete, download links and summary stats will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <a href="#" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          <ExternalLink className="w-4 h-4" />
          View logs in admin console
        </a>
      </div>
    </div>
  );
};