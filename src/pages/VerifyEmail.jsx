import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { HiMail, HiRefresh, HiLogout, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import LoadingScreen from '../components/common/LoadingScreen'

export default function VerifyEmail() {
  const { user, loading, sendVerificationEmail, refreshUser, verifyEmailCode, logout } = useAuth()
  const [processing, setProcessing] = useState(false)
  const [resending, setResending] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const processedLink = useRef(false)

  useEffect(() => {
    if (processedLink.current) return
    const params = new URLSearchParams(location.search)
    const mode = params.get('mode')
    const oobCode = params.get('oobCode')
    if (mode !== 'verifyEmail') return
    processedLink.current = true
    if (!oobCode) {
      toast.error('Invalid verification link.')
      return
    }
    setProcessing(true)
    verifyEmailCode(oobCode)
      .then(() => {
        toast.success('Email verified successfully!')
        navigate('/dashboard', { replace: true })
      })
      .catch(() => toast.error('Verification failed. Please try the resend link.'))
      .finally(() => setProcessing(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.emailVerified) return <Navigate to="/dashboard" replace />

  const handleResend = async () => {
    setResending(true)
    try {
      await sendVerificationEmail()
      toast.success('Verification email sent! Check your inbox & spam folder.')
    } catch (error) {
      toast.error(error.message?.replace('Firebase: ', '') || 'Failed to send verification email')
    } finally {
      setResending(false)
    }
  }

  const handleContinue = async () => {
    setProcessing(true)
    try {
      const currentUser = await refreshUser()
      if (currentUser?.emailVerified) {
        toast.success('Email verified successfully!')
        navigate('/dashboard', { replace: true })
      } else {
        toast.error('Email not verified yet. Check your inbox & spam folder.')
      }
    } catch (error) {
      toast.error('Could not check verification status. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-2xl font-bold gradient-text">Rstate</span>
          </Link>
          <h1 className="text-2xl font-bold font-heading">Verify Your Email</h1>
          <p className="text-dark-500 mt-1">One last step to activate your account</p>
        </div>

        <div className="card p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
            <HiMail className="w-8 h-8 text-primary-600" />
          </div>

          <h3 className="font-semibold text-lg mb-2">Check your inbox</h3>
          <p className="text-dark-500 text-sm mb-6">
            We sent a verification link to <span className="font-medium text-dark-700 dark:text-dark-200">{user.email}</span>.
            Click the link in the email to verify your account.
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-left text-xs text-amber-700 dark:text-amber-400 mb-6">
            <div className="flex items-start gap-2">
              <HiExclamationCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Didn't receive it? Check your spam or junk folder, or resend the email below.</span>
            </div>
          </div>

          <button type="button" onClick={handleContinue} disabled={processing}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <HiCheckCircle className="w-5 h-5" />
            {processing ? 'Checking...' : "I've Verified My Email — Continue"}
          </button>

          <button type="button" onClick={handleResend} disabled={resending || processing}
            className="w-full mt-3 flex items-center justify-center gap-2 py-3 border-2 border-dark-200 dark:border-dark-700 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors font-medium">
            <HiRefresh className="w-5 h-5" />
            {resending ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <button type="button" onClick={handleLogout}
            className="mt-6 text-sm text-dark-500 hover:text-primary-600 flex items-center justify-center gap-1.5 w-full">
            <HiLogout className="w-4 h-4" /> Sign out and try a different account
          </button>
        </div>

        <p className="text-center mt-6 text-sm text-dark-500">
          Have questions? <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">Back to home</Link>
        </p>
      </div>
    </div>
  )
}