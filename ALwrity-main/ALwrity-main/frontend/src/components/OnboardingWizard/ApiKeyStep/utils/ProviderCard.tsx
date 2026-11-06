import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Chip,
  IconButton,
  Button,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Key,
  Lock,
  Launch,
  Info as InfoIcon,
  Recommend,
  MoneyOff,
} from '@mui/icons-material';

export interface Provider {
  name: string;
  description: string;
  benefits: string[];
  key: string;
  setKey: (key: string) => void;
  showKey: boolean;
  setShowKey: (show: boolean) => void;
  placeholder: string;
  status: 'valid' | 'invalid' | 'empty';
  link: string;
  free: boolean;
  recommended: boolean;
}

interface ProviderCardProps {
  provider: Provider;
  savedKeys: Record<string, string>;
  onBenefitsClick: (provider: Provider) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  savedKeys,
  onBenefitsClick,
}) => {
  return (
    <Card
      sx={{
        border: `1px solid ${
          provider.status === 'valid'
            ? 'rgba(16, 185, 129, 0.2)'
            : provider.status === 'invalid'
            ? 'rgba(239, 68, 68, 0.2)'
            : 'rgba(0,0,0,0.08)'
        }`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
          transform: 'translateY(-1px)',
          borderColor:
            provider.status === 'valid'
              ? 'rgba(16, 185, 129, 0.4)'
              : provider.status === 'invalid'
              ? 'rgba(239, 68, 68, 0.4)'
              : 'rgba(0,0,0,0.12)',
        },
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background:
            provider.status === 'valid'
              ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.6) 0%, rgba(5, 150, 105, 0.6) 100%)'
              : provider.status === 'invalid'
              ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.6) 0%, rgba(220, 38, 38, 0.6) 100%)'
              : 'linear-gradient(90deg, rgba(107, 114, 128, 0.3) 0%, rgba(75, 85, 99, 0.3) 100%)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: provider.recommended
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Key sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '1.125rem',
                    color: 'text.primary',
                  }}
                >
                  {provider.name}
                </Typography>
                {provider.recommended && (
                  <Tooltip title="Recommended by ALwrity" arrow>
                    <Recommend
                      sx={{
                        color: 'success.main',
                        fontSize: 18,
                        cursor: 'help',
                      }}
                    />
                  </Tooltip>
                )}
                {provider.free && (
                  <Tooltip title="Free tier available" arrow>
                    <MoneyOff
                      sx={{
                        color: 'primary.main',
                        fontSize: 18,
                        cursor: 'help',
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 400,
                  lineHeight: 1.4,
                }}
              >
                {provider.description}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="text"
              onClick={() => onBenefitsClick(provider)}
              startIcon={<InfoIcon />}
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '0.75rem',
                fontFamily: 'Inter, system-ui, sans-serif',
                textTransform: 'none',
                padding: '2px 6px',
                borderRadius: 1,
                minWidth: 'auto',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.08)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Benefits ({provider.benefits.length})
            </Button>

            {provider.status === 'valid' && (
              <Chip
                icon={<CheckCircle />}
                label="Valid"
                color="success"
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            )}
            {provider.status === 'invalid' && (
              <Chip
                icon={<Error />}
                label="Invalid"
                color="error"
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            )}
          </Box>
        </Box>

        <TextField
          fullWidth
          type={provider.showKey ? 'text' : 'password'}
          value={provider.key}
          onChange={(e) => provider.setKey(e.target.value)}
          placeholder={provider.placeholder}
          variant="outlined"
          size="small"
          name={`api-key-${provider.name.toLowerCase()}`}
          autoComplete="off"
          InputProps={{
            startAdornment: <Lock sx={{ color: 'text.secondary', mr: 1, fontSize: 16 }} />,
            endAdornment: (
              <IconButton
                onClick={() => provider.setShowKey(!provider.showKey)}
                edge="end"
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    background: 'rgba(102, 126, 234, 0.08)',
                  },
                }}
              >
                {provider.showKey ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid rgba(0,0,0,0.12)',
              background: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                borderColor: 'rgba(0,0,0,0.24)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              },
              '&.Mui-focused': {
                borderColor:
                  provider.status === 'valid'
                    ? 'rgba(16, 185, 129, 0.6)'
                    : provider.status === 'invalid'
                    ? 'rgba(239, 68, 68, 0.6)'
                    : 'rgba(102, 126, 234, 0.6)',
                boxShadow: `0 0 0 2px ${
                  provider.status === 'valid'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : provider.status === 'invalid'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(102, 126, 234, 0.1)'
                }, 0 2px 8px rgba(0, 0, 0, 0.08)`,
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              padding: '12px 14px',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: 500,
              fontSize: '0.875rem',
            },
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
          <Button
            href={provider.link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'primary.main',
              textDecoration: 'none',
              fontFamily: 'Inter, system-ui, sans-serif',
              padding: '4px 8px',
              borderRadius: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(102, 126, 234, 0.08)',
                textDecoration: 'none',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Get API Key
            <Launch sx={{ fontSize: 16 }} />
          </Button>
        </Box>

        {savedKeys[provider.name.toLowerCase()] && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
            <Typography
              variant="caption"
              color="success.main"
              sx={{
                fontWeight: 500,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              Key already saved and secured
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderCard;
