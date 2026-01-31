import React from "react";

type GlassProps<T extends React.ElementType> = {
  as?: T;
  children?: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
} & React.ComponentPropsWithoutRef<T>;

const Glass = <T extends React.ElementType = "div">({
  as,
  children,
  className = "",
  hoverEffect = true,
  style,
  ...props
}: GlassProps<T>) => {
  const Component = as || "div";

  return (
    <Component
      className={`relative overflow-hidden backdrop-blur-[5px] transition-all duration-500 ${
        hoverEffect ? "hover:border-white/30" : ""
      } ${className}`}
      style={{
        backgroundColor: "rgba(18, 20, 28, 0.6)",
        ...style,
      }}
      {...(props as any)}
    >
      <div
        className="pointer-events-none absolute inset-0 animate-shine bg-[linear-gradient(120deg,transparent_35%,rgba(255,255,255,0.05)_50%,transparent_65%)] bg-size-[280%_100%]"
      />
      <div className="relative z-10">{children}</div>
    </Component>
  );
};

export default Glass;
