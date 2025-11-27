import React, { useState } from 'react';
import { PocForm } from './components/PocForm';
import { RunTripForm } from './components/RunTripForm';
import { OutputDashboard } from './components/OutputDashboard';
import { RagGenerator } from './components/RagGenerator';
import { Check, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { IntakeStatus } from './types';

type WorkflowStep = 'STEP_1_POC' | 'STEP_2_RUN_TRIP' | 'STEP_3_OUTPUT';

const App: React.FC = () => {
  // To enable RAG Generator, set this to true manually. Currently hidden as per requirement.
  const SHOW_RAG_GENERATOR = false; 

  const [step, setStep] = useState<WorkflowStep>('STEP_1_POC');
  const [workflowData, setWorkflowData] = useState<{ scenarioName?: string }>({});
  
  // Background Intake Process State
  const [intakeStatus, setIntakeStatus] = useState<IntakeStatus>('IDLE');
  const [intakeStage, setIntakeStage] = useState<string>('');

  // ----------------------------------------------------------------------
  // Background Intake Logic (Lifted from PocForm)
  // ----------------------------------------------------------------------

  const runWebhookStep = async (url: string, payload: any, stageName: string, isJson: boolean = true) => {
    setIntakeStage(stageName);
    
    const options: RequestInit = {
      method: "POST",
      body: isJson ? JSON.stringify(payload) : payload,
    };

    if (isJson) {
      options.headers = {
        'Content-Type': 'application/json',
      };
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Step '${stageName}' failed: ${response.status} ${response.statusText}`);
    }
    
    return response;
  };

  const runDelay = async (seconds: number, nextStepLabel: string) => {
    for (let i = seconds; i > 0; i--) {
      setIntakeStage(`Waiting for ${nextStepLabel}... ${i}s`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const startIntakeProcess = async (formData: FormData, scenarioName: string) => {
    // 1. Update Global State
    setWorkflowData({ scenarioName });
    setIntakeStatus('RUNNING');
    
    // 2. Immediate Navigation to Step 2
    setStep('STEP_2_RUN_TRIP');

    // 3. Start Background Chain (Fire & Forget)
    try {
      // Step A: Upload
      await runWebhookStep(
        "https://wbdemo.shipsy.io/webhook/poc-scenario-intake", 
        formData, 
        "Uploading Files...", 
        false
      );

      await runDelay(30, "Mappings");

      // Step B: Mapping
      await runWebhookStep(
        "https://wbdemo.shipsy.io/webhook/mapping", 
        { scenario_name: scenarioName }, 
        "Generating Mappings..."
      );

      await runDelay(30, "Vehicle Normalization");

      // Step C: Normalize VH
      await runWebhookStep(
        "https://wbdemo.shipsy.io/webhook/normalizevh", 
        { scenario_name: scenarioName }, 
        "Normalizing Vehicles..."
      );

      await runDelay(30, "Consignment Normalization");

      // Step D: Normalize CN
      await runWebhookStep(
        "https://wbdemo.shipsy.io/webhook/normalizecn", 
        { scenario_name: scenarioName }, 
        "Normalizing Consignments..."
      );

      setIntakeStatus('COMPLETED');
      setIntakeStage('All data processed successfully.');

    } catch (err: any) {
      console.error("Intake Workflow Error:", err);
      setIntakeStatus('ERROR');
      setIntakeStage(`Error: ${err.message}`);
    }
  };


  // ----------------------------------------------------------------------
  // Rendering
  // ----------------------------------------------------------------------

  if (SHOW_RAG_GENERATOR) {
    return <RagGenerator />;
  }

  const steps = [
    { id: 'STEP_1_POC', label: 'Scenario Intake' },
    { id: 'STEP_2_RUN_TRIP', label: 'Run Optimization' },
    { id: 'STEP_3_OUTPUT', label: 'Results' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden relative">
      {/* Background Ambience - Light Mode */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-200/40 rounded-full blur-[120px]" />
      </div>

      {/* Global Intake Status Toast (Floating) */}
      {intakeStatus !== 'IDLE' && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-6 fade-in duration-500">
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md
            ${intakeStatus === 'RUNNING' ? 'bg-white/90 border-sky-200' : ''}
            ${intakeStatus === 'COMPLETED' ? 'bg-emerald-50/90 border-emerald-200' : ''}
            ${intakeStatus === 'ERROR' ? 'bg-red-50/90 border-red-200' : ''}
          `}>
            {intakeStatus === 'RUNNING' && <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />}
            {intakeStatus === 'COMPLETED' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {intakeStatus === 'ERROR' && <XCircle className="w-5 h-5 text-red-500" />}
            
            <div className="flex flex-col">
              <span className={`text-xs font-bold uppercase tracking-wide
                ${intakeStatus === 'RUNNING' ? 'text-sky-600' : ''}
                ${intakeStatus === 'COMPLETED' ? 'text-emerald-600' : ''}
                ${intakeStatus === 'ERROR' ? 'text-red-600' : ''}
              `}>
                {intakeStatus === 'RUNNING' ? 'Background Process' : 'Process Finished'}
              </span>
              <span className="text-sm font-medium text-slate-700 max-w-[200px] truncate">
                {intakeStage}
              </span>
            </div>
            
            {intakeStatus === 'RUNNING' && (
              <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse ml-2" />
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        
        {/* Header / Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in-down">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/80 border border-slate-200 rounded-full shadow-sm backdrop-blur-md">
               <img src="https://shipsy.io/wp-content/uploads/2021/05/Shipsy-Logo-Dark.png" alt="Shipsy" className="h-4" />
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Route Optimizer POC</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm font-medium">
            {steps.map((s, idx) => {
              const isActive = idx === currentStepIndex;
              const isCompleted = idx < currentStepIndex;
              
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 transition-colors duration-300 ${isActive ? 'text-slate-900' : isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 shadow-sm
                      ${isActive 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-200 scale-110' 
                        : isCompleted 
                          ? 'bg-white border-slate-200 text-emerald-500' 
                          : 'bg-white border-slate-200 text-slate-400'}
                    `}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <span>{idx + 1}</span>}
                    </div>
                    <span className={`${isActive ? 'opacity-100 font-semibold' : 'opacity-70'} hidden sm:block`}>{s.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-8 sm:w-16 h-[2px] rounded-full transition-colors duration-500 ${idx < currentStepIndex ? 'bg-indigo-500/30' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-500 ease-in-out">
          {step === 'STEP_1_POC' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PocForm 
                onStartProcess={startIntakeProcess} 
                onSkipToOptimization={() => setStep('STEP_2_RUN_TRIP')}
              />
            </div>
          )}

          {step === 'STEP_2_RUN_TRIP' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <RunTripForm 
                initialScenarioName={workflowData.scenarioName}
                intakeStatus={intakeStatus}
                onNext={() => setStep('STEP_3_OUTPUT')}
                onBack={() => setStep('STEP_1_POC')}
              />
            </div>
          )}

          {step === 'STEP_3_OUTPUT' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <OutputDashboard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;