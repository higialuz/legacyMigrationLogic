'use client'
import { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, Chip, Card, CardContent,
  Button, CircularProgress, ToggleButton, ToggleButtonGroup, Divider,
} from '@mui/material'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

const SCENARIOS = [
  { id: 'batch_missing', label: 'Config Error', color: '#ef5350', desc: 'Batch fails — threshold missing from config table' },
  { id: 'success',       label: 'Success',      color: '#66bb6a', desc: 'All invoices processed — clean audit trail' },
  { id: 'rule_error',    label: 'Rule Error',   color: '#ffa726', desc: 'Partial failure — invoice with R$0.00 hits rule edge case' },
]

const LEVEL_COLOR: Record<string, string> = {
  INFO: '#4fc3f7', WARN: '#ffa726', ERROR: '#ef5350', OK: '#66bb6a', AUDIT: '#ce93d8',
}

type LogLine = { ms: number; level: string; msg: string }
type Result = {
  traceId: string; timestamp: string; userId: string; clientId: string
  result: string; errorCode: string | null; errorMessage: string | null
  classification: string | null; supportCanInvestigate: boolean
  logs: LogLine[]
}

export default function ObservabilityDemo() {
  const [scenario, setScenario] = useState('batch_missing')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [visibleLines, setVisibleLines] = useState<LogLine[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  const run = async () => {
    setLoading(true); setResult(null); setVisibleLines([])
    try {
      const res = await fetch(`${API}audit/trace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: 'Client B', scenario }),
      })
      const data: Result = await res.json()
      setResult(data)
      // Stream log lines in with per-line delay
      data.logs.forEach((line, i) => {
        setTimeout(() => {
          setVisibleLines(prev => [...prev, line])
          if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
        }, i * 320)
      })
    } catch { setResult(null) }
    finally { setLoading(false) }
  }

  const sel = SCENARIOS.find(s => s.id === scenario)!
  const done = result && visibleLines.length === result.logs.length

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Observability — Live Audit Log</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Every billing batch run emits a structured trace: <code>traceId</code>, <code>clientId</code>, <code>userId</code>,
          rule applied, error classification, and whether support can investigate without a developer.
          Pick a scenario and watch the log stream in real time.
        </Typography>
      </Box>

      {/* Scenario selector */}
      <Card elevation={0}>
        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 2, textTransform: 'uppercase' }}>
            Scenario
          </Typography>
          <ToggleButtonGroup value={scenario} exclusive onChange={(_, v) => v && setScenario(v)} size="small">
            {SCENARIOS.map(s => (
              <ToggleButton key={s.id} value={s.id}
                sx={{ fontWeight: 700, borderColor: 'rgba(255,255,255,0.1)',
                  '&.Mui-selected': { borderColor: s.color, color: s.color, background: `${s.color}15` } }}>
                {s.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{sel.desc}</Typography>
          <Button variant="contained" onClick={run} disabled={loading} sx={{ alignSelf: 'flex-start', fontWeight: 700 }}>
            {loading ? <><CircularProgress size={16} sx={{ mr: 1 }} />Running batch…</> : '▶ Run Billing Batch'}
          </Button>
        </CardContent>
      </Card>

      {/* Live log stream */}
      {(loading || visibleLines.length > 0) && (
        <Card elevation={0} sx={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: done ? '#66bb6a' : '#ffa726',
              animation: done ? 'none' : 'pulse 1s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
              {done ? 'stream complete' : 'streaming…'}
            </Typography>
            {result && <Chip label={`trace:${result.traceId}`} size="small" sx={{ ml: 'auto', fontFamily: 'monospace', fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.05)' }} />}
          </Box>
          <Box ref={logRef} sx={{ p: 2, fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: 1.8, maxHeight: 280, overflowY: 'auto', bgcolor: '#0d1117' }}>
            {visibleLines.map((line, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'baseline' }}>
                <Typography component="span" sx={{ color: 'text.disabled', fontFamily: 'monospace', fontSize: '0.72rem', minWidth: 52 }}>
                  +{line.ms}ms
                </Typography>
                <Typography component="span" sx={{ color: LEVEL_COLOR[line.level] ?? '#fff', fontFamily: 'monospace', fontSize: '0.72rem', minWidth: 44, fontWeight: 700 }}>
                  {line.level}
                </Typography>
                <Typography component="span" sx={{ color: '#e6edf3', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                  {line.msg}
                </Typography>
              </Box>
            ))}
            {!done && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Box sx={{ width: 6, height: 12, bgcolor: '#4fc3f7', animation: 'blink 1s step-start infinite', '@keyframes blink': { '50%': { opacity: 0 } } }} />
            </Box>}
          </Box>
        </Card>
      )}

      {/* Support dashboard card */}
      {done && result && (
        <Card elevation={0} sx={{ borderColor: sel.color, border: '1px solid' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 2, textTransform: 'uppercase', display: 'block', mb: 2 }}>
              Support Dashboard — Audit Entry
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2, mb: 2 }}>
              {[
                { label: 'Result', value: result.result, color: sel.color },
                { label: 'Error Code', value: result.errorCode ?? '—' },
                { label: 'User', value: result.userId, mono: true },
                { label: 'Client', value: result.clientId },
                { label: 'Classification', value: result.classification ?? 'N/A' },
                { label: 'Timestamp', value: new Date(result.timestamp).toLocaleTimeString(), mono: true },
              ].map(({ label, value, color, mono }) => (
                <Box key={label}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>{label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: color ?? 'text.primary', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</Typography>
                </Box>
              ))}
            </Box>
            {result.errorMessage && (
              <Box sx={{ p: 1.5, bgcolor: 'rgba(239,83,80,0.08)', borderRadius: 1, borderLeft: '3px solid #ef5350', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#ef5350', fontFamily: 'monospace' }}>{result.errorMessage}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.07)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={result.supportCanInvestigate ? '✓ Support can investigate' : '✗ Developer required'}
                size="small"
                sx={{ fontWeight: 700, bgcolor: result.supportCanInvestigate ? '#66bb6a20' : '#ef535020',
                  color: result.supportCanInvestigate ? '#66bb6a' : '#ef5350', border: '1px solid',
                  borderColor: result.supportCanInvestigate ? '#66bb6a' : '#ef5350' }}
              />
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {result.supportCanInvestigate
                  ? 'traceId links all related log events — no code access needed'
                  : 'Technical error — requires Lambda logs + dev investigation'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
