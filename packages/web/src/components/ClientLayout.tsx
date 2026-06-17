'use client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '@/theme'
import { Box, Typography, Chip, Tabs, Tab } from '@mui/material'
import { useState, ReactNode } from 'react'

function Header({ tab, setTab }: { tab: number; setTab: (n: number) => void }) {
  return (
    <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', px: { xs: 2, md: 6 }, pt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Chip label="LIVE DEMO" size="small" sx={{ bgcolor: '#ef5350', color: '#fff', fontWeight: 800, fontSize: '0.7rem' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>ERP Migration — AWS Live Demo</Typography>
        <Chip label="SST v4 · Lambda · CloudFront" size="small" variant="outlined" sx={{ ml: 'auto', borderColor: 'rgba(255,255,255,0.2)', color: 'text.secondary', fontSize: '0.7rem' }} />
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { fontWeight: 700, fontSize: '0.85rem' } }}>
        <Tab label="🔀 Strangler Fig Router" />
        <Tab label="🧮 Multi-client Billing Rules" />
      </Tabs>
    </Box>
  )
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState(0)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header tab={tab} setTab={setTab} />
        <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 860, mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  )
}
