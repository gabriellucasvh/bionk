export default function LoadingPage() {
	return (
		<section className="flex h-screen w-full items-center justify-center dark:bg-zinc-800">
			<div className="dot-spinner">
				<div className="dot-spinner__dot" />
				<div className="dot-spinner__dot" />
				<div className="dot-spinner__dot" />
				<div className="dot-spinner__dot" />
				<div className="dot-spinner__dot" />
				<div className="dot-spinner__dot" />
				<div className="dot-spinner__dot" />
				<div className="dot-spinner__dot" />
			</div>
		</section>
	);
}
