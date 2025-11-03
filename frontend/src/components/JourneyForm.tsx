import { UserJourney } from '../types.ts';
import { useState } from 'react';

interface JourneyFormProps {
  githubUrl: string;
  setGithubUrl: (url: string) => void;
  journeys: UserJourney[];
  setJourneys: (journeys: UserJourney[]) => void;
}

export default function JourneyForm({
  githubUrl,
  setGithubUrl,
  journeys,
  setJourneys,
}: JourneyFormProps) {
  const [bulkInput, setBulkInput] = useState('');
  const [parseError, setParseError] = useState('');

  const parseBulkInput = (text: string): UserJourney[] => {
    const journeys: UserJourney[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentJourney: Partial<UserJourney> | null = null;
    let inSteps = false;

    for (const line of lines) {
      // Journey name (starts with ## or "Journey:")
      if (line.startsWith('##') || line.toLowerCase().startsWith('journey:')) {
        if (currentJourney && currentJourney.name && currentJourney.description && currentJourney.steps) {
          journeys.push(currentJourney as UserJourney);
        }
        currentJourney = {
          name: line.replace(/^##\s*|^journey:\s*/i, '').trim(),
          description: '',
          steps: []
        };
        inSteps = false;
      }
      // Description (starts with "Description:")
      else if (line.toLowerCase().startsWith('description:')) {
        if (currentJourney) {
          currentJourney.description = line.replace(/^description:\s*/i, '').trim();
        }
      }
      // Steps section
      else if (line.toLowerCase().startsWith('steps:')) {
        inSteps = true;
      }
      // Step item (starts with -, *, or number)
      else if (inSteps && (line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line))) {
        if (currentJourney && currentJourney.steps) {
          const step = line.replace(/^[-*]\s*|^\d+\.\s*/, '').trim();
          if (step) {
            currentJourney.steps.push(step);
          }
        }
      }
    }

    // Add last journey
    if (currentJourney && currentJourney.name && currentJourney.description && currentJourney.steps && currentJourney.steps.length > 0) {
      journeys.push(currentJourney as UserJourney);
    }

    return journeys;
  };

  const handleBulkInputChange = (text: string) => {
    setBulkInput(text);
    setParseError('');
    
    if (text.trim()) {
      try {
        const parsed = parseBulkInput(text);
        console.log('Parsed journeys:', parsed);
        if (parsed.length === 0) {
          setParseError('No valid journeys found. Please follow the format shown in the example.');
          setJourneys([]);
        } else {
          setJourneys(parsed);
        }
      } catch (error) {
        setParseError('Error parsing input. Please check the format.');
        setJourneys([]);
      }
    } else {
      setJourneys([]);
    }
  };

  const exampleFormat = `## User Login and Authentication
Description: User logs into the application using email and password
Steps:
- User navigates to login page
- User enters email address
- User enters password
- System validates credentials
- User is redirected to dashboard

## Complete Purchase Checkout
Description: User completes a purchase transaction with payment processing
Steps:
- User adds items to shopping cart
- User reviews cart contents
- User proceeds to checkout
- User enters payment details
- System processes payment
- User receives order confirmation`;

  return (
    <div className="space-y-6">
      {/* GitHub URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          GitHub Repository URL *
        </label>
        <input
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/username/repository"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Bulk Input */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            User Journeys (Bulk Input) *
          </label>
          <button
            type="button"
            onClick={() => {
              setBulkInput(exampleFormat);
              handleBulkInputChange(exampleFormat);
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Load Example Format
          </button>
        </div>
        
        <textarea
          value={bulkInput}
          onChange={(e) => handleBulkInputChange(e.target.value)}
          placeholder={`Paste your user journeys here using this format:\n\n${exampleFormat}`}
          rows={20}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
        />
        
        {parseError && (
          <p className="mt-2 text-sm text-red-600">{parseError}</p>
        )}
        
        {journeys.length > 0 && journeys[0] && journeys[0].name && (
          <p className="mt-2 text-sm text-green-600">
            ✓ Successfully parsed {journeys.length} journey{journeys.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Format Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Format Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><code className="bg-blue-100 px-1 rounded">##</code> or <code className="bg-blue-100 px-1 rounded">Journey:</code> - Start a new journey with its name</li>
          <li><code className="bg-blue-100 px-1 rounded">Description:</code> - Add the journey description</li>
          <li><code className="bg-blue-100 px-1 rounded">Steps:</code> - Indicate the start of steps</li>
          <li><code className="bg-blue-100 px-1 rounded">-</code> or <code className="bg-blue-100 px-1 rounded">*</code> or <code className="bg-blue-100 px-1 rounded">1.</code> - List individual steps</li>
        </ul>
      </div>
    </div>
  );
}
