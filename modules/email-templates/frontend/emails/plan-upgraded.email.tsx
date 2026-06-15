import { Html, Head, Body, Container, Heading, Text, Hr } from '@react-email/components'

interface PlanUpgradedEmailProps {
  brandName?: string
  brandColor?: string
  userName?: string
  planName?: string
}

export const subject = ({ planName }: PlanUpgradedEmailProps) =>
  `You're now on the ${planName ?? 'new'} plan!`

export default function PlanUpgradedEmail({
  brandName = 'Kaven',
  brandColor = '#F59E0B',
  userName = 'there',
  planName = 'Builder',
}: PlanUpgradedEmailProps) {
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
            You're on {planName}!
          </Heading>
          <Text style={{ color: '#374151' }}>
            Hey {userName}, your {brandName} plan has been upgraded to <strong>{planName}</strong>.
            New modules and features are now available.
          </Text>
          <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
          <Text style={{ color: '#6b7280', fontSize: '14px' }}>
            Questions? Reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
