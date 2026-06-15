import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components'

interface PasswordResetEmailProps {
  brandName?: string
  brandColor?: string
  userName?: string
  actionUrl?: string
}

export const subject = ({ brandName }: PasswordResetEmailProps) =>
  `Reset your ${brandName ?? 'Kaven'} password`

export default function PasswordResetEmail({
  brandName = 'Kaven',
  brandColor = '#F59E0B',
  userName = 'there',
  actionUrl = '#',
}: PasswordResetEmailProps) {
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
          <Heading style={{ fontSize: '24px', marginBottom: '8px' }}>
            Reset your password
          </Heading>
          <Text style={{ color: '#374151' }}>
            Hi {userName}, click below to reset your {brandName} password. This link expires in 1
            hour.
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
            Reset Password
          </Button>
          <Text style={{ color: '#9ca3af', fontSize: '12px', marginTop: '24px' }}>
            If you didn't request this, ignore this email. Your password won't change.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
