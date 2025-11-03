export interface UserJourney {
  name: string;
  description: string;
  steps: string[];
}

export type BusinessValue = 'low' | 'medium' | 'high';
export type Complexity = 'low' | 'medium' | 'high';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AnalysisRequest {
  githubUrl: string;
  userJourneys: UserJourney[];
}

export interface CodebaseFile {
  path: string;
  content: string;
  size: number;
}

export interface JourneyComplexityAnalysis {
  filesInvolved: string[];
  dependencies: string[];
  linesOfCode: number;
  cyclomaticComplexity: number;
  complexity: Complexity;
}

export interface JourneyRiskAnalysis {
  journey: UserJourney;
  businessValue: BusinessValue;
  complexity: Complexity;
  riskLevel: RiskLevel;
  complexityAnalysis: JourneyComplexityAnalysis;
  reasoning: string;
}

export interface RiskOverviewResponse {
  githubUrl: string;
  repositoryName: string;
  analysisTimestamp: string;
  journeyRisks: JourneyRiskAnalysis[];
  summary: {
    totalJourneys: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
}
