import { Button } from "@/components/ui/button";

interface ButtonGoldProps extends React.ComponentProps<typeof Button> {
  goldVariant?: "solid" | "outline";
}

export function ButtonGold({
  children,
  className,
  goldVariant = "solid",
  size = "default",
  ...props
}: ButtonGoldProps) {
  if (goldVariant === "outline") {
    return (
      <Button
        size={size}
        variant="outline"
        className={`border-yellow-500 text-yellow-400 hover:bg-zinc-800 rounded-xl ${className}`}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      size={size}
      className={`bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}
