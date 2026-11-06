import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Alert,
  Container,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Chip,
  Fade,
  Divider,
} from '@mui/material';
import {
  CheckCircleOutline as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  InfoOutlined as InfoIcon,
  WarningAmberOutlined as WarningIcon,
  Key as KeyIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import OnboardingButton from './common/OnboardingButton';
import { apiClient } from '../../api/client';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface ApiKeyValidationStepProps {
  onContinue: (stepData?: any) => void;
  updateHeaderContent: (content: { title: string; description: string }) => void;
  onValidationChange?: (isValid: boolean) => void;
}

interface ApiKeyStatus {
  valid: boolean;
  status: 'configured' | 'missing' | 'invalid' | 'checking';
  error?: string;
}

interface ValidationResponse {
  api_keys: Record<string, string>;
  validation_results: Record<string, ApiKeyStatus>;
  all_valid: boolean;
  total_providers: number;
  configured_providers: string[];
  missing_keys: string[];
}

const ApiKeyValidationStep: React.FC<ApiKeyValidationStepProps> = ({
  onContinue,
  updateHeaderContent,
  onValidationChange,
}) => {
  const [loading, setLoading] = useState(true);
  const [validationData, setValidationData] = useState<ValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const { subscription } = useSubscription();

  const validateApiKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ValidationResponse>('/api/onboarding/api-keys/validate');
      setValidationData(response.data);
      setIsValid(response.data.all_valid);
      if (onValidationChange) {
        onValidationChange(response.data.all_valid);
      }
    } catch (err: any) {
      console.error('Error validating API keys:', err);
      setError(err.response?.data?.detail || 'Failed to validate API keys. Please check backend logs.');
      setIsValid(false);
      if (onValidationChange) {
        onValidationChange(false);
      }
    } finally {
      setLoading(false);
    }
  }, [onValidationChange]);

  useEffect(() => {
    updateHeaderContent({
      title: 'API Keys Configured',
      description: 'Your AI service API keys have been successfully configured in the backend environment.',
    });
    validateApiKeys();
  }, [updateHeaderContent, validateApiKeys]);

  const handleContinue = () => {
    if (isValid) {
      onContinue();
    }
  };

  const getStatusIcon = (status: 'configured' | 'missing' | 'invalid' | 'checking') => {
    switch (status) {
      case 'configured':
        return <CheckCircleIcon color="success" />;
      case 'missing':
        return <WarningIcon color="warning" />;
      case 'invalid':
        return <ErrorIcon color="error" />;
      case 'checking':
        return <CircularProgress size={20} />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: 'configured' | 'missing' | 'invalid' | 'checking') => {
    switch (status) {
      case 'configured':
        return 'success';
      case 'missing':
        return 'warning';
      case 'invalid':
        return 'error';
      case 'checking':
        return 'info';
      default:
        return 'info';
    }
  };

  const formatProviderName = (provider: string) => {
    return provider
      .replace(/_API_KEY/g, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Fade in={true} timeout={500}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 3, fontWeight: 600 }}>
          API Key Validation
        </Typography>

        {loading && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="200px">
            <CircularProgress size={50} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Validating API key configurations...
            </Typography>
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && validationData && (
          <Box sx={{ mb: 4 }}>
            {isValid ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StarIcon sx={{ color: 'success.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    All API Keys Configured Successfully!
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Your AI services are ready to use. You can now proceed to the next step.
                </Typography>
                
                {/* Subscription Plan Details */}
                {subscription && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: 'rgba(76, 175, 80, 0.1)', 
                    borderRadius: 2,
                    border: '1px solid rgba(76, 175, 80, 0.2)'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Your Subscription Plan
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip 
                        label={subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} 
                        color="success" 
                        size="small"
                        variant="filled"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {subscription.active ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Monthly API calls: {subscription.limits.gemini_calls.toLocaleString()} Gemini, {subscription.limits.openai_calls.toLocaleString()} OpenAI
                    </Typography>
                  </Box>
                )}
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Some required API keys are missing or invalid. Please configure them in your backend .env file.
              </Alert>
            )}

            {/* Compact API Key Status Grid */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: 2,
              mb: 3
            }}>
              {Object.entries(validationData.validation_results).map(([provider, status]) => (
                <Card
                  key={provider}
                  variant="outlined"
                  sx={{
                    border: `1px solid`,
                    borderColor: status.status === 'configured' ? '#e8f5e8' : '#fff3cd',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      boxShadow: 2,
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <KeyIcon 
                          sx={{ 
                            color: status.status === 'configured' ? '#2e7d32' : '#ed6c02',
                            fontSize: 20
                          }} 
                        />
                        <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                          {formatProviderName(provider)}
                        </Typography>
                      </Box>
                      {getStatusIcon(status.status)}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Status:
                      </Typography>
                      <Chip 
                        label={status.status} 
                        color={getStatusColor(status.status) as any} 
                        size="small"
                        variant="filled"
                        sx={{ 
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24
                        }}
                      />
                    </Box>
                    
                    {status.status === 'configured' && (
                      <Typography variant="caption" sx={{ 
                        color: '#2e7d32', 
                        fontWeight: 500,
                        display: 'block',
                        mt: 0.5
                      }}>
                        Ready to use
                      </Typography>
                    )}
                    
                    {status.error && (
                      <Typography variant="caption" sx={{ 
                        color: 'error.main', 
                        fontWeight: 500,
                        display: 'block',
                        mt: 0.5
                      }}>
                        {status.error}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Compact Summary Section */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              justifyContent: 'center',
              mt: 3
            }}>
              {validationData.configured_providers.length > 0 && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${validationData.configured_providers.length} Configured`}
                  color="success"
                  variant="outlined"
                  sx={{ 
                    fontWeight: 600,
                    '& .MuiChip-icon': {
                      color: 'success.main'
                    }
                  }}
                />
              )}
              
              {validationData.missing_keys.length > 0 && (
                <Chip
                  icon={<WarningIcon />}
                  label={`${validationData.missing_keys.length} Missing`}
                  color="warning"
                  variant="outlined"
                  sx={{ 
                    fontWeight: 600,
                    '& .MuiChip-icon': {
                      color: 'warning.main'
                    }
                  }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Continue button is handled by the main wizard, not here */}
      </Container>
    </Fade>
  );
};

export default ApiKeyValidationStep;
