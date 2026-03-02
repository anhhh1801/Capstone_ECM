type LogoProps = {
  className?: string;
  color?: string;
};

export default function Logo({ className = "", color }: LogoProps) {
  // Allow overriding color via style or tailwind class
  const style = color ? { color } : undefined;
  return (
    <span
      className={`text-[48px] font-bold leading-none ${className}`}
      style={style}
    >
      ECM
    </span>
  );
}
