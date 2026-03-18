import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const UPLOAD_BUCKET = 'suggestions-screenshots'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const category = formData.get('category') as string
    const content = formData.get('content') as string
    const screenshot = formData.get('screenshot') as File | null

    if (!category || !content) {
      return NextResponse.json({ error: 'Missing category or content' }, { status: 400 })
    }

    let screenshotUrl: string | null = null

    if (screenshot) {
      const fileExt = screenshot.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from(UPLOAD_BUCKET)
        .upload(fileName, screenshot)

      if (uploadError) {
        console.error('Screenshot upload failed:', uploadError)
      } else {
        const { data } = await supabase.storage
          .from(UPLOAD_BUCKET)
          .createSignedUrl(fileName, 60 * 60 * 24 * 7)

        if (data?.signedUrl) {
          screenshotUrl = data.signedUrl
        }
      }
    }

    const { error } = await supabase.from('suggestions').insert({
      user_id: user.id,
      user_email: user.email,
      category,
      content,
      screenshot_url: screenshotUrl,
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to submit feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
