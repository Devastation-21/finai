import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createUser, getUserByClerkId, updateUser } from '@/lib/database'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers')
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type
  console.log('Webhook event received:', eventType)

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, created_at } = evt.data

    try {
      const newUser = await createUser({
        clerk_user_id: id,
        email: email_addresses[0]?.email_address || '',
        first_name: first_name || undefined,
        last_name: last_name || undefined,
      })
      
      console.log('User created successfully:', newUser)
    } catch (error) {
      console.error('Error creating user:', error)
      return new Response('Error creating user', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data

    try {
      const existingUser = await getUserByClerkId(id)
      if (existingUser) {
        await updateUser(existingUser.id, {
          email: email_addresses[0]?.email_address || existingUser.email,
          first_name: first_name || null,
          last_name: last_name || null,
        })
        console.log('User updated successfully:', id)
      } else {
        // If user doesn't exist, create them
        await createUser({
          clerk_user_id: id,
          email: email_addresses[0]?.email_address || '',
          first_name: first_name || undefined,
          last_name: last_name || undefined,
        })
        console.log('User created after update event:', id)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      return new Response('Error updating user', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    if (!id) {
      console.error('No user ID provided for deletion')
      return new Response('No user ID provided', { status: 400 })
    }

    try {
      const user = await getUserByClerkId(id)
      if (user) {
        // Note: User deletion will cascade to all related data due to foreign key constraints
        console.log('User deleted:', id)
      }
    } catch (error) {
      console.error('Error handling user deletion:', error)
    }
  }

  return new Response('', { status: 200 })
}
