import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components'

interface PaymentFailedEmailProps {
  brandName?: string
  brandColor?: string
  userName?: string
  amount?: string
  actionUrl?: string
}

export const subject = ({ brandName }: PaymentFailedEmailProps) =>
  `Action required: payment failed on ${brandName ?? 'Kaven'}`

export default function PaymentFailedEmail({
  brandName = 'Kaven',
  brandColor = '#F59E0B',
  userName = 'there',
  amount = '',
  actionUrl = '#',
}: PaymentFailedEmailProps) {
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
          <Heading style={{ fontSize: '24px', color: '#ef4444', marginBottom: '8px' }}>
            Payment failed
          </Heading>
          <Text style={{ color: '#374151' }}>
            Hi {userName}, we couldn't process your {amount ? `${amount} ` : ''}payment for{' '}
            {brandName}. Please update your payment method to keep your account active.
          </Text>
          <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
          <Button
            href={actionUrl}
            style={{
              backgroundColor: '#ef4444',
              color: '#fff',
              borderRadius: '6px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Update Payment Method
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
