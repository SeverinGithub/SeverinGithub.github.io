export function ProductCover({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex aspect-[3/4] items-center justify-center bg-[#1a1916] px-4 text-center text-sm text-[#f4efe6] ${className}`}
      >
        {alt}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`aspect-[16/9] w-full bg-black object-contain ${className}`}
    />
  );
}
