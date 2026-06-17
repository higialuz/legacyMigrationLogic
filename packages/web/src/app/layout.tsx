import type { Metadata } from 'next'
import ThemeRegistry from '@/components/ThemeRegistry'

export const metadata: Metadata = {
  title: 'ERP Migration — Live AWS Demo',
  description: 'Live demo: Strangler Fig routing + multi-client billing rules on AWS Lambda + CloudFront',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}
