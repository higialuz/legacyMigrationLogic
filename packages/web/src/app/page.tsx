'use client'
import { useState } from 'react'
import ObservabilityDemo from '@/components/ObservabilityDemo'
import {
  Box, Typography, Chip, Tabs, Tab, Card, CardContent,
  Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Switch, FormControlLabel, CircularProgress, Divider, Alert,
  Grid2 as Grid,
} from '@mui/material'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

// ── Strangler Fig Demo ────────────────────────────────────────────────────────

function StranglerDemo() {
  const [featureFlag, setFeatureFlag] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const send = async (path: string) => {
    setLoading(true); setResult(null)
    try {
      const res = await fetch(`${API}strangler/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureFlag, requestPath: path }),
      })
      setResult(await res.json())
    } catch { setResult({ error: 'Connection failed' }) }
    finally { setLoading(false) }
  }

  const isModern = result?.source === 'MODERN'
  const isLegacy = result?.source === 'LEGACY'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Strangler Fig Router</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Toggle the feature flag to route requests between the legacy IIS system and the new Lambda service.
          In production, this flag would be set per-client — allowing gradual migration of 70+ clients independently.
        </Typography>
      </Box>

      {/* Architecture visual */}
      <Card elevation={0}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip label="Client Request" sx={{ bgcolor: 'rgba(79,195,247,0.15)', color: 'primary.main', fontWeight: 700 }} />
            </Box>
            <Typography sx={{ color: 'text.disabled' }}>→</Typography>
            <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, border: '2px solid', borderColor: 'primary.main', minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block' }}>Smart Router</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>CloudFront / Lambda</Typography>
            </Box>
            <Typography sx={{ color: 'text.disabled' }}>→</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: featureFlag ? 'rgba(255,255,255,0.1)' : '#ef5350', opacity: featureFlag ? 0.4 : 1 }}>
                <Typography variant="caption" sx={{ color: '#ef5350', fontWeight: 700, display: 'block' }}>Legacy IIS</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>VB.NET + SP</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: featureFlag ? '#66bb6a' : 'rgba(255,255,255,0.1)', opacity: featureFlag ? 1 : 0.4 }}>
                <Typography variant="caption" sx={{ color: '#66bb6a', fontWeight: 700, display: 'block' }}>New Lambda</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>Node.js + SST</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card elevation={0}>
        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormControlLabel
            control={<Switch checked={featureFlag} onChange={e => setFeatureFlag(e.target.checked)} color="success" />}
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Feature Flag: {featureFlag ? <Box component="span" sx={{ color: '#66bb6a' }}>ON — Route to new service</Box> : <Box component="span" sx={{ color: '#ef5350' }}>OFF — Route to legacy</Box>}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  In production: stored in client_config table per client
                </Typography>
              </Box>
            }
          />

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Send a request to a billing endpoint:</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {['/api/billing/batch', '/api/billing/invoice/1042', '/api/reports/monthly'].map(path => (
              <Button key={path} variant="outlined" size="small" onClick={() => send(path)} disabled={loading}
                sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                POST {path}
              </Button>
            ))}
          </Box>

          {loading && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={16} /><Typography variant="body2" sx={{ color: 'text.secondary' }}>Routing request…</Typography></Box>}
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card elevation={0} sx={{ borderColor: isModern ? '#66bb6a' : isLegacy ? '#ef5350' : 'rgba(255,255,255,0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Chip label={result.source ?? 'ERROR'} sx={{ fontWeight: 800, bgcolor: isModern ? '#66bb6a' : '#ef5350', color: '#000' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{result.system}</Typography>
              {result.response?.executionMs && (
                <Chip label={`${result.response.executionMs}ms`} size="small" variant="outlined"
                  sx={{ ml: 'auto', borderColor: isModern ? '#66bb6a' : '#ef5350', color: isModern ? '#66bb6a' : '#ef5350' }} />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: 'text.primary', mb: 1 }}>{result.response?.data}</Typography>
            {result.response?.traceId && <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace', display: 'block', mb: 1 }}>traceId: {result.response.traceId}</Typography>}
            {result.response?.warnings?.map((w: string) => <Typography key={w} variant="caption" sx={{ color: '#ffa726', display: 'block' }}>⚠ {w}</Typography>)}
            <Alert severity={isModern ? 'success' : 'warning'} sx={{ mt: 2, borderRadius: 2 }}>{result.note}</Alert>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

// ── Billing Rules Demo ────────────────────────────────────────────────────────

const CLIENTS = ['Client A', 'Client B', 'Client C', 'Client X', 'New Client']
const CLIENT_RULES: Record<string, string> = {
  'Client A': 'DefaultBillingRule — 10% flat',
  'Client B': 'ClientBBillingRule — tiered flat fee',
  'Client C': 'ParametricBillingRule — 8.5% from config',
  'Client X': 'ClientXBillingRule — 7.5% + R$50 surcharge',
  'New Client': 'DefaultBillingRule — fallback default',
}

function BillingDemo() {
  const [clientId, setClientId] = useState('Client A')
  const [amount, setAmount] = useState('5000')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const calculate = async () => {
    setLoading(true); setResult(null)
    try {
      const res = await fetch(`${API}billing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, amount: Number(amount) }),
      })
      setResult(await res.json())
    } catch { setResult({ error: 'Connection failed' }) }
    finally { setLoading(false) }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Multi-client Billing Rules</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Each client uses a different billing rule — resolved at runtime via a registry lookup.
          No <code>IF clientId == 'X'</code> in the code. Adding a new client requires zero changes to existing rules.
        </Typography>
      </Box>

      {/* Client registry */}
      <Card elevation={0}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 2, textTransform: 'uppercase', display: 'block', mb: 1.5 }}>Client → Rule Registry</Typography>
          <Grid container spacing={1}>
            {CLIENTS.map(c => (
              <Grid key={c} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1, bgcolor: clientId === c ? 'rgba(79,195,247,0.08)' : 'transparent', border: '1px solid', borderColor: clientId === c ? 'primary.main' : 'transparent' }}>
                  <Chip label={c} size="small" sx={{ fontWeight: 700, minWidth: 80 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{CLIENT_RULES[c]}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card elevation={0}>
        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Client</InputLabel>
                <Select value={clientId} label="Client" onChange={e => setClientId(e.target.value)}>
                  {CLIENTS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Invoice Amount (R$)" type="number"
                value={amount} onChange={e => setAmount(e.target.value)}
                inputProps={{ min: 0, step: 100 }} />
            </Grid>
          </Grid>
          <Button variant="contained" onClick={calculate} disabled={loading || !amount}
            sx={{ alignSelf: 'flex-start', fontWeight: 700 }}>
            {loading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
            Calculate Billing Fee
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {result && !result.error && (
        <Card elevation={0} sx={{ borderColor: 'secondary.main' }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {[
                { label: 'Invoice Amount', value: `R$ ${result.invoiceAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
                { label: 'Fee Charged', value: `R$ ${result.fee?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, highlight: true },
                { label: 'Rule Applied', value: result.ruleId },
                { label: 'Class', value: result.appliedClass },
              ].map(({ label, value, highlight }) => (
                <Grid key={label} size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>{label}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: highlight ? 'secondary.main' : 'text.primary', fontSize: highlight ? '1.4rem' : '1rem' }}>{value}</Typography>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.07)' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>{result.ruleDescription}</Typography>
          </CardContent>
        </Card>
      )}
      {result?.error && <Alert severity="error">{result.error}</Alert>}
    </Box>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [tab, setTab] = useState(0)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', px: { xs: 2, md: 6 }, pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
          <Chip label="LIVE ON AWS" size="small" sx={{ bgcolor: '#ef5350', color: '#fff', fontWeight: 800 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>ERP Migration — Live Demo</Typography>
          <Chip label="SST v4 · Lambda · CloudFront" size="small" variant="outlined"
            sx={{ ml: 'auto', borderColor: 'rgba(255,255,255,0.2)', color: 'text.secondary', fontSize: '0.7rem' }} />
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile
          sx={{ '& .MuiTab-root': { fontWeight: 700 } }}>
          <Tab label="🔀 Strangler Fig Router" />
          <Tab label="🧮 Multi-client Billing Rules" />
          <Tab label="🔍 Observability" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 860, mx: 'auto', mt: 2 }}>
        {tab === 0 && <StranglerDemo />}
        {tab === 1 && <BillingDemo />}
        {tab === 2 && <ObservabilityDemo />}
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', py: 3, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          Emerson Yaegashi · Senior Full Stack & AI Engineer ·{' '}
          <Box component="a" href="https://elmoluz.com" target="_blank" sx={{ color: 'primary.main', textDecoration: 'none' }}>
            ← Full Migration Showcase (Q1–Q8 + Bonus)
          </Box>
        </Typography>
      </Box>
    </Box>
  )
}
