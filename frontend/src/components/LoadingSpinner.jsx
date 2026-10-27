const LoadingSpinner = ({ fullScreen = true }) => {
	return (
		<div className={`flex items-center justify-center ${fullScreen ? "min-h-screen bg-gray-50" : "py-16"}`}>
			<div className='h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600' />
			<span className='sr-only'>Loading</span>
		</div>
	);
};

export default LoadingSpinner;
