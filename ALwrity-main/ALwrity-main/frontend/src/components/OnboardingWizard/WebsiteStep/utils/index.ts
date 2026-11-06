/**
 * Website Step Utils Index
 * Exports all utility functions for the WebsiteStep component
 */

// Website utilities
export {
  fixUrlFormat,
  extractDomainName,
  checkExistingAnalysis,
  loadExistingAnalysis,
  performAnalysis,
  fetchLastAnalysis
} from './websiteUtils';

// Rendering utilities
export {
  renderKeyInsight,
  renderGuidelinesCard,
  renderProUpgradeAlert,
  renderBrandAnalysisSection,
  renderContentStrategyInsightsSection,
  renderAIGenerationTipsSection,
  renderBestPracticesSection,
  renderAvoidElementsSection,
  renderAnalysisSection,
  renderGuidelinesSection,
  renderStylePatternsSection
} from './renderUtils';
