import { useEffect } from "react";
import { useUser } from "../contexts/UserContext";

export default function User() {
  const { user, getUser } = useUser();

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div>
      User:
      <pre>{JSON.stringify(user, null, 4)}</pre>
    </div>
  );
}
