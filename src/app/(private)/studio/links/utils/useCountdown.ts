import { differenceInSeconds } from "date-fns";
import { useEffect, useState } from "react";

export const useCountdown = (targetDate: string) => {
	const target = new Date(targetDate);
	const [timeLeft, setTimeLeft] = useState(
		differenceInSeconds(target, new Date())
	);

	useEffect(() => {
		if (timeLeft <= 0) {
			return;
		}

		const interval = setInterval(() => {
			setTimeLeft(differenceInSeconds(target, new Date()));
		}, 1000);

		return () => clearInterval(interval);
	}, [target, timeLeft]);

	const days = Math.floor(timeLeft / (60 * 60 * 24));
	const hours = Math.floor((timeLeft % (60 * 60 * 24)) / (60 * 60));
	const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
	const seconds = Math.floor(timeLeft % 60);

	return { days, hours, minutes, seconds, hasEnded: timeLeft <= 0 };
};
