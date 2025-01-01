import { useEffect, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

interface Streak {
  currentStreak: number
  longestStreak: number
  lastLoginDate: string
}

interface DailyLogin {
  loginDate: string
  userId: string
}

const StreakCounter = () => {
  const [streak, setStreak] = useState<Streak | null>(null)
  const [recentLogins, setRecentLogins] = useState<DailyLogin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStreak = useCallback(async () => {
    try {
      const response = await fetch('/api/daily-login')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch streak')
      }

      setStreak(data.streak)
      
      // Filter out consecutive duplicate logins
      const uniqueLogins = (data.recentLogins || []).reduce((acc: DailyLogin[], current: DailyLogin) => {
        const lastLogin = acc[acc.length - 1]
        if (!lastLogin || lastLogin.loginDate !== current.loginDate) {
          acc.push(current)
        }
        return acc
      }, [])
      
      // Take only the two most recent unique logins
      setRecentLogins(uniqueLogins.slice(0, 2))
    } catch (err) {
      console.error('Streak fetch error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStreak = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/daily-login', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update streak')
      }

      await fetchStreak()
    } catch (err) {
      console.error('Streak update error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setLoading(false)
    }
  }

  useEffect(() => {
    updateStreak()
  }, [])

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 space-x-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Updating streak...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
        <h3 className="font-semibold mb-1">Error updating streak</h3>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100">
        <div className="space-y-3">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <span>🔥</span>
            <span>{streak?.currentStreak || 0} Day Streak</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Longest Streak</p>
              <p className="font-semibold">
                🏆 {streak?.longestStreak || 0} days
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Login</p>
              <p className="font-semibold">
                🕒 {streak?.lastLoginDate ? formatDateTime(streak.lastLoginDate) : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {recentLogins.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Recent Activity</h4>
          <div className="space-y-2">
            {recentLogins.map((login, index) => (
              <div key={index} className="flex justify-between items-center text-sm text-gray-600 p-2 bg-gray-50 rounded">
                <span>Login</span>
                <span>{formatDateTime(login.loginDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default StreakCounter