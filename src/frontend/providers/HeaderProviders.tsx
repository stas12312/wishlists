import { createContext, useContext, useState } from "react";

type HeaderContextType = {
  isVisible: boolean;
  setVisible: (value: boolean) => void;
};

const HeaderContext = createContext<HeaderContextType | null>(null);

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(true);

  const setVisible = (value: boolean) => setIsVisible(value);

  return (
    <HeaderContext.Provider value={{ isVisible, setVisible }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader must be used within HeaderProvider");
  }
  return context;
};
