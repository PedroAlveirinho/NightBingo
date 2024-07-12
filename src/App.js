// src/App.js
import React, { useState } from 'react';
import { Container, Button, TextField, Typography, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { firestore } from './firebaseConfig';
import Home from './Home';
import darkTheme from './theme';

const App = () => {
  const [username, setUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkUsernameExists = async (username) => {
    const q = query(collection(firestore, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleCreateAccount = async () => {
    const usernameExists = await checkUsernameExists(usernameInput);
    if (usernameExists) {
      alert('Username already exists');
    } else {
      try {
        await addDoc(collection(firestore, 'users'), { username: usernameInput });
        alert('Account created successfully');
        setUsername(usernameInput);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error creating account', error);
        alert('Error creating account');
      }
    }
  };

  const handleLogin = async () => {
    const usernameExists = await checkUsernameExists(usernameInput);
    if (usernameExists) {
      setUsername(usernameInput);
      setIsLoggedIn(true);
    } else {
      alert('Username does not exist');
    }
  };

  const handleSubmit = () => {
    if (isCreatingAccount) {
      handleCreateAccount();
    } else {
      handleLogin();
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container style={{ padding: '20px' }}>
        {!isLoggedIn ? (
          <>
            <Typography variant="h4">{isCreatingAccount ? 'Create Account' : 'Login'}</Typography>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              style={{ marginTop: '20px' }}
              InputLabelProps={{
                style: { color: '#ffffff' },
              }}
              InputProps={{
                style: { color: '#ffffff' },
              }}
            />
            <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: '10px', color: darkTheme.palette.primary.contrastText }}>
              {isCreatingAccount ? 'Create Account' : 'Login'}
            </Button>
            <Button color="secondary" onClick={() => setIsCreatingAccount(!isCreatingAccount)} style={{ marginTop: '10px', color: darkTheme.palette.secondary.contrastText }}>
              {isCreatingAccount ? 'Switch to Login' : 'Switch to Create Account'}
            </Button>
          </>
        ) : (
          <Home username={username} />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;
