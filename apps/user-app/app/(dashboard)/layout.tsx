import { BetterAppbar } from "components/BetterAppbar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div>
      <BetterAppbar />
      <div className="bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364]">
        {children}
      </div>
    </div>

  );
}
