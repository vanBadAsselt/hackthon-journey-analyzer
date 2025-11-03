import { BusinessValue, Complexity, RiskLevel } from './types';

/**
 * Calculates risk level based on business value and complexity
 */
export class RiskCalculator {
  /**
   * Risk matrix:
   * - High business value + High complexity = Critical risk
   * - High business value + Medium complexity = High risk
   * - High business value + Low complexity = Medium risk
   * - Medium business value + High complexity = High risk
   * - Medium business value + Medium complexity = Medium risk
   * - Medium business value + Low complexity = Low risk
   * - Low business value + High complexity = Medium risk
   * - Low business value + Medium complexity = Low risk
   * - Low business value + Low complexity = Low risk
   */
  calculateRisk(businessValue: BusinessValue, complexity: Complexity): RiskLevel {
    const riskMatrix: Record<BusinessValue, Record<Complexity, RiskLevel>> = {
      high: {
        high: 'critical',
        medium: 'high',
        low: 'medium'
      },
      medium: {
        high: 'high',
        medium: 'medium',
        low: 'low'
      },
      low: {
        high: 'medium',
        medium: 'low',
        low: 'low'
      }
    };

    return riskMatrix[businessValue][complexity];
  }

  /**
   * Generates risk reasoning explanation
   */
  getRiskReasoning(
    businessValue: BusinessValue,
    complexity: Complexity,
    riskLevel: RiskLevel
  ): string {
    const valueImpact = this.getValueImpact(businessValue);
    const complexityImpact = this.getComplexityImpact(complexity);

    return `${riskLevel.toUpperCase()} RISK: ${valueImpact} ${complexityImpact}`;
  }

  private getValueImpact(value: BusinessValue): string {
    const impacts: Record<BusinessValue, string> = {
      high: 'This journey has high business value and directly impacts revenue or critical operations.',
      medium: 'This journey has moderate business value and supports important user functions.',
      low: 'This journey has low business value and involves non-critical features.'
    };
    return impacts[value];
  }

  private getComplexityImpact(complexity: Complexity): string {
    const impacts: Record<Complexity, string> = {
      high: 'The high code complexity means changes are risky and bugs are more likely.',
      medium: 'The moderate complexity requires careful testing when making changes.',
      low: 'The low complexity makes this journey relatively safe to modify.'
    };
    return impacts[complexity];
  }
}
