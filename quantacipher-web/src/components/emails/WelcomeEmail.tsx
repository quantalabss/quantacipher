import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to QuantaCipher - Post-Quantum Security</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to QuantaCipher</Heading>
        <Text style={text}>Hi {name},</Text>
        <Text style={text}>
          Thank you for signing up. You now have access to the QuantaCipher API to secure your data with NIST-standardized Kyber-1024 encryption.
        </Text>
        
        <Section style={box}>
          <Text style={text}>
            <strong>Your next steps:</strong>
          </Text>
          <Text style={text}>1. Generate your first API key in the dashboard.</Text>
          <Text style={text}>2. Install the <Link href="https://npmjs.com/package/quantacipher-sdk" style={link}>quantacipher-sdk</Link>.</Text>
          <Text style={text}>3. Read the <Link href="https://quantacipher.com/docs" style={link}>Documentation</Link> to secure your first payload.</Text>
        </Section>

        <Text style={text}>
          If you have any questions, simply reply to this email or contact <strong>support@quantacipher.com</strong>.
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

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
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

export default WelcomeEmail;
