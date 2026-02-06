import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../api/auth";

const HomeStateContext = createContext();

export const HomeStateProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [scrollPos, setScrollPos] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 

  // --- AUTH STATES ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile on mount to check for session/role
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
      try {
        const userData = await getMe(); 
      
      if (userData && userData.role) {
        setUser(userData);
      } else {
        setUser(null);
        localStorage.removeItem("token");
      }
      } catch (err) {
        console.error("Auth check failed:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
        setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  return (
    <HomeStateContext.Provider
      value={{
        articles,
        setArticles,
        page,
        setPage,
        totalPages,
        scrollPos,
        setScrollPos,
        setTotalPages,
        activeCategory,
        setActiveCategory,
        isSearchMode,
        setIsSearchMode,
        searchQuery,
        setSearchQuery,
        // --- Export Auth ---
        user,
        setUser,
        loading,
      }}
    >
      {children}
    </HomeStateContext.Provider>
  );
};

export const useHomeState = () => useContext(HomeStateContext);
