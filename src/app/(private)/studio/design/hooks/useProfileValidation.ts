import { useCallback, useState } from "react";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";

export const useProfileValidation = () => {
	const [validationError, setValidationError] = useState<string>("");
	const [bioValidationError, setBioValidationError] = useState<string>("");
	const [isCheckingUsername, setIsCheckingUsername] = useState(false);

	const validateBio = useCallback((bio: string): boolean => {
		if (bio.length > 500) {
			setBioValidationError("A biografia deve ter no máximo 500 caracteres.");
			return false;
		}
		setBioValidationError("");
		return true;
	}, []);

	const validateUsername = useCallback(
		async (username: string, originalUsername: string): Promise<boolean> => {
			if (!username.trim()) {
				setValidationError("O campo de nome de usuário não pode ficar vazio.");
				return false;
			}
			if (username.length > 30) {
				setValidationError("Nome de usuário deve ter no máximo 30 caracteres.");
				return false;
			}
			if (BLACKLISTED_USERNAMES.includes(username.toLowerCase())) {
				setValidationError("Este nome de usuário não está disponível.");
				return false;
			}

			if (username === originalUsername) {
				setValidationError("");
				return true;
			}

			setIsCheckingUsername(true);
			try {
				const response = await fetch(
					`/api/auth/check-username?username=${encodeURIComponent(username)}`
				);
				const data = await response.json();

				if (!response.ok) {
					setValidationError("Erro ao verificar disponibilidade do username.");
					return false;
				}

				if (!data.available) {
					setValidationError("Este nome de usuário já está em uso.");
					return false;
				}

				setValidationError("");
				return true;
			} catch {
				setValidationError("Erro ao verificar disponibilidade do username.");
				return false;
			} finally {
				setIsCheckingUsername(false);
			}
		},
		[]
	);

	const clearValidationErrors = useCallback(() => {
		setValidationError("");
		setBioValidationError("");
	}, []);

	return {
		validationError,
		bioValidationError,
		isCheckingUsername,
		validateBio,
		validateUsername,
		clearValidationErrors,
	};
};
