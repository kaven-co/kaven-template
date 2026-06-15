import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components'

interface TenantCreatedEmailProps {
  brandName?: string
  brandColor?: string
  userName?: string
  tenantName?: string
  actionUrl?: string
}

export const subject = ({ tenantName, brandName }: TenantCreatedEmailProps) =>
  `Your ${brandName ?? 'Kaven'} workspace "${tenantName}" is ready`

export default function TenantCreatedEmail({
  brandName = 'Kaven',
  brandColor = '#F59E0B',
  userName = 'there',
  tenantName = 'My Workspace',
  actionUrl = '#',
}: TenantCreatedEmailProps) {
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
            Your workspace is ready!
          </Heading>
          <Text style={{ color: '#374151' }}>
            Hey {userName}, <strong>{tenantName}</strong> is set up and ready to go on {brandName}.
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
            Open Workspace →
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
