// src/emails/change-email-verification-email.tsx
import * as React from 'react';
import { Html } from '@react-email/html';
import { Button } from '@react-email/button';
import { Heading } from '@react-email/heading';
import { Text } from '@react-email/text';
import { Container } from '@react-email/container';
import { Section } from '@react-email/section';

interface ChangeEmailVerificationEmailProps {
  username: string;
  verificationUrl: string;
}

export default function ChangeEmailVerificationEmail({
  username,
  verificationUrl,
}: ChangeEmailVerificationEmailProps): JSX.Element {
  return (
    <Html lang="pt-BR">
      <Section style={main}>
        <Container style={container}>
          <Heading style={heading}>Confirme seu Novo Endereço de E-mail</Heading>
          <Text style={paragraph}>Olá {username},</Text>
          <Text style={paragraph}>
            Recebemos uma solicitação para alterar o endereço de e-mail associado à sua conta Bionk.
            Para confirmar esta alteração e começar a usar seu novo e-mail, por favor, clique no botão abaixo:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              Confirmar Novo E-mail
            </Button>
          </Section>
          <Text style={paragraph}>
            Se você não solicitou esta alteração, pode ignorar este e-mail com segurança.
            O link de confirmação é válido por 1 hora.
          </Text>
          <Text style={paragraph}>
            Atenciosamente,
            <br />A Equipe Bionk
          </Text>
        </Container>
      </Section>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  padding: '20px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #e6ebf1',
  borderRadius: '5px',
};

const heading = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  padding: '0 20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#52c41a', 
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
};