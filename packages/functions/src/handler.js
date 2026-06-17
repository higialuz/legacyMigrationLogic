// ── Billing Rules — Strategy Pattern ─────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

class BillingRule {
  ruleId() { return 'BASE' }
  calculate(_amount) { throw new Error('Not implemented') }
  describe() { return '' }
}

class DefaultBillingRule extends BillingRule {
  ruleId() { return 'DEFAULT' }
  calculate(amount) { return +(amount * 0.10).toFixed(2) }
  describe() { return '10% flat rate — standard for all clients' }
}

class ClientBBillingRule extends BillingRule {
  ruleId() { return 'CLIENT_B' }
  calculate(amount) { return amount > 10000 ? 800 : +(amount * 0.09).toFixed(2) }
  describe() { return 'Flat R$800 above R$10,000 threshold; 9% below' }
}

class ClientXBillingRule extends BillingRule {
  ruleId() { return 'CLIENT_X' }
  calculate(amount) { return +(amount * 0.075 + 50).toFixed(2) }
  describe() { return '7.5% + R$50 fixed surcharge — legacy exception' }
}

class ParametricBillingRule extends BillingRule {
  constructor(rate) { super(); this._rate = rate }
  ruleId() { return 'PARAMETRIC' }
  calculate(amount) { return +(amount * this._rate).toFixed(2) }
  describe() { return `Parametric ${(this._rate * 100).toFixed(1)}% rate from client config table` }
}

// Client → rule config (in production this comes from client_config DB table)
const CLIENT_RULES = {
  'Client A': () => new DefaultBillingRule(),
  'Client B': () => new ClientBBillingRule(),
  'Client C': () => new ParametricBillingRule(0.085),
  'Client X': () => new ClientXBillingRule(),
  'New Client': () => new DefaultBillingRule(),
}

// ── Strangler Fig mock ────────────────────────────────────────────────────────

function legacyResponse(path) {
  return {
    source: 'LEGACY',
    system: 'VB.NET WebForms / IIS',
    path,
    response: {
      status: 'OK',
      data: 'Billing batch processed via stored procedure sp_ProcessBillingBatch',
      executionMs: Math.floor(Math.random() * 800) + 400,
      warnings: ['No structured logging', 'Result stored in tbl_billing_results_legacy'],
    },
    note: 'This request was routed to the legacy IIS server — feature flag = OFF',
  }
}

