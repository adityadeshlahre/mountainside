export const Header = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h1 className="text-3xl">Header Component</h1>
      {children}
    </div>
  );
};
