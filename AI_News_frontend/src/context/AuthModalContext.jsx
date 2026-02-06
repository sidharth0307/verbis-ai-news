import { createContext, useContext, useState } from "react";

const AuthModalContext = createContext();

export const AuthModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [afterLoginAction, setAfterLoginAction] = useState(null);

  const openModal = (action = null) => {
    setAfterLoginAction(() => action);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setAfterLoginAction(null);
  };

  return (
    <AuthModalContext.Provider
      value={{ isOpen, openModal, closeModal, afterLoginAction }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
