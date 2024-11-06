import React, { createContext, useContext } from "react";
import { useLocalStorage } from "../../core/hooks/useLocalStorage";
import { useAngelbrokingLogin } from "../hooks/useAngelBrokingLogin";
import { useLogin } from "../hooks/useLogin";
import { useLogout } from "../hooks/useLogout";
import { useUserInfo } from "../hooks/useUserInfo";
import { UserInfo } from "../types/userInfo";
import { Navigate, useNavigate } from "react-router-dom";

interface AuthContextInterface {
  hasRole: (roles?: string[]) => {};
  isLoggingIn: boolean;
  isAngelbrokingLoggingIn:boolean;
  login: (email: string, password: string) => Promise<any>;
  angelBrokingLogin:(clientCode:string,password:string,totp:string) => Promise<any>;
  logout: () => Promise<any>;
  userInfo?: UserInfo;
}

export const AuthContext = createContext({} as AuthContextInterface);

type AuthProviderProps = {
  children?: React.ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authKey, setAuthKey] = useLocalStorage<string>("authkey", "");
  const navigate = useNavigate();
  
  const { isLoggingIn, login } = useLogin();
  const {isAngelbrokingLoggingIn,angelBrokingLogin} = useAngelbrokingLogin();
  const { data: userInfo } = useUserInfo(authKey);

  const hasRole = (roles?: string[]) => {
    if (!roles || roles.length === 0) {
      return true;
    }
    if (!userInfo) {
      return false;
    }
    return roles.includes(userInfo.role);
  };

  const handleLogin = async (email: string, password: string) => {
    return login({ email, password })
      .then((data) => {
          setAuthKey(data.token);
          return data; 
      })
      .catch((err) => {
        throw err;
      });
  };

const handleAngelBrokingLogin = async (clientCode:string,password:string,totp:string) =>{
  return angelBrokingLogin({ clientCode, password, totp })
      .catch((err) => {
        throw err;
      });
}

  const handleLogout = async () => {
    setAuthKey("");
    localStorage.setItem('authkey','');
    navigate(`/${process.env.PUBLIC_URL}`, { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        hasRole,
        isLoggingIn,
        isAngelbrokingLoggingIn,
        login: handleLogin,
        angelBrokingLogin:handleAngelBrokingLogin,
        logout: handleLogout,
        userInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
