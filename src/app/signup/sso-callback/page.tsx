import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SignUpSSOCallback() {
  // Handle the redirect flow for signup
  return <AuthenticateWithRedirectCallback />
}

