import { RiskOverviewResponse, RiskLevel } from '../types.ts';

interface RiskResultsProps {
  results: RiskOverviewResponse;
  onReset: () => void;
}

const getRiskColor = (risk: RiskLevel): string => {
  switch (risk) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-300';
  }
};

const getRiskIcon = (risk: RiskLevel): string => {
  switch (risk) {
    case 'critical':
      return '🔴';
    case 'high':
      return '🟠';
    case 'medium':
      return '🟡';
    case 'low':
      return '🟢';
  }
};

export default function RiskResults({ results, onReset }: RiskResultsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Analysis Results</h2>
            <p className="text-gray-600 mt-1">
              Repository: <span className="font-mono text-indigo-600">{results.repositoryName}</span>
            </p>
            <p className="text-sm text-gray-500">
              Analyzed: {new Date(results.analysisTimestamp).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            ← New Analysis
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{results.summary.totalJourneys}</div>
            <div className="text-sm text-gray-600 mt-1">Total Journeys</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{results.summary.highRisk}</div>
            <div className="text-sm text-gray-600 mt-1">High/Critical Risk</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">{results.summary.mediumRisk}</div>
            <div className="text-sm text-gray-600 mt-1">Medium Risk</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{results.summary.lowRisk}</div>
            <div className="text-sm text-gray-600 mt-1">Low Risk</div>
          </div>
        </div>
      </div>

      {/* Journey Risks */}
      {results.journeyRisks.map((journeyRisk, index) => (
        <div key={index} className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900">
                {journeyRisk.journey.name}
              </h3>
              <p className="text-gray-600 mt-1">{journeyRisk.journey.description}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg border-2 font-semibold text-lg ${getRiskColor(journeyRisk.riskLevel)}`}>
              {getRiskIcon(journeyRisk.riskLevel)} {journeyRisk.riskLevel.toUpperCase()}
            </div>
          </div>

          {/* Risk Matrix */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600">Business Value</div>
              <div className="text-xl font-semibold text-purple-700 capitalize">
                {journeyRisk.businessValue}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Complexity</div>
              <div className="text-xl font-semibold text-blue-700 capitalize">
                {journeyRisk.complexity}
              </div>
            </div>
          </div>

          {/* Complexity Analysis */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Complexity Analysis</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Files Involved</div>
                <div className="text-2xl font-bold text-gray-900">
                  {journeyRisk.complexityAnalysis.filesInvolved.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Lines of Code</div>
                <div className="text-2xl font-bold text-gray-900">
                  {journeyRisk.complexityAnalysis.linesOfCode.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Dependencies</div>
                <div className="text-2xl font-bold text-gray-900">
                  {journeyRisk.complexityAnalysis.dependencies.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Cyclomatic Complexity</div>
                <div className="text-2xl font-bold text-gray-900">
                  {journeyRisk.complexityAnalysis.cyclomaticComplexity}
                </div>
              </div>
            </div>
          </div>

          {/* Reasoning */}
          <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-2">📊 Analysis</h4>
            <p className="text-sm text-indigo-800 whitespace-pre-line">
              {journeyRisk.reasoning}
            </p>
          </div>

          {/* Files Involved (Expandable) */}
          <details className="mt-4">
            <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
              📁 Files Involved ({journeyRisk.complexityAnalysis.filesInvolved.length})
            </summary>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
              <ul className="text-sm text-gray-600 space-y-1">
                {journeyRisk.complexityAnalysis.filesInvolved.map((file, i) => (
                  <li key={i} className="font-mono">
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      ))}
    </div>
  );
}
