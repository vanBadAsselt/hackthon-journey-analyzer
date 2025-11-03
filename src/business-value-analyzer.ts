import { UserJourney, BusinessValue } from './types';

/**
 * Determines the business value of a user journey based on keywords and patterns
 */
export class BusinessValueAnalyzer {
  private highValueKeywords = [
    'payment', 'checkout', 'purchase', 'transaction', 'revenue',
    'subscription', 'billing', 'order', 'sale', 'critical',
    'security', 'authentication', 'login', 'signup', 'register',
    'onboarding', 'conversion', 'core', 'essential', 'critical path'
  ];

  private mediumValueKeywords = [
    'search', 'filter', 'browse', 'view', 'display', 'list',
    'notification', 'settings', 'profile', 'edit', 'update',
    'share', 'export', 'report', 'dashboard', 'analytics'
  ];

  private lowValueKeywords = [
    'help', 'documentation', 'tutorial', 'tooltip', 'faq',
    'about', 'contact', 'footer', 'header', 'navigation',
    'theme', 'preference', 'cosmetic', 'ui enhancement'
  ];

  /**
   * Analyzes a user journey and determines its business value
   */
  analyze(journey: UserJourney): BusinessValue {
    const text = `${journey.name} ${journey.description} ${journey.steps.join(' ')}`.toLowerCase();

    let highScore = 0;
    let mediumScore = 0;
    let lowScore = 0;

    // Count keyword matches
    this.highValueKeywords.forEach(keyword => {
      if (text.includes(keyword)) highScore++;
    });

    this.mediumValueKeywords.forEach(keyword => {
      if (text.includes(keyword)) mediumScore++;
    });

    this.lowValueKeywords.forEach(keyword => {
      if (text.includes(keyword)) lowScore++;
    });

    // Determine business value based on scores
    if (highScore > 0) {
      return 'high';
    } else if (mediumScore > 0) {
      return 'medium';
    } else if (lowScore > 0) {
      return 'low';
    }

    // Default to medium if no keywords match
    return 'medium';
  }

  /**
   * Provides reasoning for the business value determination
   */
  getValueReasoning(journey: UserJourney, value: BusinessValue): string {
    const text = `${journey.name} ${journey.description} ${journey.steps.join(' ')}`.toLowerCase();

    const matchedKeywords: string[] = [];

    if (value === 'high') {
      this.highValueKeywords.forEach(keyword => {
        if (text.includes(keyword)) matchedKeywords.push(keyword);
      });
      return `High business value: Journey involves critical business functions (${matchedKeywords.join(', ')})`;
    } else if (value === 'medium') {
      this.mediumValueKeywords.forEach(keyword => {
        if (text.includes(keyword)) matchedKeywords.push(keyword);
      });
      if (matchedKeywords.length > 0) {
        return `Medium business value: Journey involves important user functions (${matchedKeywords.join(', ')})`;
      }
      return 'Medium business value: Standard user journey without critical business impact';
    } else {
      this.lowValueKeywords.forEach(keyword => {
        if (text.includes(keyword)) matchedKeywords.push(keyword);
      });
      return `Low business value: Journey involves non-critical functions (${matchedKeywords.join(', ')})`;
    }
  }
}
