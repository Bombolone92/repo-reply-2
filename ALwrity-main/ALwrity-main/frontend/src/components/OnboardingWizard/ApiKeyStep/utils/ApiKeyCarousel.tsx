import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Button,
  Typography,
  Fade,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Launch,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
  Key,
  ContentPasteRounded,
} from '@mui/icons-material';

interface ApiKeyCarouselProps {
  providers: Array<{
    name: string;
    description: string;
    key: string;
    setKey: (key: string) => void;
    showKey: boolean;
    setShowKey: (show: boolean) => void;
    placeholder: string;
    status: 'valid' | 'invalid' | 'empty';
    link: string;
    free: boolean;
    recommended: boolean;
  benefits: string[];
}>;
  currentProvider: number;
  setCurrentProvider: (index: number) => void;
  onProviderFocus: (provider: any) => void;
}

const ApiKeyCarousel: React.FC<ApiKeyCarouselProps> = ({
  providers,
  currentProvider,
  setCurrentProvider,
  onProviderFocus,
}) => {
  const provider = providers[currentProvider];

  const getAccentColor = (name: string) => {
    const n = name.toLowerCase();
    if (n === 'gemini') return '#3B82F6';
    if (n === 'exa') return '#10B981';
    return '#8B5CF6';
  };

  useEffect(() => {
    // Auto-advance to next provider when current one is completed
    if (provider.status === 'valid' && currentProvider < providers.length - 1) {
      const timer = setTimeout(() => {
        setCurrentProvider(currentProvider + 1);
        onProviderFocus(providers[currentProvider + 1]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [provider.status, currentProvider, providers, setCurrentProvider, onProviderFocus]);

  useEffect(() => {
    // Focus on current provider for sidebar
    onProviderFocus(provider);
  }, [currentProvider, provider, onProviderFocus]);

  const handleNext = () => {
    if (currentProvider < providers.length - 1) {
      const next = currentProvider + 1;
      setCurrentProvider(next);
      // proactively sync sidebar
      onProviderFocus(providers[next]);
    }
  };

  const handlePrevious = () => {
    if (currentProvider > 0) {
      const prev = currentProvider - 1;
      setCurrentProvider(prev);
      // proactively sync sidebar
      onProviderFocus(providers[prev]);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      {/* Progress Stepper - Hidden as requested */}
      {/* <Box sx={{ 
        mb: 4, 
        p: 3, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        backdropFilter: 'blur(10px)',
      }}>
        <Stepper 
          activeStep={currentProvider} 
          alternativeLabel
          connector={<CustomStepConnector />}
        >
          {providers.map((prov, index) => (
            <Step key={prov.name} completed={prov.status === 'valid'}>
              <StepLabel
                icon={getStepIcon(index)}
                onClick={() => setCurrentProvider(index)}
                sx={{ 
                  cursor: 'pointer',
                  '& .MuiStepLabel-label': {
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: prov.status === 'valid' ? '#059669' : 
                           index === currentProvider ? '#1D4ED8' : '#64748B',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                  '& .MuiStepLabel-iconContainer': {
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }
                }}
              >
                {prov.name}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box> */}

      {/* Current Provider Card */}
      <Fade in={true} key={currentProvider} timeout={300}>
        <Card
          sx={{
            border: '1px solid #E2E8F0',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 16px 32px rgba(2, 6, 23, 0.08), 0 6px 12px rgba(2, 6, 23, 0.06)',
            position: 'relative',
            overflow: 'visible',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 20px 40px rgba(2, 6, 23, 0.10), 0 8px 16px rgba(2, 6, 23, 0.06)'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 4,
              background: 'radial-gradient(1200px 300px at 50% -100px, rgba(59,130,246,0.08), rgba(255,255,255,0) 60%)',
              pointerEvents: 'none',
            }
          }}
        >
          {/* Progress indicator for valid status */}
          {provider.status === 'valid' && (
            <LinearProgress
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                borderRadius: '12px 12px 0 0',
                backgroundColor: 'success.light',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'success.main',
                },
              }}
              variant="determinate"
              value={100}
            />
          )}

          <CardContent sx={{ p: 4 }}>
            {/* Provider Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: provider.recommended
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : provider.name.toLowerCase() === 'gemini'
                    ? 'linear-gradient(135deg, #4285F4 0%, #1557B0 100%)'
                    : provider.name.toLowerCase() === 'exa'
                    ? 'linear-gradient(135deg, #10B981 0%, #047857 100%)'
                    : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px) scale(1.05)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15), 0 6px 12px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <Key sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    background: 'linear-gradient(135deg, #1E293B 0%, #475569 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    mb: 1,
                    fontSize: '1.75rem',
                  }}
                >
                  {provider.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 500,
                    color: '#64748B',
                    fontSize: '1.1rem',
                    lineHeight: 1.5,
                  }}
                >
                  {provider.description}
                </Typography>
              </Box>
              {provider.status === 'valid' && (
                <CheckCircle sx={{ color: 'success.main', fontSize: 32 }} />
              )}
            </Box>

            {/* API Key Input */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                type={provider.showKey ? 'text' : 'password'}
                value={provider.key}
                onChange={(e) => provider.setKey(e.target.value)}
                placeholder={provider.placeholder}
                variant="outlined"
                name={`api-key-${provider.name.toLowerCase()}`}
                autoComplete="off"
                autoFocus
                InputProps={{
                  startAdornment: <Lock sx={{ color: '#64748B', mr: 2, fontSize: 22 }} />,
                  endAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton
                        aria-label="Paste API key from clipboard"
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            if (text) provider.setKey(text.trim());
                          } catch (e) {
                            // no-op
                          }
                        }}
                        edge="end"
                        sx={{
                          color: '#64748B',
                          '&:hover': {
                            color: getAccentColor(provider.name),
                            background: 'rgba(148, 163, 184, 0.15)',
                          },
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        title="Paste"
                      >
                        <ContentPasteRounded />
                      </IconButton>
                      <IconButton
                        aria-label={provider.showKey ? 'Hide API key' : 'Show API key'}
                        onClick={() => provider.setShowKey(!provider.showKey)}
                        edge="end"
                        sx={{
                          color: '#64748B',
                          '&:hover': {
                            color: getAccentColor(provider.name),
                            background: 'rgba(148, 163, 184, 0.15)',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        title={provider.showKey ? 'Hide' : 'Show'}
                      >
                        {provider.showKey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Box>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                    border: '2px solid #E2E8F0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&:hover': {
                      borderColor: '#CBD5E1',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
                      transform: 'translateY(-1px)',
                    },
                    '&.Mui-focused': {
                      borderColor: getAccentColor(provider.name),
                      boxShadow: `0 0 0 4px ${getAccentColor(provider.name)}22, 0 8px 24px rgba(0, 0, 0, 0.12)`,
                      transform: 'translateY(-2px)',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '18px 24px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 500,
                    color: '#1E293B',
                    '&::placeholder': {
                      color: '#94A3B8',
                      opacity: 1,
                    }
                  },
                }}
              />
            </Box>

            {/* Get API Key Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Button
                href={provider.link}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                startIcon={<Launch />}
                sx={{
                  fontWeight: 600,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  textTransform: 'none',
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  fontSize: '1rem',
                  background: provider.name.toLowerCase() === 'gemini'
                    ? 'linear-gradient(135deg, #4285F4 0%, #1557B0 100%)'
                    : provider.name.toLowerCase() === 'exa'
                    ? 'linear-gradient(135deg, #10B981 0%, #047857 100%)'
                    : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  color: 'white',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2), 0 6px 12px rgba(0, 0, 0, 0.15)',
                    background: provider.name.toLowerCase() === 'gemini'
                      ? 'linear-gradient(135deg, #1557B0 0%, #0D47A1 100%)'
                      : provider.name.toLowerCase() === 'exa'
                      ? 'linear-gradient(135deg, #047857 0%, #065F46 100%)'
                      : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  },
                }}
              >
                Get {provider.name} API Key
              </Button>
            </Box>

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IconButton
                onClick={handlePrevious}
                disabled={currentProvider === 0}
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                  border: '2px solid #E2E8F0',
                  color: '#64748B',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                    borderColor: '#CBD5E1',
                    color: '#475569',
                    transform: 'translateY(-2px) scale(1.05)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
                  },
                  '&:disabled': {
                    opacity: 0.4,
                    transform: 'none',
                    '&:hover': {
                      transform: 'none',
                    }
                  },
                }}
              >
                <NavigateBefore sx={{ fontSize: 24 }} />
              </IconButton>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
                border: `2px solid ${getAccentColor(provider.name)}22`,
              }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                    color: '#334155',
                    fontSize: '1rem',
                  }}
                >
                  {currentProvider + 1}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 400,
                    color: '#64748B',
                  }}
                >
                  of {providers.length}
                </Typography>
              </Box>

              <IconButton
                onClick={handleNext}
                disabled={currentProvider === providers.length - 1}
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                  border: '2px solid #E2E8F0',
                  color: '#64748B',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                    borderColor: '#CBD5E1',
                    color: '#475569',
                    transform: 'translateY(-2px) scale(1.05)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
                  },
                  '&:disabled': {
                    opacity: 0.4,
                    transform: 'none',
                    '&:hover': {
                      transform: 'none',
                    }
                  },
                }}
              >
                <NavigateNext sx={{ fontSize: 24 }} />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default ApiKeyCarousel;
