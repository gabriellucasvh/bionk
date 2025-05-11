import { Html, Head, Preview, Body, Container, Section, Heading, Text, Hr, Link, Img } from '@react-email/components';
import * as React from 'react';

interface OtpEmailProps {
  otp: string;
  expiryMinutes?: number;
}

const baseUrl = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}` : 'https://bionk.me';
const logoUrl = `${baseUrl}/bionk-logo.svg`; 

export const OtpEmail: React.FC<Readonly<OtpEmailProps>> = ({
  otp,
  expiryMinutes = 20,
}) => (
  <Html lang="pt-BR">
    <Head />
    <Preview>Seu código de verificação Bionk</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Img src={logoUrl} width="120" height="auto" alt="Bionk Logo" />
        </Section>
        <Heading style={heading}>Seu Código de Verificação</Heading>
        <Text style={paragraph}>
          Olá,
        </Text>
        <Text style={paragraph}>
          Obrigado por se registrar no Bionk. Use o código abaixo para verificar seu endereço de e-mail e concluir seu cadastro:
        </Text>
        <Section style={otpContainer}>
          <Text style={otpText}>{otp}</Text>
        </Section>
        <Text style={paragraph}>
          Este código de verificação é válido por {expiryMinutes} minutos. Se você não solicitou este código, pode ignorar este e-mail com segurança.
        </Text>
        <Hr style={hr} />
        <Text style={footerText}>
          Bionk - Conectando suas ideias.
        </Text>
        <Text style={footerLinkContainer}>
          <Link href={baseUrl} style={footerLink}>Visite nosso site</Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OtpEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px',
  border: '1px solid #dfe1e6',
  borderRadius: '8px',
  maxWidth: '465px',
};

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const heading = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '15px',
};

const otpContainer = {
  background: '#f0f0f0',
  borderRadius: '4px',
  margin: '20px 0',
  padding: '10px',
  textAlign: 'center' as const,
};

const otpText = {
  color: '#0a0a0a',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  letterSpacing: '2px',
};

const hr = {
  borderColor: '#dfe1e6',
  margin: '20px 0',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};

const footerLinkContainer = {
  textAlign: 'center' as const,
  marginTop: '10px',
};

const footerLink = {
  color: '#007bff',
  textDecoration: 'none',
  fontSize: '12px',
};