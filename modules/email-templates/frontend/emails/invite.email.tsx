import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components'

interface InviteEmailProps {
  brandName?: string
  brandColor?: string
  inviterName?: string
  tenantName?: string
  actionUrl?: string
}

export const subject = ({ inviterName, tenantName }: InviteEmailProps) =>
  `${inviterName ?? 'Someone'} invited you to ${tenantName ?? 'a workspace'}`

export default function InviteEmail({
  brandName = 'Kaven',
  brandColor = '#F59E0B',
  inviterName = 'A team member',
  tenantName = 'a workspace',
  actionUrl = '#',
}: InviteEmailProps) {
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
            {inviterName} invited you
          </Heading>
          <Text style={{ color: '#374151' }}>
            You've been invited to join <strong>{tenantName}</strong> on {brandName}.
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
            Accept Invitation
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
