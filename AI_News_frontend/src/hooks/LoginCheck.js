import { likeArticle } from "../api/articles";
import { useAuthModal } from "../context/AuthModalContext";

const useloginCheck = () => {
  const { openModal } = useAuthModal();

  const isLoggedIn = () => {
    return !!localStorage.getItem("token");
  }

  return (action) => {
    if (!isLoggedIn()) {
      openModal(action);
      return;
    }
    action();
  };
};

export default useloginCheck;