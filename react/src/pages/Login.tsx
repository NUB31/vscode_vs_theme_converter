import axios, { AxiosError } from "axios";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

interface MyFormValues {
  username: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  function handleAxiosError(err: AxiosError) {
    if (err.response) {
      switch (err.response.status) {
        default:
          if (typeof err.response.data === "string") {
            return err.response.data;
          }
      }
    }
    return err.message;
  }

  const initialValues: MyFormValues = { username: "", password: "" };

  return (
    <div>
      <h1>My Example</h1>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, actions) => {
          try {
            const { data } = await axios.post(
              `${import.meta.env.VITE_API_URL}/auth/login`,
              {
                username: values.username,
                password: values.password,
              },
              { withCredentials: true }
            );
            setUser(data);
            navigate("/");
          } catch (err) {
            let errorMessage = "Something went wrong >:(";
            if (axios.isAxiosError(err)) errorMessage = handleAxiosError(err);
            toast.error(errorMessage);
            actions.setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="flex flex-col">
              <label htmlFor="username">Usernmae or Email</label>
              <Field id="username" name="username" placeholder="Username" />
              <label htmlFor="password">Password</label>
              <Field
                id="password"
                name="password"
                placeholder="Password"
                type="password"
              />
            </div>
            {}
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
