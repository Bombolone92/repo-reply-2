import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Link,
  Collapse,
} from '@mui/material';
import {
  HelpOutline,
  Star,
  Info,
} from '@mui/icons-material';

interface HelpSectionProps {
  showHelp: boolean;
}

const HelpSection: React.FC<HelpSectionProps> = ({ showHelp }) => {
  return (
    <Collapse in={showHelp}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 3,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
          }}
        >
          <HelpOutline color="primary" />
          How to Get Your AI API Keys
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                <Star sx={{ color: 'warning.main', fontSize: 20 }} />
                Required Providers
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    Google Gemini
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: 400,
                    }}
                  >
                    Visit{' '}
                    <Link
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      makersuite.google.com
                    </Link>
                    , create an account, and generate an API key.
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    Exa AI
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: 400,
                    }}
                  >
                    Visit{' '}
                    <Link
                      href="https://dashboard.exa.ai/login"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      dashboard.exa.ai
                    </Link>
                    , sign up for a free account, and create an API key.
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    CopilotKit
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: 400,
                    }}
                  >
                    Visit{' '}
                    <Link
                      href="https://copilotkit.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      copilotkit.ai
                    </Link>
                    , sign up, and generate a public API key (starts with ck_pub_).
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                <Info sx={{ color: 'info.main', fontSize: 20 }} />
                Why These Services Matter
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 400,
                  }}
                >
                  <strong>Gemini:</strong> Powers AI content generation and intelligent writing assistance.
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 400,
                  }}
                >
                  <strong>Exa AI:</strong> Enables advanced web research and real-time information gathering.
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 400,
                  }}
                >
                  <strong>CopilotKit:</strong> Provides in-app AI assistant for enhanced user experience.
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 400,
                  }}
                >
                  <strong>All Required:</strong> These three services work together to provide complete AI functionality.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Collapse>
  );
};

export default HelpSection;
