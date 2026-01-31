import { useState } from "react";
import { Link } from "react-router-dom";
import { CiLogin } from "react-icons/ci";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyTeam,
  registerSoloEvent,
  confirmTeam,
  leaveTeam,
  deleteTeam,
} from "../../api/registration";
import { fetchMe } from "../../api/auth";
import { showToast } from "../../utils/toast";
import CreateTeamModal from "./CreateTeamModal";
import JoinTeamModal from "./JoinTeamModal";
import {
  IoCheckmarkDoneCircle,
  IoCopyOutline,
  IoExitOutline,
  IoPeopleOutline,
  IoTrashOutline,
} from "react-icons/io5";

type EventRegistrationProps = {
  eventId: number;
  type: string;
};

export default function EventRegistration({
  eventId,
  type,
}: EventRegistrationProps) {
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  const user = userData?.user;
  const token = !!user; // Derived auth state
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { data: team, isLoading } = useQuery({
    queryKey: ["my-team", eventId],
    queryFn: () => getMyTeam(eventId),
    enabled: !!user,
  });

  // Mutations
  const registerSoloMutation = useMutation({
    mutationFn: (eId: number) => registerSoloEvent(eId),
    onSuccess: () => {
      showToast("Registered successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["my-team", eventId] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Registration failed", "error");
    },
  });

  const confirmTeamMutation = useMutation({
    mutationFn: (tId: number) => confirmTeam(tId),
    onSuccess: () => {
      showToast("Team confirmed!", "success");
      queryClient.invalidateQueries({ queryKey: ["my-team", eventId] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Confirmation failed", "error");
    },
  });

  const leaveTeamMutation = useMutation({
    mutationFn: (tId: number) => leaveTeam(tId),
    onSuccess: () => {
      showToast("Left team successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["my-team", eventId] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Failed to leave team", "error");
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (tId: number) => deleteTeam(tId),
    onSuccess: () => {
      showToast("Unregistered successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["my-team", eventId] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Failed to unregister", "error");
    },
  });

  if (eventId === 51) {
    return (
      <div className="border border-sky-500/50 bg-sky-500/10 p-2.5 px-3 font-semibold italic text-sky-200 flex w-full justify-center rounded-lg backdrop-blur-3xl">
        Exhibition open on all 3 days
      </div>
    );
  }

  if (eventId === 69) {
    return (
      <div className="border border-sky-500/50 bg-sky-500/10 p-2.5 px-3 font-semibold italic text-sm text-sky-200 flex w-full justify-center rounded-lg backdrop-blur-3xl text-center">
        Open to only Faculties and Non Teaching Staff
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        to={`/login?redirectUrl=${encodeURIComponent(`/events/${eventId}`)}`}
        className="w-fit lg:w-full"
      >
        <button className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-2 capitalize text-white hover:bg-sky-500 transition-colors duration-300 cursor-target">
          <CiLogin className="text-xl" />
          Login to Register
        </button>
      </Link>
    );
  }

  // userData fetch moved up

  const isFestRegistered = !!userData?.user?.pid;

  if (isLoading || (token && isUserLoading)) {
    return <div className="text-center text-slate-400">Loading status...</div>;
  }

  if (token && !isFestRegistered) {
    return (
      <Link to="/register" className="w-full">
        <button
          className="group flex w-full shrink-0 items-center justify-center gap-2 rounded-full
            px-6 py-2.5 capitalize text-white font-semibold
            bg-teal-600 border border-teal-500
            backdrop-blur-2xl
            shadow-[0_8px_30px_rgba(0,0,0,0.35)]
            hover:bg-teal-500 hover:border-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.25)]
            transition-all duration-300
            active:scale-[0.98]
            relative overflow-hidden cursor-target"
        >
          Register to Incridea
          <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
            <span className="absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-transparent via-white/40 to-transparent blur-md" />
          </span>
        </button>
      </Link>
    );
  }

  // Hide registration for Alumni
  if (userData?.user?.category === "ALUMNI" || userData?.user?.roles?.includes("ALUMNI")) {
    return null;
  }

  // Already registered/in a team
  if (team) {
    const isLeader = String(team.Leader?.User?.id) === String(user.id);
    return (

      <div className="w-full rounded-lg border border-sky-500/30 bg-sky-500/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sky-100">
            {type.includes("TEAM") ? team.name : `Participant: ${user?.name}`}
          </h3>
          {team.confirmed ? (
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded">
              <IoCheckmarkDoneCircle /> Confirmed
            </span>
          ) : (
            <span className="text-xs text-amber-400 bg-amber-950/30 px-2 py-1 rounded">
              Not Confirmed
            </span>
          )}
        </div>

        <div className="space-y-1">
          {type.includes("TEAM") && <p className="text-xs text-slate-400 uppercase">Members</p>}
          {type.includes("TEAM") ? (
             team.TeamMembers?.map((member: any) => (
                <div
                  key={member.id}
                  className="text-sm text-slate-200 flex justify-between"
                >
                  <span>{member.PID?.User?.name || `User ${member.PID?.User?.email}`}</span>
                </div>
             ))
          ) : (
             <div className="text-sm text-slate-300">
                 Registration ID: {team.name}
             </div>
          )}
        </div>

        {isLeader && (
          <div className="pt-2">
            {!team.confirmed && (
              <button
                className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition-colors cursor-target"
                onClick={() => confirmTeamMutation.mutate(team.id)}
                disabled={confirmTeamMutation.isPending}
              >
                {confirmTeamMutation.isPending
                  ? "Confirming..."
                  : "Confirm Registration"}
              </button>
            )}

            <button
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-red-500/10 border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20 transition-colors cursor-target"
              onClick={() => {
                if (confirm("Are you sure you want to unregister?"))
                  deleteTeamMutation.mutate(team.id);
              }}
              disabled={deleteTeamMutation.isPending}
            >
              {deleteTeamMutation.isPending ? (
                "Unregistering..."
              ) : type.includes("TEAM") ? (
                <>
                  <IoTrashOutline /> Delete Team
                </>
              ) : (
                "Unregister"
              )}
            </button>
          </div>
        )}

        {!isLeader && (
          <button
            onClick={() => leaveTeamMutation.mutate(team.id)}
            className="w-full flex items-center justify-center gap-2 text-xs text-red-400 hover:text-red-300 mt-2 cursor-target"
          >
            <IoExitOutline /> Leave Team
          </button>
        )}

        {/* Copy Team ID for others to join */}
        {type.includes("TEAM") && (
          <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded text-xs text-slate-400 mt-2">
            <span>
              Team ID: <span className="text-white font-mono">{team.id}</span>
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(String(team.id));
                showToast("Copied Team ID", "success");
              }}
              title="Copy Team ID"
              className="cursor-target"
            >
              <IoCopyOutline className="hover:text-white" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Not registered
  const isSolo = type === "INDIVIDUAL" || type === "INDIVIDUAL_MULTIPLE_ENTRY";



  if (isSolo) {
    return (
      <button
        className="group flex w-full shrink-0 items-center justify-center gap-2 rounded-full
          px-6 py-2.5 capitalize text-white font-semibold
          bg-teal-600 border border-teal-500
          backdrop-blur-2xl
          shadow-[0_8px_30px_rgba(0,0,0,0.35)]
          hover:bg-teal-500 hover:border-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.25)]
          transition-all duration-300
          active:scale-[0.98]
          relative overflow-hidden cursor-target"
        onClick={() => registerSoloMutation.mutate(eventId)}
        disabled={registerSoloMutation.isPending}
      >
        {registerSoloMutation.isPending
          ? "Registering..."
          : "Register Now"}
        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
          <span className="absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-transparent via-white/40 to-transparent blur-md" />
        </span>
      </button>
    );
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-3 relative items-stretch">
      <button
        className="
          relative z-10 group flex flex-1 items-center justify-center gap-2 rounded-full
          px-6 py-3 capitalize text-white font-semibold
          bg-teal-600 border border-teal-500
          backdrop-blur-2xl
          shadow-[0_8px_30px_rgba(0,0,0,0.35)]
          hover:bg-teal-500 hover:border-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.25)]
          transition-all duration-300
          active:scale-[0.98]
          overflow-hidden
          cursor-target
        "
        onClick={() => setShowCreateModal(true)}
      >
        Create
        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
          <span className="absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-transparent via-white/40 to-transparent blur-md" />
        </span>
      </button>

      <button
        className="
          relative z-10 group flex flex-1 items-center justify-center gap-2 rounded-full
          px-6 py-3 capitalize text-white font-semibold
          bg-pink-600 border border-pink-500
          backdrop-blur-2xl
          shadow-[0_8px_30px_rgba(0,0,0,0.35)]
          hover:bg-pink-500 hover:border-pink-400 hover:shadow-[0_0_20px_rgba(236,72,153,0.25)]
          transition-all duration-300
          active:scale-[0.98]
          overflow-hidden
          cursor-target
        "
        onClick={() => setShowJoinModal(true)}
      >
        <IoPeopleOutline /> Join Team
        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
          <span className="absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-transparent via-white/40 to-transparent blur-md" />
        </span>
      </button>

      {showCreateModal && (
        <CreateTeamModal
          eventId={eventId}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      {showJoinModal && (
        <JoinTeamModal
          eventId={eventId}
          onClose={() => setShowJoinModal(false)}
        />
      )}
    </div>
  );
}
