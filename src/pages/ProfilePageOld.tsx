import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  type QueryFunction,
  type MutationFunction,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  changePassword,
  fetchMe,
  requestPasswordReset,
  type ChangePasswordPayload,
  type ChangePasswordResponse,
  type MeResponse,
  type ResetPasswordRequestPayload,
  type ResetPasswordResponse,
} from "../api/auth";
import { useForm } from "react-hook-form";
import { showToast } from "../utils/toast";

function ProfilePage() {
  const navigate = useNavigate();
  const token = null; // Removed localStorage access
  const [showChangePassword, setShowChangePassword] = useState(false);

  const toErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  const requestResetMutationFn: MutationFunction<
    ResetPasswordResponse,
    ResetPasswordRequestPayload
  > = (payload) =>
    (
      requestPasswordReset as (
        input: ResetPasswordRequestPayload
      ) => Promise<ResetPasswordResponse>
    )(payload);

  useEffect(() => {
    if (!token) {
      void navigate("/");
    }
  }, [token, navigate]);

  const profileQueryFn: QueryFunction<MeResponse> = () => {
    if (!token) {
      throw new Error("Unauthorized");
    }
    return fetchMe();
  };

  const profileQuery = useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: profileQueryFn,
  });

  const form = useForm<ChangePasswordPayload>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const changePasswordMutationFn: MutationFunction<
    ChangePasswordResponse,
    ChangePasswordPayload
  > = (payload) => {
    return changePassword(payload);
  };

  const changePasswordMutation = useMutation<
    ChangePasswordResponse,
    Error,
    ChangePasswordPayload
  >({
    mutationFn: changePasswordMutationFn,
    onSuccess: () => {
      form.reset();
      showToast("Password updated successfully", "success");
      setShowChangePassword(false);
    },
  });

  const requestResetMutation = useMutation<
    ResetPasswordResponse,
    unknown,
    ResetPasswordRequestPayload
  >({
    mutationFn: requestResetMutationFn,
    onSuccess: () => {
      showToast("Password reset link sent to your email", "info");
    },
    onError: (error) => {
      showToast(toErrorMessage(error, "Failed to send reset link."), "error");
    },
  });

  const onSubmit = form.handleSubmit((values) =>
    changePasswordMutation.mutate(values)
  );

  const user = profileQuery.data?.user;
  const userName = user?.name ?? user?.email ?? "User";
  const userEmail: string = user?.email ?? "";

  const handleResetRequest = () => {
    if (!userEmail) {
      return;
    }
    requestResetMutation.mutate({ email: userEmail });
  };

  const handleCloseModal = () => {
    setShowChangePassword(false);
    form.reset();
  };

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <p className="muted mb-2">Profile</p>
        <h1 className="text-2xl font-semibold text-slate-50">{userName}</h1>
        {user?.pid && (
          <div className="mt-2 inline-block rounded border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-sm font-medium text-sky-200">
            PID: {user.pid}
          </div>
        )}
        <p className="text-sm text-slate-400 mt-2">
          Manage your account details.
        </p>
      </div>

      <div className="card space-y-4 p-6">
        <div>
          <p className="muted">Security</p>
          <h2 className="text-lg font-semibold text-slate-50">
            Change password
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="button"
            type="button"
            onClick={() => setShowChangePassword(true)}
          >
            Change password
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={handleResetRequest}
            disabled={!userEmail || requestResetMutation.isPending}
          >
            {requestResetMutation.isPending
              ? "Sending reset link…"
              : "Send password reset link"}
          </button>
        </div>
      </div>

      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="muted">Security</p>
                <h3 className="text-lg font-semibold text-slate-50">
                  Change password
                </h3>
              </div>
              <button
                type="button"
                className="text-sm text-slate-300 hover:text-sky-300"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
            <form
              className="space-y-4"
              onSubmit={(event) => void onSubmit(event)}
            >
              <div className="space-y-2">
                <label className="label" htmlFor="currentPassword">
                  Current password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  className="input"
                  {...form.register("currentPassword", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <label className="label" htmlFor="newPassword">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className="input"
                  {...form.register("newPassword", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <label className="label" htmlFor="confirmNewPassword">
                  Confirm new password
                </label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  className="input"
                  {...form.register("confirmNewPassword", { required: true })}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="button"
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending
                    ? "Updating…"
                    : "Update password"}
                </button>
                <button
                  className="button secondary"
                  type="button"
                  onClick={handleCloseModal}
                  disabled={changePasswordMutation.isPending}
                >
                  Cancel
                </button>
              </div>
              {changePasswordMutation.isError && (
                <p className="text-sm text-rose-300">
                  {changePasswordMutation.error instanceof Error
                    ? changePasswordMutation.error.message
                    : "Failed to update password."}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProfilePage;
