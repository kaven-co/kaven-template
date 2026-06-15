import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components'

interface WelcomeEmailProps {
  brandName?: string
  brandColor?: string
  userName?: string
  actionUrl?: string
}

export const subject = ({ brandName }: WelcomeEmailProps) =>
  `Welcome to ${brandName ?? 'Kaven'}!`

export default function WelcomeEmail({
  brandName = 'Kaven',
  brandColor = '#F59E0B',
  userName = 'there',
  actionUrl = '#',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
        <Container
          style={{
            maxWidth: '560px',
            margin: '40px auto',
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '40px',
          }}
        >
          <Heading style={{ color: brandColor, fontSize: '24px', marginBottom: '8px' }}>
            Welcome to {brandName}!
          </Heading>
          <Text style={{ color: '#374151', fontSize: '16px' }}>
            Hey {userName}, you're in. Let's get you set up.
          </Text>
          <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
          <Button
            href={actionUrl}
            style={{
              backgroundColor: brandColor,
              color: '#fff',
              borderRadius: '6px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Get Started →
          </Button>
          <Text style={{ color: '#9ca3af', fontSize: '12px', marginTop: '32px' }}>
            You received this email because you created an account on {brandName}.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
