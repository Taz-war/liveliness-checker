import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Stack ,
  CssBaseline,
  Box,
  ThemeProvider, createTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send'; // Example Icon
import LivelinessChecker from './components/LivelinessChecker';
import Navbar from './components/ui/Navbar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#006A7B', // The dark teal from your navbar
    },
    background: {
      default: '#F4F6F8', // The subtle light gray background
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevents all-caps buttons if you prefer
          fontWeight: 'bold',
          borderRadius: 4,
        },
      },
    },
  },
});

function App({ user }) {
  // 'user' comes from Flask via the data-context attribute we set up earlier
  const [language, setLanguage] = useState('en');
  const handleClick = () => {
    alert(`Hello ${user.name || 'User'}! Sending data back to Flask...`);
    // Here you could fetch('/api/submit', ...)
  };

  return (
    <>
    {/* <Container maxWidth="sm" sx={{ marginTop: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Flask + React + MUI
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Welcome, <strong>{user.name}</strong>. This interface is rendered by React 
            inside a Jinja2 template, styled with Material UI.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="outlined" color="error">
              Cancel
            </Button>
            <Button 
              variant="contained" 
              endIcon={<SendIcon />} 
              onClick={handleClick}
            >
              Confirm
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container> */}
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Navbar is fixed at the top */}
      <Navbar currentLang={language} setLanguage={setLanguage} />
      
      {/* Main Container - Centers the card vertically and horizontally */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          pt: '64px', // Pushes content below the fixed 64px navbar
          px: 2 
        }}
      >
        <LivelinessChecker currentLang={language} />
      </Box>
    </ThemeProvider>
    </>
  );
}

export default App;