import { NextResponse } from 'next/server'
import { supabaseServiceClient } from '@/db/config/server'
import { JOB_APPLICATIONS_BUCKET_NAME } from '@/constants'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const job_title = formData.get('job_title') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const resume = formData.get('resume') as File
    const github_link = formData.get('github_link') as string
    const interest_notes = formData.get('interest_notes') as string
    const availability_notes = formData.get('availability_notes') as string

    if (!job_title || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: job_title, name, and email are required.' },
        { status: 400 }
      )
    }

    if (!resume) {
      return NextResponse.json({ error: 'Resume file is required.' }, { status: 400 })
    }

    const fileExtension = resume.name.split('.').pop()
    const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const safeJobTitle = job_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const newFileName = `resumes/${safeJobTitle}-${safeName}-${Date.now()}.${fileExtension}`

    const { data: fileData, error: fileError } = await supabaseServiceClient.storage
      .from(JOB_APPLICATIONS_BUCKET_NAME)
      .upload(newFileName, resume)

    if (fileError) {
      console.error('Supabase storage error:', fileError)
      throw new Error(`Failed to upload resume: ${fileError.message}`)
    }

    const { data, error } = await supabaseServiceClient
      .from('ss_job_applications')
      .insert([
        {
          job_title,
          name,
          email,
          github_link,
          interest_notes,
          availability_notes,
          resume_file_path: fileData.path,
        },
      ])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      // Attempt to delete the file if DB insert fails
      await supabaseServiceClient.storage.from('job-applications').remove([fileData.path])
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data }, { status: 200 })
  } catch (err) {
    console.error('API route error:', err)
    let errorMessage = 'An unknown error occurred'
    if (err instanceof Error) {
      errorMessage = err.message
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
