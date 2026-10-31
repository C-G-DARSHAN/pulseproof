import React from 'react';
import { BookOpen, CheckCircle, AlertCircle, Info, BarChart2 } from 'lucide-react';

export default function BenchmarkCard({ publishedBenchmarks, localEvaluation }) {
  const pub = publishedBenchmarks || {
    model_architecture: "EfficientNet-B4 (xdfdet)",
    checkpoint: "aug-cutout-black",
    published_auc_ffpp: 0.8981,
    published_auc_dfdc: "0.60–0.66",
    benchmark_source: "mertkayacs/xdfdet (FaceForensics++ test evaluation)",
    accuracy_caveat: "0.8981 is the published test AUC on FaceForensics++, not an 89.81% guaranteed real-world accuracy rate."
  };

  const local = localEvaluation || {
    status: "Not evaluated locally",
    message: "Local labelled test suite has not been executed on held-out videos in this environment."
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all duration-300 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Model Benchmarks & Empirical Evaluation</h3>
            <p className="text-[11px] text-slate-500">Published reference metrics vs locally verified test results</p>
          </div>
        </div>

        <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
          {pub.checkpoint}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Published Benchmarks Column */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center">
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Published Academic References
            </span>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
              Published AUC
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Architecture:</span>
              <span className="font-semibold text-slate-800">{pub.model_architecture}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">FaceForensics++ Test AUC:</span>
              <span className="font-mono font-bold text-emerald-700">{pub.published_auc_ffpp}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">DFDC In-The-Wild AUC:</span>
              <span className="font-mono font-bold text-amber-700">{pub.published_auc_dfdc}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
            <strong>Caveat:</strong> {pub.accuracy_caveat}
          </p>
        </div>

        {/* Local Verification Column */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              Local Empirical Validation
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              local.status === 'Locally Evaluated'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-700'
            }`}>
              {local.status}
            </span>
          </div>

          {local.overall_metrics ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Accuracy on Test Set:</span>
                <span className="font-mono font-bold text-slate-800">
                  {(local.overall_metrics.accuracy * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Precision / Recall:</span>
                <span className="font-mono font-bold text-slate-800">
                  {local.overall_metrics.precision} / {local.overall_metrics.recall}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">F1 Score:</span>
                <span className="font-mono font-bold text-slate-800">{local.overall_metrics.f1_score}</span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <Info className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs text-slate-600 font-medium">Not evaluated locally</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                Run <code className="text-[10px] bg-slate-200 px-1 py-0.5 rounded">python evaluation.py</code> on labelled ground-truth video clips to generate local verification scores.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