function modernResponse(path) {
  return {
    source: 'MODERN',
    system: 'Node.js Lambda / CloudFront',
    path,
    response: {
      status: 'OK',
      data: 'Billing batch processed via BillingService.processBatch()',
      executionMs: Math.floor(Math.random() * 80) + 20,
      traceId: crypto.randomUUID(),
      structured: true,
    },
    note: 'This request was routed to the new Lambda service — feature flag = ON',
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  const method = event.requestContext?.http?.method ?? event.httpMethod ?? 'GET'
  const path = event.rawPath ?? event.path ?? '/'

  if (method === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' }

  // POST /billing/calculate
  if (method === 'POST' && path.includes('/billing/calculate')) {
    const body = JSON.parse(event.body ?? '{}')
    const { clientId, amount } = body

    if (!clientId || !amount) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'clientId and amount required' }) }
    }

    const factory = CLIENT_RULES[clientId] ?? CLIENT_RULES['New Client']
    const rule = factory()
    const fee = rule.calculate(Number(amount))

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        invoiceAmount: Number(amount),
        fee,
        ruleId: rule.ruleId(),
        ruleDescription: rule.describe(),
        appliedClass: rule.constructor.name,
        timestamp: new Date().toISOString(),
      }),
    }
  }

  // POST /strangler/route
  if (method === 'POST' && path.includes('/strangler/route')) {
    const body = JSON.parse(event.body ?? '{}')
    const { featureFlag, requestPath } = body
    const result = featureFlag ? modernResponse(requestPath) : legacyResponse(requestPath)
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    }
  }

  // POST /audit/trace
  if (method === 'POST' && path.includes('/audit/trace')) {
    const body = JSON.parse(event.body ?? '{}')
    const { clientId = 'Client B', scenario = 'batch_missing' } = body

    const traceId = crypto.randomUUID().slice(0, 8)
    const now = Date.now()
    const userId = `usr_${Math.floor(Math.random() * 9000) + 1000}`

    const scenarios = {
      batch_missing: {
        action: 'BILLING_BATCH_RUN',
        ruleId: 'CLIENT_B',
        invoiceCount: 47,
        result: 'FAILED',
        errorCode: 'CONFIG_ERROR',
        errorMessage: 'client_config.threshold not found — rule fallback blocked by strict mode',
        classification: 'CONFIG',
        supportCanInvestigate: true,
        logs: [
          { ms: 0,   level: 'INFO',  msg: `Request received — POST /billing/batch` },
          { ms: 2,   level: 'INFO',  msg: `[client:${clientId}] Rule resolved → ClientBBillingRule` },
          { ms: 5,   level: 'INFO',  msg: `[rule:CLIENT_B] Loading threshold from client_config table` },
          { ms: 89,  level: 'WARN',  msg: `[rule:CLIENT_B] client_config.threshold = NULL — strict mode active` },
          { ms: 91,  level: 'ERROR', msg: `[rule:CLIENT_B] Cannot apply rule without threshold — batch aborted` },
          { ms: 93,  level: 'AUDIT', msg: `[audit] Entry written — userId:${userId}, clientId:${clientId}, ruleId:CLIENT_B, result:FAILED, errorCode:CONFIG_ERROR` },
          { ms: 95,  level: 'INFO',  msg: `[trace:${traceId}] Completed in 95ms — classification: CONFIG_ERROR` },
        ],
      },
      success: {
        action: 'BILLING_BATCH_RUN',
        ruleId: 'CLIENT_B',
        invoiceCount: 47,
        result: 'SUCCESS',
        errorCode: null,
        errorMessage: null,
        classification: null,
        supportCanInvestigate: false,
        logs: [
          { ms: 0,   level: 'INFO',  msg: `Request received — POST /billing/batch` },
          { ms: 2,   level: 'INFO',  msg: `[client:${clientId}] Rule resolved → ClientBBillingRule` },
          { ms: 4,   level: 'INFO',  msg: `[rule:CLIENT_B] Amount R$15,000 → threshold exceeded → flat fee R$800` },
          { ms: 88,  level: 'INFO',  msg: `[integration] Emitting event to billing.processed queue` },
          { ms: 91,  level: 'INFO',  msg: `[audit] Entry written — userId:${userId}, clientId:${clientId}, ruleId:CLIENT_B` },
          { ms: 93,  level: 'OK',    msg: `[trace:${traceId}] Completed in 93ms — classification: BUSINESS_RULE` },
        ],
      },
      rule_error: {
        action: 'BILLING_BATCH_RUN',
        ruleId: 'CLIENT_X',
        invoiceCount: 12,
        result: 'PARTIAL',
        errorCode: 'RULE_ERROR',
        errorMessage: 'Surcharge formula returned negative value for invoice #8841 — amount R$0.00',
        classification: 'BUSINESS_RULE',
        supportCanInvestigate: true,
        logs: [
          { ms: 0,   level: 'INFO',  msg: `Request received — POST /billing/batch` },
          { ms: 2,   level: 'INFO',  msg: `[client:${clientId}] Rule resolved → ClientXBillingRule` },
          { ms: 5,   level: 'INFO',  msg: `[rule:CLIENT_X] Processing 12 invoices` },
          { ms: 44,  level: 'WARN',  msg: `[rule:CLIENT_X] Invoice #8841 — amount R$0.00 yields negative surcharge` },
          { ms: 46,  level: 'ERROR', msg: `[rule:CLIENT_X] Skipping invoice #8841 — RULE_ERROR logged` },
          { ms: 89,  level: 'INFO',  msg: `[rule:CLIENT_X] 11/12 invoices processed successfully` },
          { ms: 91,  level: 'AUDIT', msg: `[audit] Entry written — userId:${userId}, clientId:${clientId}, ruleId:CLIENT_X, result:PARTIAL, errorCode:RULE_ERROR` },
          { ms: 94,  level: 'INFO',  msg: `[trace:${traceId}] Completed in 94ms — classification: BUSINESS_RULE` },
        ],
      },
    }

    const s = scenarios[scenario] ?? scenarios.batch_missing
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        traceId,
        timestamp: new Date(now).toISOString(),
        userId,
        clientId,
        scenario,
        ...s,
      }),
    }
  }

  return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Not found' }) }
}
