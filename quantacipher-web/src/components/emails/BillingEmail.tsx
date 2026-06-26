import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Hr,
} from '@react-email/components';

interface BillingEmailProps {
  name: string;
  planName: string;
}

export const BillingEmail = ({ name, planName }: BillingEmailProps) => (
  <Html>
    <Head />
    <Preview>Your QuantaCipher plan has been upgraded</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Plan Upgraded Successfully</Heading>
        <Text style={text}>Hi {name},</Text>
        <Text style={text}>
          Thank you for your purchase. Your QuantaCipher account has been successfully upgraded to the <strong>{planName.toUpperCase()}</strong> plan.
        </Text>
        
        <Section style={box}>
          <Text style={text}>
            Your increased API limits and enhanced features are now active. You can view your current usage at any time in the dashboard.
          </Text>
        </Section>

        <Text style={text}>
          If you have any questions about billing or your new limits, please contact <strong>support@quantacipher.com</strong>.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          QuantaCipher • Zero-Trust Post-Quantum Security
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#111111',
  margin: '40px auto',
  padding: '40px',
  borderRadius: '8px',
  border: '1px solid #333',
  maxWidth: '600px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const text = {
  color: '#cccccc',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const box = {
  padding: '24px',
  backgroundColor: '#1a1a1a',
  borderRadius: '4px',
  border: '1px solid #333',
  margin: '24px 0',
};

const hr = {
  borderColor: '#333',
  margin: '32px 0 24px',
};

const footer = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '24px',
};

export default BillingEmail;
