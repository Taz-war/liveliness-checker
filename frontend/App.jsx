import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Stack 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send'; // Example Icon
import LivelinessChecker from './components/LivelinessChecker';

function App({ user }) {
  // 'user' comes from Flask via the data-context attribute we set up earlier

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
    <LivelinessChecker />
    </>
  );
}

export default App;