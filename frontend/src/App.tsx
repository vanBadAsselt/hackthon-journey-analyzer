import { useState } from 'react';
import { AnalysisRequest, RiskOverviewResponse, UserJourney } from './types.ts';
import JourneyForm from './components/JourneyForm.tsx';
import RiskResults from './components/RiskResults.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';

function App() {
  const [githubUrl, setGithubUrl] = useState('');
  const [journeys, setJourneys] = useState<UserJourney[]>([
    { name: '', description: '', steps: [''] }
  ]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RiskOverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setError(null);
    setResults(null);

    // Validate input
    const validJourneys = journeys.filter(j =>
      j.name &&
      j.description &&
      j.steps.length > 0 &&
      j.steps.some(step => step.trim().length > 0)
    );

    if (!githubUrl || validJourneys.length === 0) {
      setError('Please enter a GitHub URL and at least one valid user journey');
      return;
    }

    setLoading(true);

    try {
      const request: AnalysisRequest = {
        githubUrl,
        userJourneys: validJourneys
      };

      console.log('Sending request:', request);

      const response = await fetch('http://localhost:3000/api/journey-analyzer/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Analysis failed');
      }

      const data: RiskOverviewResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setGithubUrl('https://github.com/vanBadAsselt/hackathon-leaddev-anais');
    setJourneys([
      {
        name: 'User Login and Authentication',
        description: 'User logs into the application using email and password',
        steps: [
          'User navigates to login page',
          'User enters email address',
          'User enters password',
          'System validates credentials',
          'User is redirected to dashboard'
        ]
      },
      {
        name: 'Complete Purchase Checkout',
        description: 'User completes a purchase transaction with payment processing',
        steps: [
          'User adds items to shopping cart',
          'User reviews cart contents',
          'User proceeds to checkout',
          'User enters payment details',
          'System processes payment',
          'User receives order confirmation'
        ]
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎯 Journey Analyzer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analyze user journeys based on your GitHub repository.
            Get insights on business value, complexity, and risk levels.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {!results ? (
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Configure Analysis
                </h2>
                <button
                  onClick={loadExample}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Load Example
                </button>
              </div>

              <JourneyForm
                githubUrl={githubUrl}
                setGithubUrl={setGithubUrl}
                journeys={journeys}
                setJourneys={setJourneys}
              />

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !githubUrl || journeys.length === 0}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-lg font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {loading ? 'Analyzing...' : '🚀 Analyze User Journeys'}
                </button>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <RiskResults
              results={results}
              onReset={() => setResults(null)}
            />
          )}

          {loading && <LoadingSpinner />}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="text-sm">
            Powered by Journey Analyzer API • Built with React + TypeScript
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
