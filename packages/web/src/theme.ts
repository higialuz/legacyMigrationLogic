'use client'
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4fc3f7' },
    secondary: { main: '#66bb6a' },
    background: { default: '#0a0e1a', paper: '#0d1628' },
  },
  typography: { fontFamily: '"Inter","Roboto",sans-serif' },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: { styleOverrides: { root: { backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.08)' } } },
  },
})
