/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'erp-live',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: { aws: { region: 'us-east-1' } },
    }
  },
  async run() {
    const api = new sst.aws.Function('ErpApi', {
      handler: 'packages/functions/src/handler.handler',
      url: { cors: false },
      runtime: 'nodejs22.x',
    })

    const web = new sst.aws.Nextjs('ErpWeb', {
      path: 'packages/web',
      environment: {
        NEXT_PUBLIC_API_URL: api.url,
      },
    })

    return {
      api: api.url,
      web: web.url,
    }
  },
})
