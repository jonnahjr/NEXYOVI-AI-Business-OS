import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Landing from '@/components/Landing'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  // Try to get the user session
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main>
      <Landing user={user} />
    </main>
  )
}
