import { useEffect, useState } from 'react'

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

  const updateStreak = async () => {
    try {
      const response = await fetch('/api/daily-login', {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        
        // Specific handling for new user signup error
        if (response.status === 500 && errorData.error === 'New user') {
          // Initialize streak for new user
          setStreak({
            currentStreak: 1,
            longestStreak: 1,
            lastLoginDate: new Date().toISOString()
          })
          setLoading(false)
          return
        }
        
        throw new Error(errorData.error || 'Failed to update streak')
      }
      
      const data = await response.json()
      if (data.streak) {
        setStreak(data.streak)
      }
      
      // Refresh the data to get updated logins
      await fetchStreak()
    } catch (err) {
      console.error('Error updating streak:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setLoading(false)
    }
  }

  const fetchStreak = async () => {
    try {
      const response = await fetch('/api/daily-login')
      
      if (!response.ok) {
        const errorData = await response.json()
        
        // Specific handling for new user signup error
        if (response.status === 500 && errorData.error === 'New user') {
          // Initialize streak for new user
          setStreak({
            currentStreak: 1,
            longestStreak: 1,
            lastLoginDate: new Date().toISOString()
          })
          setLoading(false)
          return
        }
        
        throw new Error(errorData.error || 'Failed to fetch streak')
      }
      
      const data = await response.json()

      if (data.streak) {
        setStreak(data.streak)
        setRecentLogins(data.recentLogins || [])
      } else {
        // If no streak exists yet, automatically create one
        await updateStreak()
      }
    } catch (err) {
      console.error('Streak fetch error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Automatically log the login when the component mounts
    fetchStreak()
  }, [])

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (loading) return <div className="text-center p-4">Logging in...</div>
  
  if (error) return (
    <div className="p-4 bg-red-100 text-red-800 rounded-lg">
      <h3 className="font-bold">Login Error</h3>
      <p>{error}</p>
    </div>
  )

  return (
    <div className="p-4 rounded-lg bg-gray-50">
      <h3 className="text-xl font-bold mb-2">
        🔥 Current Streak: {streak ? streak.currentStreak : 'No streak yet'}
      </h3>
      <p className="text-gray-600">
        🏆 Longest Streak: {streak?.longestStreak}
      </p>
      <p className="text-gray-600">
        🕒 Last Login: {streak?.lastLoginDate ? formatDateTime(streak.lastLoginDate) : 'Never'}
      </p>
    </div>
  )
}

export default StreakCounter