import React from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Fade
} from '@mui/material';

interface WizardLoadingStateProps {
  loading: boolean;
}

export const WizardLoadingState: React.FC<WizardLoadingStateProps> = ({ loading }) => {
  if (!loading) {
    return null;
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Fade in={true}>
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            maxWidth: 400,
            width: '100%',
          }}
        >
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
            Setting up your workspace...
          </Typography>
          <LinearProgress 
            sx={{ 
              mt: 3, 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.08)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              }
            }} 
          />
        </Paper>
      </Fade>
    </Box>
  );
};
