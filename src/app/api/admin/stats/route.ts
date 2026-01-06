import { NextResponse } from "next/server"

export async function GET() {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const stats = {
    users: {
      total: 12847,
      active: 11234,
      suspended: 89,
      blocked: 23,
      pending_verification: 1501,
      new_today: 234,
      new_this_week: 1456,
      growth_rate: 12.4
    },
    signups: {
      total_today: 234,
      total_week: 1456,
      by_method: {
        email: 156,
        oauth_google: 67,
        wallet: 11
      },
      by_account_type: {
        user: 198,
        developer: 28,
        enterprise: 8
      }
    },
    logins: {
      total_today: 4567,
      success_rate: 94.2,
      failed_attempts: 267,
      unique_users: 3892
    },
    security: {
      active_alerts: 12,
      critical_alerts: 3,
      suspicious_logins: 45,
      blocked_attempts: 89,
      geo_anomalies: 23
    },
    sessions: {
      active: 3421,
      average_duration_minutes: 47,
      peak_concurrent: 892
    },
    fraud_detection: {
      flagged_accounts: 34,
      auto_blocked: 12,
      under_review: 22
    }
  }

  return NextResponse.json(stats)
}
