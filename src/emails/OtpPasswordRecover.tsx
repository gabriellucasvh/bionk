import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import type * as React from "react";

interface OtpPasswordRecoverProps {
	otp: string;
	expiryMinutes?: number;
}

const baseUrl = process.env.NEXTAUTH_URL
	? `${process.env.NEXTAUTH_URL}`
	: "https://bionk.me";

export const OtpPasswordRecover: React.FC<Readonly<OtpPasswordRecoverProps>> = ({
	otp,
	expiryMinutes = 20,
}) => (
	<Html lang="pt-BR">
		<Head />
		<Preview>Redefina sua senha no Bionk</Preview>
		<Body style={main}>
			<Container style={container}>
				<Heading style={heading}>Código para Redefinir Senha</Heading>
				<Text style={paragraph}>
					Recebemos uma solicitação para redefinir sua senha no Bionk. Use o
					código abaixo para continuar o processo:
				</Text>
				<Section style={otpContainer}>
					<Text style={otpText}>{otp}</Text>
				</Section>
				<Text style={paragraph}>
					Este código é válido por {expiryMinutes} minutos. Se você não
					solicitou a redefinição, ignore este e-mail.
				</Text>
				<Hr style={hr} />
				<Text style={footerText}>Bionk - Conectando suas ideias.</Text>
				<Text style={footerLinkContainer}>
					<Link href={baseUrl} style={footerLink}>
						Acessar Bionk
					</Link>
				</Text>
			</Container>
		</Body>
	</Html>
);

export default OtpPasswordRecover;

const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
	padding: "20px 0",
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "20px",
	border: "1px solid #dfe1e6",
	borderRadius: "8px",
	maxWidth: "465px",
};

const heading = {
	color: "#1a1a1a",
	fontSize: "28px",
	fontWeight: "bold",
	textAlign: "center" as const,
	marginBottom: "20px",
};

const paragraph = {
	color: "#525f7f",
	fontSize: "16px",
	lineHeight: "24px",
	marginBottom: "15px",
};

const otpContainer = {
	background: "#f0f0f0",
	borderRadius: "4px",
	margin: "20px 0",
	padding: "10px",
	textAlign: "center" as const,
};

const otpText = {
	color: "#0a0a0a",
	fontSize: "32px",
	fontWeight: "bold" as const,
	letterSpacing: "2px",
};

const hr = {
	borderColor: "#dfe1e6",
	margin: "20px 0",
};

const footerText = {
	color: "#8898aa",
	fontSize: "12px",
	lineHeight: "16px",
	textAlign: "center" as const,
};

const footerLinkContainer = {
	textAlign: "center" as const,
	marginTop: "10px",
};

const footerLink = {
	color: "#007bff",
	textDecoration: "none",
	fontSize: "12px",
};
