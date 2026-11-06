import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Star,
  TrendingUp,
  Insights,
  Search,
  Assistant,
  Key,
  MoneyOff,
  Recommend,
} from '@mui/icons-material';

interface Provider {
  name: string;
  description: string;
  benefits: string[];
  status: 'valid' | 'invalid' | 'empty';
  free: boolean;
  recommended: boolean;
}

interface ApiKeySidebarProps {
  currentProvider: Provider | null;
  allProviders: Provider[];
  currentStep: number;
  totalSteps: number;
}

const ApiKeySidebar: React.FC<ApiKeySidebarProps> = ({ currentProvider, allProviders, currentStep, totalSteps }) => {
  // Shared dark card styling to keep sidebar visuals consistent
  const darkCardSx = {
    borderRadius: 4,
    background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.35), 0 8px 16px rgba(0, 0, 0, 0.25)'
  } as const;

  // Get API key status summary for all providers
  const getApiKeyStatusSummary = () => {
    const validCount = allProviders.filter(p => p.status === 'valid').length;
    const invalidCount = allProviders.filter(p => p.status === 'invalid').length;
    const emptyCount = allProviders.filter(p => p.status === 'empty').length;
    
    return {
      valid: validCount,
      invalid: invalidCount,
      empty: emptyCount,
      total: allProviders.length
    };
  };

  const statusSummary = getApiKeyStatusSummary();

  const getProviderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'gemini':
        return <Star sx={{ color: '#4285F4' }} />;
      case 'exa':
        return <Search sx={{ color: '#10b981' }} />;
      case 'copilotkit':
        return <Assistant sx={{ color: '#8B5CF6' }} />;
      default:
        return <Key />;
    }
  };

  const getProviderDetails = (name: string) => {
    switch (name.toLowerCase()) {
      case 'gemini':
        return {
          fullName: 'Google Gemini AI',
          purpose: 'Advanced Content Generation',
          keyFeatures: [
            'Multi-modal AI understanding',
            'Long context processing',
            'High-quality content creation',
            'Code generation capabilities',
            'Multiple language support'
          ],
          useCases: [
            'Blog post generation',
            'Social media content',
            'Email templates',
            'Product descriptions',
            'SEO-optimized articles'
          ],
          pricing: 'Free tier: 15 requests/min, 1M tokens/min',
          setupTime: '2 minutes'
        };
      case 'exa':
        return {
          fullName: 'Exa AI Search',
          purpose: 'Intelligent Web Research',
          keyFeatures: [
            'Semantic web search',
            'Real-time data retrieval',
            'Content summarization',
            'Source verification',
            'Trend analysis'
          ],
          useCases: [
            'Market research',
            'Fact-checking content',
            'Competitor analysis',
            'Industry insights',
            'News monitoring'
          ],
          pricing: 'Free tier: 1,000 searches/month',
          setupTime: '1 minute'
        };
      case 'copilotkit':
        return {
          fullName: 'CopilotKit Assistant',
          purpose: 'Enhanced User Experience',
          keyFeatures: [
            'In-app AI assistance',
            'Context-aware responses',
            'Workflow automation',
            'Real-time suggestions',
            'User interaction tracking'
          ],
          useCases: [
            'Writing assistance',
            'Content optimization',
            'User guidance',
            'Process automation',
            'Quality assurance'
          ],
          pricing: 'Free tier: 10,000 requests/month',
          setupTime: '3 minutes'
        };
      default:
        return null;
    }
  };

  const getProviderHelp = (name: string) => {
    switch (name.toLowerCase()) {
      case 'gemini':
        return {
          docUrl: 'https://ai.google.dev/',
          tips: [
            'Use unrestricted key for development; restrict by HTTP referrer for production.',
            'Enable Generative Language API in your Google Cloud project.',
            'If you see 429 errors, lower temperature or increase quota.'
          ],
          accent: '#3B82F6'
        };
      case 'exa':
        return {
          docUrl: 'https://docs.exa.ai/',
          tips: [
            'Use semantic search for long-form topics; include site filters when needed.',
            'Keep result size small (top_k 5-10) for fastest responses.',
            'Rotate key if you encounter 401 — keys expire when regenerated.'
          ],
          accent: '#10B981'
        };
      case 'copilotkit':
        return {
          docUrl: 'https://docs.copilotkit.ai/',
          tips: [
            'Public key starts with ck_pub_ — never paste secret keys in the browser.',
            'Enable domain allowlist in CopilotKit console for production.',
            'Check usage dashboard to monitor token consumption.'
          ],
          accent: '#8B5CF6'
        };
      default:
        return { docUrl: '#', tips: [], accent: '#3B82F6' };
    }
  };


  if (!currentProvider) {
    return (
      <Card sx={{ height: 'fit-content', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Configuration Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure your AI services to unlock ALwrity's full potential.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const details = getProviderDetails(currentProvider.name);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: 'fit-content' }}>
      {/* Dynamic Carousel Progress */}
      <Card sx={{ ...darkCardSx }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'Inter, system-ui, sans-serif', 
                  fontWeight: 700,
                  color: '#E2E8F0',
                  fontSize: '1.25rem',
                }}
              >
                {currentProvider ? currentProvider.name : 'API Key Setup'}
              </Typography>
              
              {/* API Key Status Summary */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {statusSummary.valid > 0 && (
                  <Chip
                    label={`${statusSummary.valid} Valid`}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 20,
                    }}
                  />
                )}
                {statusSummary.invalid > 0 && (
                  <Chip
                    label={`${statusSummary.invalid} Invalid`}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                      color: 'white',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 20,
                    }}
                  />
                )}
                {statusSummary.empty > 0 && (
                  <Chip
                    label={`${statusSummary.empty} Pending`}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                      color: 'white',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 20,
                    }}
                  />
                )}
              </Box>
            </Box>
            
            <Chip
              label={`${currentStep} of ${totalSteps}`}
              sx={{
                background: currentStep === totalSteps 
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.875rem',
                '& .MuiChip-label': {
                  px: 1.5,
                }
              }}
              size="small"
            />
          </Box>
          
          {/* Compact Status - Removed detailed provider list for space efficiency */}
        </CardContent>
      </Card>

      {/* Current Provider Details (specific to selected provider) */}
      <Card sx={{ ...darkCardSx }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            {getProviderIcon(currentProvider.name)}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{ 
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 700,
                  mb: 0.5,
                  color: '#E2E8F0',
                  fontSize: '1.25rem',
                }}
              >
                {details?.fullName || currentProvider.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ 
                  fontFamily: 'Inter, system-ui, sans-serif',
                  color: '#CBD5E1',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}
              >
                {details?.purpose || currentProvider.description}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {currentProvider.recommended && (
                <Chip
                  icon={<Recommend />}
                  label="Recommended"
                  sx={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '& .MuiChip-icon': {
                      color: 'white',
                    }
                  }}
                  size="small"
                />
              )}
              {currentProvider.free && (
                <Chip
                  icon={<MoneyOff />}
                  label="Free Tier"
                  sx={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '& .MuiChip-icon': {
                      color: 'white',
                    }
                  }}
                  size="small"
                />
              )}
            </Box>
          </Box>

          {details && (
            <>
              {/* Key Features */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                    mb: 1.5,
                    color: '#E2E8F0',
                  }}
                >
                  Key Features
                </Typography>
                <List dense sx={{ pt: 0 }}>
                  {details.keyFeatures.slice(0, 4).map((feature, index) => (
                    <ListItem key={index} sx={{ pl: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle sx={{ fontSize: 16, color: '#10B981' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontSize: '0.875rem',
                          color: '#CBD5E1'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(148,163,184,0.16)' }} />

              {/* Use Cases */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                    mb: 1.5,
                    color: '#E2E8F0',
                  }}
                >
                  Perfect For
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {details.useCases.slice(0, 3).map((useCase, index) => (
                    <Chip
                      key={index}
                      label={useCase}
                      size="small"
                      sx={{
                        background: 'rgba(148, 163, 184, 0.08)',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        color: '#E2E8F0',
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Quick Info */}
              <Box sx={{ 
                borderRadius: 2, 
                p: 2,
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(148,163,184,0.16)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#CBD5E1' }}>
                    Pricing
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#E2E8F0' }}>
                    {details.pricing}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#CBD5E1' }}>
                    Setup Time
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#E2E8F0' }}>
                    {details.setupTime}
                  </Typography>
                </Box>
              </Box>

              {/* Quick Setup Help (provider-specific) */}
              <Box sx={{ mt: 2, p: 2.5, borderRadius: 2, background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(148,163,184,0.16)' }}>
                <Typography variant="subtitle2" sx={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, mb: 1.25, color: '#E2E8F0' }}>
                  Quick Setup
                </Typography>
                <List dense sx={{ pt: 0 }}>
                  {getProviderHelp(currentProvider.name).tips.map((tip, i) => (
                    <ListItem key={i} sx={{ pl: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <Insights sx={{ fontSize: 16, color: getProviderHelp(currentProvider.name).accent }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={tip}
                        primaryTypographyProps={{ variant: 'body2', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.85rem', color: '#CBD5E1' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Benefits */}
      {currentProvider.benefits.length > 0 && (
        <Card sx={{ ...darkCardSx }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 700,
                mb: 2,
                color: '#E2E8F0',
              }}
            >
              Why This Matters
            </Typography>
            <List dense sx={{ pt: 0 }}>
              {currentProvider.benefits.map((benefit, index) => (
                <ListItem key={index} sx={{ pl: 0, py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <TrendingUp sx={{ fontSize: 16, color: getProviderHelp(currentProvider.name).accent }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={benefit}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '0.875rem',
                      color: '#CBD5E1'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ApiKeySidebar;
