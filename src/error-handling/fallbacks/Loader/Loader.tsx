function LoaderErrorBoundaryFallback() {
  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold">
        Something went wrong with this component loading process... Please try again later
      </h3>
    </div>
  );
}

export default LoaderErrorBoundaryFallback;