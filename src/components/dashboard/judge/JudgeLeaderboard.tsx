import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCheck, FiFilter, FiSearch } from 'react-icons/fi';
import { AiOutlineClose } from "react-icons/ai";
import type { Team, JudgeRound } from "../../../api/judging";
import { promoteTeam, selectWinner, deleteWinner } from "../../../api/judging";
import { ID } from "../../../utils/id";
import { showToast } from "../../../utils/toast";

interface Props {
  teams: Team[];
  round: JudgeRound;
  isFinalRound?: boolean;
}

export default function JudgeLeaderboard({ teams, round, isFinalRound }: Props) {
  const queryClient = useQueryClient();
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<number | 'ALL'>('ALL');
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate score for a team based on current filters
  const getTeamScore = (team: Team) => {
    if (!team.Score || team.Score.length === 0) return 0;

    if (selectedCriteriaId !== 'ALL') {
      const score = team.Score.find(s => s.criteriaId === selectedCriteriaId);
      return score ? Number(score.score) || 0 : 0;
    }
    
    // Sum up all criteria scores
    return team.Score.reduce((total, s) => {
      const val = Number(s.score);
      return total + (isNaN(val) ? 0 : val);
    }, 0);
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ID.toTeamId(team.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort teams by score descending
  const sortedTeams = [...filteredTeams].sort((a, b) => {
    const scoreA = getTeamScore(a);
    const scoreB = getTeamScore(b);
    return scoreB - scoreA;
  });

  const toggleTeamSelection = (teamId: number) => {
    if (isFinalRound) {
      // Single selection for final round
      const newSelected = new Set<number>();
      if (!selectedTeamIds.has(teamId)) {
        newSelected.add(teamId);
      }
      setSelectedTeamIds(newSelected);
      return;
    }

    const newSelected = new Set(selectedTeamIds);
    if (newSelected.has(teamId)) {
      newSelected.delete(teamId);
    } else {
      newSelected.add(teamId);
    }
    setSelectedTeamIds(newSelected);
  };

  const promoteMutation = useMutation({
    mutationFn: async (teamIds: number[]) => {
      // Promote teams one by one as the API is single-item
      await Promise.all(
        teamIds.map(id => promoteTeam(round.eventId, round.roundNo, id, true))
      );
    },
    onSuccess: () => {
      showToast('Selected teams promoted successfully', 'success');
      setSelectedTeamIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['judge-teams', round.eventId, round.roundNo] });
    },
    onError: () => {
        showToast('Failed to promote some teams', 'error'); 
    }
  });

  const winnerMutation = useMutation({
      mutationFn: async ({ teamId, type }: { teamId: number, type: string }) => {
          return selectWinner(round.eventId, teamId, type)
      },
      onSuccess: () => {
           queryClient.invalidateQueries({ queryKey: ['judge-teams', round.eventId, round.roundNo] });
           showToast("Winner selected successfully", "success")
           setSelectedTeamIds(new Set());
      },
      onError: () => showToast("Failed to select winner", "error")
  })

  const deleteWinnerMutation = useMutation({
    mutationFn: async (winnerId: number) => {
        return deleteWinner(winnerId)
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['judge-teams', round.eventId, round.roundNo] });
        showToast("Winner removed", "success")
    },
    onError: () => showToast("Failed to remove winner", "error")
  });

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-10 rounded-t-lg bg-slate-800 p-4 shadow-sm border-b border-slate-700 space-y-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search by name or PID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg bg-slate-900/50 border border-slate-700 px-4 pr-10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <FiSearch
            className="absolute right-3 top-3 text-slate-400"
          />
        </div>

        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-white">Total Score</h2>
                {selectedCriteriaId !== 'ALL' && <p className="text-xs text-indigo-400">Filtered by: {round.Criteria.find(c => c.id === selectedCriteriaId)?.name}</p>}
            </div>
            
            {/* Criteria Filter */}
            <div className="relative">
                <select
                    value={selectedCriteriaId}
                    onChange={(e) => setSelectedCriteriaId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2 pl-8 appearance-none cursor-pointer"
                >
                    <option value="ALL">All Criteria</option>
                    {round.Criteria.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <FiFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
        </div>
        
        {/* Bulk Actions */}
        <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="text-sm text-slate-400">{selectedTeamIds.size} selected</p>
             
            {isFinalRound ? (
                <div className="flex gap-2">
                     {/* Winner */}
                     {(() => {
                         const winnerTeam = teams.find(t => t.Winners?.some(w => w.type === 'WINNER'));
                         const winnerObj = winnerTeam?.Winners?.find(w => w.type === 'WINNER');

                         if (winnerTeam && winnerObj) {
                             return (
                                 <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-3 py-1.5">
                                     <span className="text-xs font-bold text-yellow-500">WINNER: {winnerTeam.name}</span>
                                     <button
                                        onClick={() => deleteWinnerMutation.mutate(winnerObj.id)}
                                        disabled={deleteWinnerMutation.isPending}
                                        className="text-yellow-500 hover:text-yellow-400 disabled:opacity-50"
                                     >
                                         <AiOutlineClose size={12} />
                                     </button>
                                 </div>
                             );
                         }

                         return (
                            <button
                                onClick={() => {
                                    const teamId = Array.from(selectedTeamIds)[0];
                                    if(teamId) winnerMutation.mutate({ teamId, type: 'WINNER' });
                                }}
                                disabled={selectedTeamIds.size !== 1 || winnerMutation.isPending}
                                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:hover:bg-yellow-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
                            >
                                Winner
                            </button>
                         );
                     })()}

                     {/* 1st Runner Up */}
                     {(() => {
                         const runnerUpTeam = teams.find(t => t.Winners?.some(w => w.type === 'RUNNER_UP'));
                         const runnerUpObj = runnerUpTeam?.Winners?.find(w => w.type === 'RUNNER_UP');

                         if (runnerUpTeam && runnerUpObj) {
                             return (
                                 <div className="flex items-center gap-2 bg-gray-400/20 border border-gray-400/50 rounded-lg px-3 py-1.5">
                                     <span className="text-xs font-bold text-gray-400">1st Runner Up: {runnerUpTeam.name}</span>
                                     <button
                                        onClick={() => deleteWinnerMutation.mutate(runnerUpObj.id)}
                                        disabled={deleteWinnerMutation.isPending}
                                        className="text-gray-400 hover:text-gray-300 disabled:opacity-50"
                                     >
                                         <AiOutlineClose size={12} />
                                     </button>
                                 </div>
                             );
                         }

                         return (
                            <button
                                onClick={() => {
                                    const teamId = Array.from(selectedTeamIds)[0];
                                    if(teamId) winnerMutation.mutate({ teamId, type: 'RUNNER_UP' });
                                }}
                                disabled={selectedTeamIds.size !== 1 || winnerMutation.isPending}
                                className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:hover:bg-gray-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
                            >
                                1st Runner Up
                            </button>
                         );
                     })()}

                     {/* 2nd Runner Up */}
                     {(() => {
                         const secondRunnerUpTeam = teams.find(t => t.Winners?.some(w => w.type === 'SECOND_RUNNER_UP'));
                         const secondRunnerUpObj = secondRunnerUpTeam?.Winners?.find(w => w.type === 'SECOND_RUNNER_UP');

                         if (secondRunnerUpTeam && secondRunnerUpObj) {
                             return (
                                 <div className="flex items-center gap-2 bg-orange-700/20 border border-orange-700/50 rounded-lg px-3 py-1.5">
                                     <span className="text-xs font-bold text-orange-700">2nd Runner Up: {secondRunnerUpTeam.name}</span>
                                     <button
                                        onClick={() => deleteWinnerMutation.mutate(secondRunnerUpObj.id)}
                                        disabled={deleteWinnerMutation.isPending}
                                        className="text-orange-700 hover:text-orange-600 disabled:opacity-50"
                                     >
                                         <AiOutlineClose size={12} />
                                     </button>
                                 </div>
                             );
                         }

                         return (
                            <button
                                onClick={() => {
                                    const teamId = Array.from(selectedTeamIds)[0];
                                    if(teamId) winnerMutation.mutate({ teamId, type: 'SECOND_RUNNER_UP' });
                                }}
                                disabled={selectedTeamIds.size !== 1 || winnerMutation.isPending}
                                className="bg-orange-700 hover:bg-orange-800 disabled:opacity-50 disabled:hover:bg-orange-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
                            >
                                2nd Runner Up
                            </button>
                         );
                     })()}
                </div>
            ) : (
                <div className="flex flex-col items-end gap-1">
                    <button
                        onClick={() => promoteMutation.mutate(Array.from(selectedTeamIds))}
                        disabled={selectedTeamIds.size === 0 || promoteMutation.isPending || !teams.every(t => round.Criteria.every(c => t.Score?.some(s => s.criteriaId === c.id)))}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-sm font-semibold py-1.5 px-4 rounded-lg transition-colors flex items-center gap-2"
                        title={!teams.every(t => round.Criteria.every(c => t.Score?.some(s => s.criteriaId === c.id))) ? "Score all criteria for all teams first" : "Promote selected teams"}
                    >
                        {promoteMutation.isPending ? 'Promoting...' : 'Promote to Next Round'}
                    </button>
                    {!teams.every(t => round.Criteria.every(c => t.Score?.some(s => s.criteriaId === c.id))) && (
                         <p className="text-[10px] text-red-400">Score all criteria for all teams to promote</p>
                    )}
                </div>
            )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-2 py-2">
        {sortedTeams.length > 0 ? (
          sortedTeams.map((team, index) => {
            const isSelected = selectedTeamIds.has(team.id);

            return (
              <div
                key={team.id}
                onClick={() => toggleTeamSelection(team.id)}
                className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected 
                    ? 'bg-indigo-900/20 border-indigo-500/50' 
                    : 'bg-slate-800/50 border-transparent hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                    {/* Checkbox/Radio UI */}
                    <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                        isFinalRound ? 'rounded-full' : 'rounded'
                    } ${
                        isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 bg-slate-900'
                    }`}>
                        {isSelected && <FiCheck className="text-white w-3.5 h-3.5" />}
                    </div>

                    <span className={`text-sm font-bold w-6 text-center ${index < 3 ? 'text-yellow-400' : 'text-slate-500'}`}>
                        #{index + 1}
                    </span>
                    <div>
                        <p className={`font-medium transition-colors ${isSelected ? 'text-indigo-200' : 'text-white'}`}>
                            {team.Winners?.some(w => w.type === 'WINNER') && <span className="mr-2 rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-bold text-yellow-500">WINNER</span>}
                            {team.Winners?.some(w => w.type === 'RUNNER_UP') && <span className="mr-2 rounded bg-gray-400/20 px-1.5 py-0.5 text-[10px] font-bold text-gray-400">1st Runner Up</span>}
                            {team.Winners?.some(w => w.type === 'SECOND_RUNNER_UP') && <span className="mr-2 rounded bg-orange-700/20 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">2nd Runner Up</span>}
                            {team.name}
                        </p>
                        <p className="text-xs text-slate-400">{ID.toTeamId(team.id)}</p>
                    </div>
                </div>
                
                <div className="text-right flex flex-col gap-0.5">
                    <p className="text-lg font-bold text-white mb-1">{getTeamScore(team)}</p>
                    {/* Hide breakdown if filtered, or show only relevant? Design choice: Hide detail if filtered to avoid confusion, or show all. Let's show relevant logic. */}
                    {selectedCriteriaId === 'ALL' && round.Criteria.map((criterion) => {
                      const scoreVal = team.Score?.find((s) => s.criteriaId === criterion.id)?.score;
                      return (
                        <p key={criterion.id} className="text-xs text-slate-300">
                          <span className="opacity-70 mr-2">{criterion.name}:</span>
                          <span className="font-bold text-white">{scoreVal ?? "-"}</span>
                        </p>
                      );
                    })}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-slate-500 py-4">No teams found.</p>
        )}
      </div>
    </div>
  );
}

