// src/theme.js
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#bb86fc',
      contrastText: '#ffffff', // Ensures text color is white
    },
    secondary: {
      main: '#03dac6',
      contrastText: '#000000', // Ensures text color is black
    },
    background: {
      default: '#121212',
      paper: '#1d1d1d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#bbbbbb',
    },
  },
  typography: {
    h4: {
      fontWeight: 'bold',
      color: '#bb86fc',
    },
    h5: {
      fontWeight: 'bold',
      color: '#03dac6',
    },
  },
});

export default darkTheme;
