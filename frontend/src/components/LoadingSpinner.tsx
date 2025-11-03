export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Analyzing Repository...
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          This may take a moment as we:
        </p>
        <ul className="text-left text-sm text-gray-600 space-y-2">
          <li>🔄 Cloning the GitHub repository</li>
          <li>📁 Scanning source code files</li>
          <li>🔍 Analyzing user journeys</li>
          <li>📊 Calculating complexity metrics</li>
          <li>⚠️ Determining risk levels</li>
        </ul>
      </div>
    </div>
  );
}
