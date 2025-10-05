import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function LoginSSOCallback() {
  // Handle the redirect flow for login
  return <AuthenticateWithRedirectCallback />
}

