import { createContext, useContext, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

type UserContextProps = {
  children: React.ReactNode;
};

type User = {
  id?: number;
  username?: string;
  email?: string;
  picture?: string;
};

type UserContextValues = {
  user: User | null;
  getUser: () => void;
  setUser: React.Dispatch<any>;
};

const UserContext = createContext<UserContextValues>({} as UserContextValues);

export function useUser() {
  return useContext(UserContext);
}

function handleAxiosError(err: AxiosError) {
  if (err.response) {
    switch (err.response.status) {
      case 401:
        return "You are not Signed in. Click here to log in";
      default:
        if (typeof err.response.data === "string") {
          return err.response.data;
        }
    }
  }
  return err.message;
}

export function UserContextProvider({ children }: UserContextProps) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const getUser = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
        withCredentials: true,
      });
      setUser(data);
    } catch (err) {
      let errorMessage = "Something went wrong >:(";
      if (axios.isAxiosError(err)) errorMessage = handleAxiosError(err);
      toast.info(errorMessage, { onClick: () => navigate("/login") });
    }
  };

  return (
    <UserContext.Provider value={{ user, getUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
