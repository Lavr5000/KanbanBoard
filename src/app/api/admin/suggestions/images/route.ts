import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user and check admin role using RPC
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin using RPC function
    const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin')

    if (roleError || !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all suggestions with screenshots
    const { data: suggestions, error: fetchError } = await supabase
      .from('suggestions')
      .select('id, screenshot_url')
      .not('screenshot_url', 'is', null)

    if (fetchError) throw fetchError

    if (!suggestions || suggestions.length === 0) {
      return NextResponse.json({ message: 'No images to delete', deleted: 0 })
    }

    // Extract file paths from signed URLs
    // Signed URLs format: .../storage/v1/object/sign/BUCKET_NAME/FILE_PATH?...
    const bucketName = 'suggestions-screenshots'
    const filesToDelete: string[] = []

    for (const suggestion of suggestions) {
      if (suggestion.screenshot_url) {
        try {
          const url = new URL(suggestion.screenshot_url)
          const pathParts = url.pathname.split('/')
          // Find the bucket name in the path
          const bucketIndex = pathParts.indexOf(bucketName)
          if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
            // Extract the file path (everything after bucket name, before query params)
            const filePath = pathParts.slice(bucketIndex + 1).join('/')
            // Remove any query parameters or signed URL tokens
            const cleanPath = filePath.split('?')[0]
            filesToDelete.push(cleanPath)
          }
        } catch (e) {
          console.error('Failed to parse URL:', suggestion.screenshot_url)
        }
      }
    }

    // Delete files from storage
    let deletedCount = 0
    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .storage
        .from(bucketName)
        .remove(filesToDelete)

      if (deleteError) {
        console.error('Storage delete error:', deleteError)
        // Continue to update database even if storage deletion fails
      } else {
        deletedCount = filesToDelete.length
      }
    }

    // Update database to remove screenshot URLs
    const { error: updateError } = await supabase
      .from('suggestions')
      .update({ screenshot_url: null })
      .not('screenshot_url', 'is', null)

    if (updateError) throw updateError

    return NextResponse.json({
      message: `Deleted ${deletedCount} images`,
      deleted: deletedCount
    })
  } catch (error) {
    console.error('Error deleting images:', error)
    return NextResponse.json(
      { error: 'Failed to delete images' },
      { status: 500 }
    )
  }
}
