type HomeV2IconProps = {
  src: string;
  alt?: string;
  className?: string;
  size?: number;
  width?: number;
  height?: number;
};

export default function HomeV2Icon({
  src,
  alt = "",
  className = "",
  size = 24,
  width,
  height,
}: HomeV2IconProps) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <img
      src={src}
      alt={alt}
      width={w}
      height={h}
      className={`block max-w-none shrink-0 object-contain ${className}`}
      style={{ width: w, height: h }}
    />
  );
}
