import { useState } from "react";
import { IoClose, IoPeopleOutline } from "react-icons/io5";
import { joinTeam } from "../../api/registration";
import { showToast } from "../../utils/toast";
import { useQueryClient } from "@tanstack/react-query";

export default function JoinTeamModal({
  eventId,
  onClose,
}: {
  eventId: number;
  onClose: () => void;
}) {
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Helper to parse ID if format is like T-123 or just 123
  const parseTeamId = (input: string) => {
    // Assuming input could be "T-123" or "123". Backend expects number.
    // If the user inputs "123", we use 123. If "T-123", we strip "T-".
    // But wait, existing format might be different. Let's assume raw ID for now number.
    // Original had teamIdToId utils.
    // Let's assume user enters just the number for now or clean non-numeric if simpler.
    return input.replace(/\D/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericId = parseTeamId(teamId);
    if (!numericId) {
      showToast("Invalid Team ID", "error");
      return;
    }

    setLoading(true);
    try {
      await joinTeam(Number(numericId));
      showToast("Joined team successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["my-team", eventId] });
      onClose();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to join team",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,255,255,0.15)] p-6 sm:p-8 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-500/10 before:via-fuchsia-500/8 before:to-emerald-500/10 before:blur-2xl before:-z-10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/75 hover:text-white transition-colors z-10 cursor-target"
        >
          <IoClose size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6">Join Team</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/75 mb-2">
              Team ID
            </label>
            <input
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder:text-white/40 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition-all"
              placeholder="e.g. 12345"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3 font-semibold text-white hover:from-sky-400 hover:to-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] cursor-target"
          >
            {loading ? (
              "Joining..."
            ) : (
              <>
                <IoPeopleOutline size={20} /> Join Team
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
