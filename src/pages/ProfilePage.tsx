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
  logoutUser,
  type ChangePasswordPayload,
  type ChangePasswordResponse,
  type MeResponse,
} from "../api/auth";
import { fetchColleges, type College } from "../api/colleges";
import { useForm } from "react-hook-form";
import { showToast } from "../utils/toast";
import { Pencil, QrCode, X, MapPin, Clock } from "lucide-react";
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



  useEffect(() => {
    if (!token) {
      // void navigate("/");
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


  const onSubmit = form.handleSubmit((values) =>
    changePasswordMutation.mutate(values),
  );

  /* 
    We fetch all colleges to find the user's college name.
    This is acceptable since the list of colleges is relatively small/static.
  */
  const collegeQuery = useQuery<College[]>({
    queryKey: ["colleges"],
    queryFn: fetchColleges,
  });

  const user = profileQuery.data?.user;
  const userName = user?.name ?? user?.email ?? "User";
  
  const userCollegeId = user?.collegeId;
  const collegeName = collegeQuery.data?.find(c => c.id === userCollegeId)?.name ?? "No College Info";


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
        <div className="w-full max-w-[92%] sm:max-w-[80%] md:max-w-[85%] lg:max-w-[95%] xl:max-w-[85%] mt-4 px-2 sm:px-4">
          <LiquidGlassCard className="p-4 md:p-6 rounded-3xl flex flex-col lg:flex-row gap-6 md:gap-8 items-stretch">
          <div className="relative w-full md:w-64 lg:w-72 shrink-0 flex flex-col">
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
              
              <div className="w-full relative flex-1 flex flex-col items-center justify-center">
                 <div className="mt-4"></div>
                 <div className="flex flex-col items-center gap-4">
                {/* Avatar Circle - Overlapping */}
                <div className="shrink-0 z-10 relative flex items-center justify-center">
                  <div
                    className={`w-28 h-28 md:w-40 md:h-40 rounded-full bg-linear-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-xl transition-transform duration-500 ${
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
                <div className="w-full">
                  <div className="rounded-2xl flex items-center justify-center p-2 w-full">
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
                          {collegeName}
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center items-stretch">
                        <button
                          className="px-6 py-2.5 card card--dark text-white font-medium rounded-3xl transition-all duration-200 w-full sm:w-auto sm:flex-1 sm:min-w-40 sm:max-w-60 hover:opacity-80 active:opacity-60"
                          type="button"
                          onClick={() => {
                            setShowChangePassword(true);
                          }}
                        >
                          Change password
                        </button>
                        <button
                          className="px-6 py-2.5 card card--dark text-white font-medium rounded-3xl transition-all duration-200 w-full sm:w-auto sm:flex-1 sm:min-w-40 sm:max-w-60 hover:opacity-80 active:opacity-60"
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
              <div className="mt-6"></div>
              </div>

          </div>


        {/* My Missions Section */}
        {/* Cards count should equal number of events user has signed up for. */}
        <div className="flex-1 w-full min-w-0">
            <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-center mb-8 mt-4">
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
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
                  className="w-49! max-w-49! p-4.5! flex flex-col gap-2 rounded-3xl!"
                >
                  {/* Mission Image/Poster */}
                  <div className="relative aspect-4/5 w-full bg-linear-to-b from-white/20 to-black/40 rounded-3xl overflow-hidden">
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
                  {/* Mission Card Content */}
                  <div className="flex-1 flex flex-col justify-between overflow-hidden pt-2 gap-2">
                    {/* Event Title */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-50 line-clamp-2 leading-tight min-h-[2.5em]">
                        {mission.title}
                      </h3>
                    </div>

                    {/* Metadata: Venue & Time */}
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                        {/* Venue */}
                        <div className="flex items-center gap-1 min-w-0 shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span className="truncate font-medium">TBA</span>
                        </div>
                        {/* Time */}
                        <div className="flex items-center gap-1 min-w-0 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                             <span className="truncate font-medium">TBA</span>
                        </div>
                    </div>
                  </div>
                </LiquidGlassCard>
              ))}
              speed="normal"
              gap="gap-6"
              itemWidth="w-48"
              pauseOnHover={true}
              autoScroll={false}
            />
            <div className="mt-6"></div>
            </div>
        </div>
          </LiquidGlassCard> 
        </div>

        {showQRCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-1 md:p-1.5 backdrop-blur">
            <LiquidGlassCard
              className="
                w-[92%]! sm:w-[70%]! md:w-[45%]! lg:w-[25%]!
                max-w-[92%]! sm:max-w-[70%]! md:max-w-[45%]! lg:max-w-[25%]!
                flex-none space-y-7 md:space-y-8 px-9 md:px-10 py-8 md:py-9 rounded-3xl
              "
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="pt-1">
                  <h3 className="text-lg font-semibold text-slate-50 pl-0.5">
                    QR Code
                  </h3>
                </div>
                <button
                  type="button"
                  className="text-slate-300 hover:text-sky-300 p-1 hover:bg-white/10 rounded transition-colors"
                  onClick={() => setShowQRCode(false)}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center space-y-6 md:space-y-7 pb-1">
                {/* QR Code Placeholder */}
                <div className="w-64 h-64 bg-white rounded-2xl p-5 flex items-center justify-center shadow-inner">
                  <div className="w-full h-full bg-slate-200 rounded-xl flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-slate-400" />
                  </div>
                </div>
                <p className="text-sm text-slate-400 text-center pb-1">
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
                w-[92%]! sm:w-[70%]! md:w-[45%]! lg:w-[25%]!
                max-w-[92%]! sm:max-w-[70%]! md:max-w-[45%]! lg:max-w-[25%]!
                flex-none space-y-6 px-9 md:px-10 py-7 md:py-8 rounded-3xl
              "
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="pt-1">
                  <h3 className="text-lg font-semibold text-slate-50 pl-1">
                    Edit profile
                  </h3>
                </div>
                <button
                  type="button"
                  className="text-slate-300 hover:text-sky-300 p-1 hover:bg-white/10 rounded transition-colors"
                  onClick={handleCloseModal}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-3 pt-3">
                  <input
                    id="fullName"
                    type="text"
                    className="w-full px-4! py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="flex justify-center items-center gap-4 pb-3">
                  <button
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-3xl transition-colors duration-200 min-w-34"
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
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-3xl transition-colors duration-200 min-w-34"
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
                w-[92%]! sm:w-[70%]! md:w-[45%]! lg:w-[25%]!
                max-w-[92%]! sm:max-w-[70%]! md:max-w-[45%]! lg:max-w-[25%]!
                flex-none space-y-8 px-8 md:px-9 py-8 md:py-9 rounded-3xl
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div className="pt-0.5 pl-0.5">
                  <h3 className="text-lg font-semibold text-slate-50">
                    Change password
                  </h3>
                </div>
                <button
                  type="button"
                  className="text-slate-300 hover:text-sky-300 p-1 hover:bg-white/10 rounded transition-colors"
                  onClick={handleCloseModal}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                className="space-y-7 pt-2"
                onSubmit={(event) => void onSubmit(event)}
              >
                <div className="space-y-1.5">
                  <label
                    className="label text-sm font-medium text-slate-200 block px-5 md:px-6"
                    htmlFor="currentPassword"
                  >
                    Current password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    className="w-full px-5 md:px-6 py-2.5 md:py-3 leading-tight bg-linear-to-b from-slate-600/30 to-slate-700/30 shadow-inner rounded-full text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:from-slate-600/50 focus:to-slate-700/50 transition-all duration-200"
                    {...form.register("currentPassword", { required: true })}
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className="label text-sm font-medium text-slate-200 block px-5 md:px-6"
                    htmlFor="newPassword"
                  >
                    New password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className="w-full px-5 md:px-6 py-2.5 md:py-3 leading-tight bg-linear-to-b from-slate-600/30 to-slate-700/30 shadow-inner rounded-full text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:from-slate-600/50 focus:to-slate-700/50 transition-all duration-200"
                    {...form.register("newPassword", { required: true })}
                    placeholder="Create a new password"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className="label text-sm font-medium text-slate-200 block px-5 md:px-6"
                    htmlFor="confirmNewPassword"
                  >
                    Confirm new password
                  </label>
                  <input
                    id="confirmNewPassword"
                    type="password"
                    className="w-full px-5 md:px-6 py-2.5 md:py-3 leading-tight bg-linear-to-b from-slate-600/30 to-slate-700/30 shadow-inner rounded-full text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:from-slate-600/50 focus:to-slate-700/50 transition-all duration-200"
                    {...form.register("confirmNewPassword", {
                      required: true,
                    })}
                    placeholder="Confirm your new password"
                  />
                </div>
                <div className="flex items-center justify-center gap-4 pt-3">
                  <button
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:brightness-95 text-white font-semibold rounded-3xl transition-all duration-200 min-w-36 shadow-lg hover:shadow-amber-500/20"
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending
                      ? "Updating…"
                      : "Update password"}
                  </button>
                  <button
                    className="px-6 py-2.5 bg-slate-600/40 hover:bg-slate-600/60 text-slate-100 font-semibold rounded-3xl transition-all duration-200 min-w-36"
                    type="button"
                    onClick={handleCloseModal}
                    disabled={changePasswordMutation.isPending}
                  >
                    Cancel
                  </button>
                </div>
                {changePasswordMutation.isError && (
                  <p className="text-sm text-rose-300 pt-1">
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
