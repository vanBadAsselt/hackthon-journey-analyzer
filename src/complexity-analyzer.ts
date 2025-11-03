import { UserJourney, CodebaseFile, JourneyComplexityAnalysis, Complexity } from './types';

/**
 * Analyzes code complexity and links user journeys to codebase
 */
export class ComplexityAnalyzer {
  /**
   * Links a user journey to relevant codebase files and analyzes complexity
   */
  analyzeJourneyComplexity(
    journey: UserJourney,
    codebaseFiles: CodebaseFile[]
  ): JourneyComplexityAnalysis {
    // Extract keywords from journey
    const keywords = this.extractKeywords(journey);

    // Find relevant files based on keywords
    const relevantFiles = this.findRelevantFiles(keywords, codebaseFiles);

    // Analyze complexity metrics
    const linesOfCode = this.calculateLinesOfCode(relevantFiles);
    const dependencies = this.findDependencies(relevantFiles);
    const cyclomaticComplexity = this.estimateCyclomaticComplexity(relevantFiles);

    // Determine overall complexity
    const complexity = this.determineComplexity(
      relevantFiles.length,
      linesOfCode,
      dependencies.length,
      cyclomaticComplexity
    );

    return {
      filesInvolved: relevantFiles.map(f => f.path),
      dependencies,
      linesOfCode,
      cyclomaticComplexity,
      complexity
    };
  }

  /**
   * Extracts keywords from user journey for matching with codebase
   */
  private extractKeywords(journey: UserJourney): string[] {
    const text = `${journey.name} ${journey.description} ${journey.steps.join(' ')}`;

    // Extract meaningful words (3+ characters, no common words)
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 3);

    // Remove common words
    const stopWords = ['the', 'and', 'for', 'with', 'from', 'can', 'user', 'should', 'will', 'that', 'this'];
    const keywords = words.filter(word => !stopWords.includes(word));

    // Remove duplicates
    return [...new Set(keywords)];
  }

  /**
   * Finds codebase files relevant to the keywords
   */
  private findRelevantFiles(keywords: string[], files: CodebaseFile[]): CodebaseFile[] {
    const scoredFiles = files.map(file => {
      let score = 0;
      const fileText = `${file.path} ${file.content}`.toLowerCase();

      keywords.forEach(keyword => {
        // Path match is worth more
        if (file.path.toLowerCase().includes(keyword)) {
          score += 5;
        }

        // Content matches
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = fileText.match(regex);
        if (matches) {
          score += matches.length;
        }
      });

      return { file, score };
    });

    // Return files with score > 0, sorted by relevance
    return scoredFiles
      .filter(sf => sf.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20) // Limit to top 20 files
      .map(sf => sf.file);
  }

  /**
   * Calculates total lines of code in relevant files
   */
  private calculateLinesOfCode(files: CodebaseFile[]): number {
    return files.reduce((total, file) => {
      const lines = file.content.split('\n').filter(line => {
        const trimmed = line.trim();
        // Exclude empty lines and comments
        return trimmed.length > 0 &&
               !trimmed.startsWith('//') &&
               !trimmed.startsWith('/*') &&
               !trimmed.startsWith('*');
      });
      return total + lines.length;
    }, 0);
  }

  /**
   * Finds dependencies and imports across relevant files
   */
  private findDependencies(files: CodebaseFile[]): string[] {
    const dependencies = new Set<string>();

    files.forEach(file => {
      // Match various import patterns
      const importPatterns = [
        /import\s+.*from\s+['"]([^'"]+)['"]/g,  // ES6 imports
        /require\(['"]([^'"]+)['"]\)/g,         // CommonJS
        /@import\s+['"]([^'"]+)['"]/g,          // CSS imports
        /import\s+['"]([^'"]+)['"]/g            // Simple imports
      ];

      importPatterns.forEach(pattern => {
        const matches = file.content.matchAll(pattern);
        for (const match of matches) {
          if (match[1]) {
            dependencies.add(match[1]);
          }
        }
      });
    });

    return Array.from(dependencies);
  }

  /**
   * Estimates cyclomatic complexity across files
   */
  private estimateCyclomaticComplexity(files: CodebaseFile[]): number {
    let totalComplexity = 0;

    files.forEach(file => {
      const content = file.content;

      // Count decision points (rough estimate)
      const ifStatements = (content.match(/\bif\s*\(/g) || []).length;
      const forLoops = (content.match(/\bfor\s*\(/g) || []).length;
      const whileLoops = (content.match(/\bwhile\s*\(/g) || []).length;
      const caseStatements = (content.match(/\bcase\s+/g) || []).length;
      const ternaryOps = (content.match(/\?.*:/g) || []).length;
      const logicalOps = (content.match(/&&|\|\|/g) || []).length;
      const catchBlocks = (content.match(/\bcatch\s*\(/g) || []).length;

      // Each decision point adds to complexity
      totalComplexity += ifStatements + forLoops + whileLoops +
                        caseStatements + ternaryOps + logicalOps + catchBlocks;
    });

    return totalComplexity;
  }

  /**
   * Determines overall complexity level based on metrics
   */
  private determineComplexity(
    fileCount: number,
    linesOfCode: number,
    dependencyCount: number,
    cyclomaticComplexity: number
  ): Complexity {
    // Scoring system
    let score = 0;

    // File count scoring
    if (fileCount > 15) score += 3;
    else if (fileCount > 8) score += 2;
    else if (fileCount > 3) score += 1;

    // Lines of code scoring
    if (linesOfCode > 2000) score += 3;
    else if (linesOfCode > 1000) score += 2;
    else if (linesOfCode > 500) score += 1;

    // Dependency scoring
    if (dependencyCount > 20) score += 3;
    else if (dependencyCount > 10) score += 2;
    else if (dependencyCount > 5) score += 1;

    // Cyclomatic complexity scoring
    if (cyclomaticComplexity > 100) score += 3;
    else if (cyclomaticComplexity > 50) score += 2;
    else if (cyclomaticComplexity > 20) score += 1;

    // Determine complexity level
    if (score >= 8) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }
}
