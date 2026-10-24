import { notFound } from 'next/navigation'

// Dev only: throws so you can see the error page at /error-preview
export default function ErrorPreview() {
	if (process.env.NODE_ENV === 'production') notFound()
	throw new Error('Previewing the error page')
}
