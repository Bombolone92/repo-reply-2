import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from '@mui/material';

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

interface BenefitsModalProps {
  open: boolean;
  onClose: () => void;
  selectedProvider: Provider | null;
}

const BenefitsModal: React.FC<BenefitsModalProps> = ({
  open,
  onClose,
  selectedProvider,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 600,
        }}
      >
        {selectedProvider?.name} Benefits
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
          }}
        >
          Discover what {selectedProvider?.name} can do for your content creation:
        </Typography>
        <List sx={{ pt: 0 }}>
          {selectedProvider?.benefits.map((benefit: string, index: number) => (
            <ListItem key={index} sx={{ px: 0, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'primary.main',
                    flexShrink: 0,
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={benefit}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BenefitsModal;
