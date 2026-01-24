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
  logoutUser,
  type ChangePasswordPayload,
  type ChangePasswordResponse,
  type MeResponse,
  type ResetPasswordRequestPayload,
  type ResetPasswordResponse,
} from "../api/auth";
import { useForm } from "react-hook-form";
import { showToast } from "../utils/toast";
import { Pencil, QrCode } from "lucide-react";
import LiquidGlassCard from "../components/liquidglass/LiquidGlassCard";
import InfiniteScroll from "../components/InfiniteScroll";

function ProfilePage() {
  const navigate = useNavigate();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const toErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  const requestResetMutationFn: MutationFunction<
    ResetPasswordResponse,
    ResetPasswordRequestPayload
  > = (payload) =>
    (
      requestPasswordReset as (
        input: ResetPasswordRequestPayload,
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
    queryKey: ["me", token],
    queryFn: profileQueryFn,
    enabled: Boolean(token),
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
    if (!token) {
      throw new Error("Unauthorized");
    }
    return changePassword(payload, token);
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
    changePasswordMutation.mutate(values),
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

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout API errors and proceed to client-side cleanup
    } finally {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  const handleCloseModal = () => {
    setShowChangePassword(false);
    setShowEditProfile(false);
    setEditFullName("");
    form.reset();
  };

  return (
    <div
      className="fixed inset-0 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/temp_event_bg.png')" }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=New+Rocker&display=swap');`}
      </style>
      <div className="absolute inset-0 bg-black/40"></div>
      <section className="relative h-screen overflow-y-auto pt-32 md:pt-24 pb-12 flex flex-col items-center justify-start">
        {/* Profile Card */}
        <div className="w-full max-w-[92%] sm:max-w-[80%] md:max-w-[72%] lg:max-w-[65%] mt-4 px-2 sm:px-4">
          <div className="relative">
            <LiquidGlassCard className="p-4 md:p-6">
              {/* Edit Profile Button */}
              <button
                onClick={() => {
                  setEditFullName(userName);
                  setShowEditProfile(true);
                }}
                className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-110 group"
                title="Edit profile"
              >
                <Pencil className="w-4 h-4 md:w-5 md:h-5 text-slate-200 group-hover:text-white" />
                <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-900/80 text-slate-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  Edit profile
                </span>
              </button>
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 lg:gap-0">
                {/* Avatar Circle - Overlapping */}
                <div className="flex-shrink-0 lg:-mr-20 z-10 md:mb-0 relative flex items-center justify-center ml-3 sm:ml-6 md:ml-8 lg:ml-10">
                  <div
                    className={`w-28 h-28 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-xl transition-transform duration-500 ${
                      isRotating ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <span className="text-3xl md:text-5xl text-slate-800 font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* QR Code Button */}
                  <button
                    onClick={() => {
                      setIsRotating(true);
                      setTimeout(() => {
                        setShowQRCode(true);
                        setIsRotating(false);
                      }, 500);
                    }}
                    className="absolute bottom-0 left-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-110 group border border-white/20"
                    title="Show QR Code"
                  >
                    <QrCode className="w-4 h-4 md:w-5 md:h-5 text-slate-200 group-hover:text-white" />
                  </button>
                </div>

                {/* Profile Info & Buttons - Purple Glass Container */}
                <div className="flex-1 w-full max-w-full min-w-0 md:pl-8 lg:pl-16">
                  <div className="rounded-2xl min-h-48 flex items-center justify-center p-4 md:p-6 w-full max-w-full">
                    <div className="space-y-3 md:space-y-4 w-full max-w-full min-w-0">
                      {/* Name */}
                      <div className="text-center">
                        <p className="text-2xl md:text-3xl font-semibold text-slate-50">
                          {userName}
                        </p>
                      </div>

                      {/* Email Address : has to be fixed using hardcoded values for now*/}
                      <div className="text-center">
                        <p className="text-sm text-slate-300">
                          {"No College Info"}
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center items-stretch">
                        <button
                          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-3xl transition-colors duration-200 w-full sm:w-auto sm:flex-1 sm:min-w-[10rem] sm:max-w-[15rem]"
                          type="button"
                          onClick={() => {
                            setShowChangePassword(true);
                          }}
                        >
                          Change password
                        </button>
                        <button
                          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-3xl transition-colors duration-200 w-full sm:w-auto sm:flex-1 sm:min-w-[10rem] sm:max-w-[15rem]"
                          type="button"
                          onClick={() => {
                            void handleLogout();
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>

        {/* My Missions Section */}
        {/* TODO: Replace hardcoded missions with mapped events once signup events API is available. */}
        {/* Cards count should equal number of events user has signed up for. */}
        <div className="w-full max-w-[92%] sm:max-w-[80%] md:max-w-[72%] lg:max-w-[65%] mt-12">
          <LiquidGlassCard className="p-6 md:p-8">
            {/* Header */}
            <div className="flex justify-center mb-8">
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-400"
                style={{ fontFamily: "'New Rocker', cursive" }}
              >
                My Missions
              </h2>
            </div>

            {/* Mission Cards Container */}
            <InfiniteScroll
              items={[
                {
                  title: "Design Bootcamp",
                  code: "DB1N9R4",
                  image: "/tempprofile/1.png",
                },
                {
                  title: "Hackathon 2026",
                  code: "HX7K2P9",
                  image: "/tempprofile/2.png",
                },
                {
                  title: "Code Sprint Championship",
                  code: "CS9M4L1",
                  image: "/tempprofile/3.png",
                },
                {
                  title: "Web Dev Masters",
                  code: "WD2X8B5",
                  image: "/tempprofile/4.png",
                },
                {
                  title: "AI Innovation Summit",
                  code: "AI6P3K7",
                  image: null,
                },
              ].map((mission) => (
                <LiquidGlassCard
                  key={mission.code}
                  className="!w-49 !max-w-49 !p-4.5 flex flex-col gap-2"
                >
                  {/* Mission Image/Poster */}
                  <div className="relative aspect-[4/5] w-full bg-linear-to-b from-white/20 to-black/40 rounded-xl overflow-hidden">
                    {mission.image ? (
                      <img
                        src={mission.image}
                        alt={mission.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-b from-white/60 via-white/25 to-black/70 flex items-center justify-center text-black/40">
                        <div className="text-center text-sm">
                          <div className="font-semibold">Portrait</div>
                          <div>1080 × 1350 px (4:5)</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mission Card Content */}
                  <div className="flex-1 flex flex-col space-y-1.5 overflow-hidden">
                    {/* Event Title */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-50 line-clamp-1">
                        {mission.title}
                      </h3>
                    </div>

                    {/* Venue Field */}
                    <div className="flex items-center justify-between bg-slate-900/40 rounded px-1.5 py-1">
                      <span className="text-xs text-teal-400">VENUE:</span>
                      <span className="text-xs font-semibold text-amber-300">
                        TBA
                      </span>
                    </div>

                    {/* Time Field */}
                    <div className="flex items-center justify-between bg-slate-900/40 rounded px-1.5 py-1">
                      <span className="text-xs text-pink-400">TIME:</span>
                      <span className="text-xs font-semibold text-amber-300">
                        TBA
                      </span>
                    </div>
                  </div>
                </LiquidGlassCard>
              ))}
              speed="normal"
              gap="gap-6"
              itemWidth="w-49"
              pauseOnHover={true}
              autoScroll={false}
            />
          </LiquidGlassCard>
        </div>

        {showQRCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-1 md:p-1.5 backdrop-blur">
            <LiquidGlassCard
              className="
                !w-[92%] sm:!w-[70%] md:!w-[45%] lg:!w-[25%]
                !max-w-[92%] sm:!max-w-[70%] md:!max-w-[45%] lg:!max-w-[25%]
                flex-none space-y-4 p-6
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="muted">Your Profile</p>
                  <h3 className="text-lg font-semibold text-slate-50">
                    QR Code
                  </h3>
                </div>
                <button
                  type="button"
                  className="text-sm text-slate-300 hover:text-sky-300"
                  onClick={() => setShowQRCode(false)}
                >
                  Close
                </button>
              </div>

              <div className="flex flex-col items-center space-y-4">
                {/* QR Code Placeholder */}
                <div className="w-64 h-64 bg-white rounded-lg p-4 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-200 rounded flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-slate-400" />
                  </div>
                </div>
                <p className="text-sm text-slate-400 text-center">
                  Scan this QR code
                </p>
              </div>
            </LiquidGlassCard>
          </div>
        )}

        {showEditProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-1 md:p-1.5 backdrop-blur">
            <LiquidGlassCard
              className="
                !w-[92%] sm:!w-[70%] md:!w-[45%] lg:!w-[25%]
                !max-w-[92%] sm:!max-w-[70%] md:!max-w-[45%] lg:!max-w-[25%]
                flex-none space-y-4 p-6
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-50 p-0.5">
                    Edit profile
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

              <div className="space-y-4 mt-1">
                <div className="space-y-2">
                  <label className="label" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className="input"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="mt-2 flex justify-center items-center gap-1.5">
                  <button
                    className="button bg-orange-500 hover:bg-orange-600 px-5 py-1.5 rounded-md text-white text-base font-medium transition"
                    type="button"
                    onClick={() => {
                      if (editFullName.trim()) {
                        showToast("Profile updated successfully", "success");
                        handleCloseModal();
                      } else {
                        showToast("Full name cannot be empty", "error");
                      }
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="button secondary bg-slate-600 hover:bg-slate-700 px-5 py-1.5 rounded-md text-white text-base font-medium transition"
                    type="button"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        )}

        {showChangePassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-1 md:p-1.5 backdrop-blur">
            <LiquidGlassCard
              className="
                !w-[92%] sm:!w-[70%] md:!w-[45%] lg:!w-[25%]
                !max-w-[92%] sm:!max-w-[70%] md:!max-w-[45%] lg:!max-w-[25%]
                flex-none space-y-4 p-6
              "
            >
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
                    {...form.register("confirmNewPassword", {
                      required: true,
                    })}
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
            </LiquidGlassCard>
          </div>
        )}
      </section>
    </div>
  );
}

export default ProfilePage;
