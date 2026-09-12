import { useState } from "react";
import {
  useForm,
} from "react-hook-form";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "./useAuth";


interface FormValues {
  email: string;
  password: string;
}


export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } =
    useAuth();

  const [error, setError] =
    useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: {
      isSubmitting,
    },
  } = useForm<FormValues>();


  const onSubmit = async (
    values: FormValues,
  ) => {
    setError(null);

    try {
      await registerUser(
        values.email,
        values.password,
      );

      navigate("/app");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed.",
      );
    }
  };


  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold">
        Create account
      </h1>

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded border p-3"
          {...register(
            "email",
            {
              required: true,
            },
          )}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded border p-3"
          {...register(
            "password",
            {
              required: true,
            },
          )}
        />

        {error && (
          <p className="text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded border px-4 py-2"
        >
          Create account
        </button>
      </form>

      <p className="mt-4">
        <Link to="/login">
          Sign in
        </Link>
      </p>
    </main>
  );
}