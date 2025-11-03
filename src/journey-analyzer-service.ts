import { AnalysisRequest, RiskOverviewResponse, JourneyRiskAnalysis } from './types';
import { GitHubScanner } from './github-scanner';
import { BusinessValueAnalyzer } from './business-value-analyzer';
import { ComplexityAnalyzer } from './complexity-analyzer';
import { RiskCalculator } from './risk-calculator';

/**
 * Main service for analyzing user journeys and calculating risk
 */
export class JourneyAnalyzerService {
  private githubScanner: GitHubScanner;
  private businessValueAnalyzer: BusinessValueAnalyzer;
  private complexityAnalyzer: ComplexityAnalyzer;
  private riskCalculator: RiskCalculator;

  constructor() {
    this.githubScanner = new GitHubScanner();
    this.businessValueAnalyzer = new BusinessValueAnalyzer();
    this.complexityAnalyzer = new ComplexityAnalyzer();
    this.riskCalculator = new RiskCalculator();
  }

  /**
   * Performs complete risk analysis for user journeys
   */
  async analyzeJourneys(request: AnalysisRequest): Promise<RiskOverviewResponse> {
    console.log('Starting journey analysis...');
    console.log(`GitHub URL: ${request.githubUrl}`);
    console.log(`Number of journeys: ${request.userJourneys.length}`);

    // Step 1: Scan the GitHub repository
    const { files, repositoryName } = await this.githubScanner.scanRepository(request.githubUrl);
    console.log(`Scanned ${files.length} files from repository: ${repositoryName}`);

    // Step 2: Analyze each user journey
    const journeyRisks: JourneyRiskAnalysis[] = [];

    for (const journey of request.userJourneys) {
      console.log(`Analyzing journey: ${journey.name}`);

      // Determine business value
      const businessValue = this.businessValueAnalyzer.analyze(journey);
      const valueReasoning = this.businessValueAnalyzer.getValueReasoning(journey, businessValue);

      // Analyze complexity and link to codebase
      const complexityAnalysis = this.complexityAnalyzer.analyzeJourneyComplexity(
        journey,
        files
      );

      // Calculate risk level
      const riskLevel = this.riskCalculator.calculateRisk(
        businessValue,
        complexityAnalysis.complexity
      );

      const riskReasoning = this.riskCalculator.getRiskReasoning(
        businessValue,
        complexityAnalysis.complexity,
        riskLevel
      );

      // Combine reasoning
      const reasoning = `${valueReasoning}\n${riskReasoning}\n\nComplexity Details: ${complexityAnalysis.filesInvolved.length} files involved, ${complexityAnalysis.linesOfCode} lines of code, ${complexityAnalysis.dependencies.length} dependencies, cyclomatic complexity of ${complexityAnalysis.cyclomaticComplexity}.`;

      journeyRisks.push({
        journey,
        businessValue,
        complexity: complexityAnalysis.complexity,
        riskLevel,
        complexityAnalysis,
        reasoning
      });
    }

    // Step 3: Cleanup
    await this.githubScanner.cleanup(repositoryName);

    // Step 4: Generate summary
    const summary = this.generateSummary(journeyRisks);

    return {
      githubUrl: request.githubUrl,
      repositoryName,
      analysisTimestamp: new Date().toISOString(),
      journeyRisks,
      summary
    };
  }

  /**
   * Generates summary statistics
   */
  private generateSummary(journeyRisks: JourneyRiskAnalysis[]) {
    return {
      totalJourneys: journeyRisks.length,
      highRisk: journeyRisks.filter(j => j.riskLevel === 'critical' || j.riskLevel === 'high').length,
      mediumRisk: journeyRisks.filter(j => j.riskLevel === 'medium').length,
      lowRisk: journeyRisks.filter(j => j.riskLevel === 'low').length
    };
  }
}
