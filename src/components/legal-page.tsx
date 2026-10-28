import Link from 'next/link'

export const CONTACT_EMAIL = 'tweeres04@gmail.com'

// Shared layout for the privacy policy and terms
export function LegalPage({
	title,
	updated,
	children,
}: {
	title: string
	updated: string
	children: React.ReactNode
}) {
	return (
		<main className="mx-auto max-w-md space-y-4 px-4 pt-6 pb-20 [&_a]:underline [&_h2]:pt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
			<Link href="/">Back to the game</Link>
			<h1 className="text-3xl font-semibold">{title}</h1>
			<p className="text-sm text-muted-foreground">Last updated {updated}</p>
			{children}
		</main>
	)
}

export function ContactLink() {
	return <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
}
