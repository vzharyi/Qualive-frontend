import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/store/auth.store'
import { api } from '@/api/axios-instance'
import type { User } from '@/features/auth/types/auth.types'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function OAuthCallbackPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { setAuth } = useAuth()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const token = searchParams.get('token')

        if (!token) {
            setError('Authorization failed: token not found.')
            setTimeout(() => navigate('/login'), 3000)
            return
        }

        const authenticateUser = async () => {
            try {
                // Temporarily set the token in localStorage so axios interceptor can pick it up
                localStorage.setItem('accessToken', token)

                // Request user data from the backend
                const response = await api.get<User>('/users/me')

                // Save the full state (both token and user)
                setAuth(token, response.data)

                // Redirect to the application
                navigate('/dashboard')
            } catch (err) {
                console.error('Error:', err)
                setError('Failed to load user profile. Please try again.')
                localStorage.removeItem('accessToken')
                setTimeout(() => navigate('/login'), 3000)
            }
        }

        authenticateUser()
    }, [searchParams, navigate, setAuth])

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#070710]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
            >
                {error ? (
                    <div className="px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] text-sm text-red-400 text-center">
                        <p>{error}</p>
                        <p className="mt-1 opacity-70 text-xs">Redirecting to login...</p>
                    </div>
                ) : (
                    <>
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        <h2 className="text-zinc-300 font-medium tracking-wide">
                            Completing authorization...
                        </h2>
                    </>
                )}
            </motion.div>
        </div>
    )
}
