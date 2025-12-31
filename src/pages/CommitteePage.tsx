import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  applyToCommittee,
  approveCommitteeMember,
  assignCommitteeCoHead,
  assignCommitteeHead,
  fetchCommitteeState,
  searchCommitteeUsers,
  type CommitteeName,
  type CommitteeStateResponse,
} from '../api/committee'
import apiClient from '../api/client'
import { hasRole, normalizeRoles } from '../utils/roles'
import { showToast } from '../utils/toast'
import NotFoundPage from './NotFoundPage'

function CommitteePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchTerms, setSearchTerms] = useState<Record<CommitteeName, string>>({} as Record<CommitteeName, string>)
  const [searchResults, setSearchResults] = useState<
    Record<CommitteeName, { id: number; name: string | null; email: string; phoneNumber: string }[]>
  >({} as Record<CommitteeName, { id: number; name: string | null; email: string; phoneNumber: string }[]>)
  const [searchLoading, setSearchLoading] = useState<Record<CommitteeName, boolean>>({} as Record<CommitteeName, boolean>)
  const [confirmCommittee, setConfirmCommittee] = useState<{ id: number; name: CommitteeName } | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      void navigate('/login')
      return
    }
    setToken(storedToken)

    const fetchRoles = async () => {
      try {
        const { data } = await apiClient.get<{ user?: { roles?: unknown } }>('/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        const roles = data?.user ? normalizeRoles((data.user as { roles?: unknown }).roles) : []
        setIsAdmin(hasRole(roles, 'ADMIN'))
      } catch {
        showToast('Session expired. Please log in again.', 'error')
        localStorage.removeItem('token')
        void navigate('/login')
      }
    }

    void fetchRoles()
  }, [navigate])

  const committeeStateQuery = useQuery<CommitteeStateResponse, Error>({
    queryKey: ['committee-state'],
    queryFn: () => fetchCommitteeState(token ?? ''),
    enabled: Boolean(token),
  })

  const myRole = committeeStateQuery.data?.my.role ?? null
  const committees = useMemo(() => committeeStateQuery.data?.committees ?? [], [committeeStateQuery.data])

  const refetchState = () => {
    void queryClient.invalidateQueries({ queryKey: ['committee-state'] })
  }

  const applyMutation = useMutation({
    mutationFn: (committee: CommitteeName) => applyToCommittee(committee, token ?? ''),
    onSuccess: () => {
      showToast('Applied to committee', 'success')
      setConfirmCommittee(null)
      refetchState()
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Could not apply', 'error')
    },
  })

  const approveMutation = useMutation({
    mutationFn: (membershipId: number) => approveCommitteeMember({ membershipId }, token ?? ''),
    onSuccess: () => {
      showToast('Member approved', 'success')
      refetchState()
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Could not approve member', 'error')
    },
  })

  const assignHeadMutation = useMutation({
    mutationFn: (payload: { committee: CommitteeName; email: string }) => assignCommitteeHead(payload, token ?? ''),
    onSuccess: () => {
      showToast('Head assigned', 'success')
      refetchState()
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Could not assign head', 'error')
    },
  })

  const assignCoHeadMutation = useMutation({
    mutationFn: (payload: { committee: CommitteeName; email: string }) => assignCommitteeCoHead(payload, token ?? ''),
    onSuccess: () => {
      showToast('Co-head assigned', 'success')
      refetchState()
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Could not assign co-head', 'error')
    },
  })

  const handleSearch = async (committee: CommitteeName, term: string) => {
    setSearchTerms((prev) => ({ ...prev, [committee]: term }))

    if (!token || term.trim().length < 2) {
      setSearchResults((prev) => ({ ...prev, [committee]: [] }))
      return
    }

    setSearchLoading((prev) => ({ ...prev, [committee]: true }))
    try {
      const { users } = await searchCommitteeUsers(term.trim(), token)
      setSearchResults((prev) => ({ ...prev, [committee]: users }))
    } catch (error) {
      console.error(error)
    } finally {
      setSearchLoading((prev) => ({ ...prev, [committee]: false }))
    }
  }

  if (!token) {
    return null
  }

  if (committeeStateQuery.isLoading) {
    return <div className="w-full max-w-4xl rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-200">Loading committee data…</div>
  }

  if (committeeStateQuery.isError) {
    return (
      <div className="w-full max-w-4xl rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-rose-200">
        {committeeStateQuery.error instanceof Error
          ? committeeStateQuery.error.message
          : 'Failed to load committee data.'}
      </div>
    )
  }

  const isCommitteeRegOpen = committeeStateQuery.data?.isCommitteeRegOpen ?? false

  if (!isAdmin && !isCommitteeRegOpen && myRole === null) {
    return <NotFoundPage />
  }

  const myStatus = committeeStateQuery.data?.my.status

  const renderAdminPanel = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-50">Assign Heads</h2>
      <p className="text-sm text-slate-400">Add or replace a committee head by searching for a user email.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {committees.map((committee) => (
          <div key={committee.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-100">{committee.name}</p>
              <span className="rounded-full border border-slate-700 px-2 py-1 text-[11px] text-slate-300">
                {committee.memberCount} members
              </span>
            </div>
            <div className="mt-2 space-y-1 text-xs text-slate-400">
              <p>Head: {committee.head?.name ?? '—'} {committee.head?.email ? `(${committee.head.email})` : ''}</p>
              <p>Co-Head: {committee.coHead?.name ?? '—'} {committee.coHead?.email ? `(${committee.coHead.email})` : ''}</p>
            </div>

            <div className="relative mt-3 space-y-2">
              <input
                className="input"
                placeholder="Search user by email"
                value={searchTerms[committee.name] ?? ''}
                onChange={(ev) => void handleSearch(committee.name, ev.target.value)}
              />
              {searchLoading[committee.name] ? (
                <p className="text-xs text-slate-500">Searching…</p>
              ) : null}

              {searchResults[committee.name]?.length ? (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 space-y-1 rounded-lg border border-slate-800 bg-slate-900/95 p-2 shadow-xl">
                  {searchResults[committee.name].map((user) => (
                    <button
                      type="button"
                      key={user.id}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-slate-800"
                      onClick={() =>
                        assignHeadMutation.mutate({ committee: committee.name, email: user.email })
                      }
                      disabled={assignHeadMutation.isPending}
                    >
                      <span className="font-semibold">{user.name ?? user.email}</span>
                      <span className="block text-xs text-slate-400">{user.email}</span>
                      {user.phoneNumber ? (
                        <span className="block text-[11px] text-slate-500">{user.phoneNumber}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderHeadPanel = () => {
    const myCommitteeName = committeeStateQuery.data?.my.committeeName
    const pending = committeeStateQuery.data?.pendingApplicants ?? []
    const approved = committeeStateQuery.data?.approvedMembers ?? []

    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Your Committee</p>
              <h2 className="text-lg font-semibold text-slate-50">{myCommitteeName}</h2>
            </div>
            <div className="relative w-full max-w-md">
              <p className="text-sm font-semibold text-slate-200">Add Co-Head</p>
              <input
                className="input mt-2"
                placeholder="Search by email"
                value={myCommitteeName ? searchTerms[myCommitteeName] ?? '' : ''}
                onChange={(ev) => myCommitteeName && void handleSearch(myCommitteeName, ev.target.value)}
              />
              {myCommitteeName && searchResults[myCommitteeName]?.length ? (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 space-y-1 rounded-lg border border-slate-800 bg-slate-900/95 p-2 shadow-xl">
                  {searchResults[myCommitteeName].map((user) => (
                    <button
                      type="button"
                      key={user.id}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-slate-800"
                      onClick={() =>
                        assignCoHeadMutation.mutate({ committee: myCommitteeName, email: user.email })
                      }
                      disabled={assignCoHeadMutation.isPending}
                    >
                      <span className="font-semibold">{user.name ?? user.email}</span>
                      <span className="block text-xs text-slate-400">{user.email}</span>
                      {user.phoneNumber ? (
                        <span className="block text-[11px] text-slate-500">{user.phoneNumber}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold text-slate-100">Pending Applications</h3>
            {pending.length === 0 ? <p className="text-sm text-slate-400">No pending applications.</p> : null}
            <div className="mt-3 space-y-2">
              {pending.map((member) => (
                <div
                  key={member.membershipId}
                  className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{member.name ?? 'User'}</p>
                    <p className="text-xs text-slate-400">{member.email}</p>
                    {member.phoneNumber ? (
                      <p className="text-xs text-slate-500">{member.phoneNumber}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="button sm:w-28"
                    onClick={() => approveMutation.mutate(member.membershipId)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? 'Saving…' : 'Approve'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold text-slate-100">Approved Members</h3>
            {approved.length === 0 ? <p className="text-sm text-slate-400">No approved members yet.</p> : null}
            <div className="mt-3 space-y-2">
              {approved.map((member) => (
                <div
                  key={member.membershipId}
                  className="rounded-lg border border-slate-800 bg-slate-950/40 p-3"
                >
                  <p className="text-sm font-semibold text-slate-100">{member.name ?? 'User'}</p>
                  <p className="text-xs text-slate-400">{member.email}</p>
                  {member.phoneNumber ? (
                    <p className="text-xs text-slate-500">{member.phoneNumber}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderUserPanel = () => (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-50">Choose your committee</h2>
      <p className="text-sm text-slate-400">You can apply to exactly one committee. The head must approve your request.</p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {committees.map((committee) => {
          const alreadyApplied = committeeStateQuery.data?.my.committeeId === committee.id
          const isApproved = myStatus === 'APPROVED'
          return (
            <div key={committee.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-100">{committee.name}</p>
              <p className="text-xs text-slate-400">Members: {committee.memberCount}</p>
              <button
                type="button"
                className="button w-full"
                disabled={applyMutation.isPending || alreadyApplied || isApproved}
                onClick={() => {
                  if (alreadyApplied || isApproved) {
                    return
                  }
                  setConfirmCommittee({ id: committee.id, name: committee.name })
                }}
              >
                {alreadyApplied ? (isApproved ? 'Joined' : 'Applied') : 'Apply'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <section className="w-full max-w-6xl space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Committees</p>
          <h1 className="text-2xl font-semibold text-slate-50">Committee Management</h1>
          <p className="text-sm text-slate-400">
            Registrations {isCommitteeRegOpen ? 'are open for members' : 'are closed for members'}.
          </p>
        </div>
      </div>

      {isAdmin ? renderAdminPanel() : null}
      {myRole === 'HEAD' ? renderHeadPanel() : null}
      {myRole === 'CO_HEAD' ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          You are a co-head of {committeeStateQuery.data?.my.committeeName}. No additional actions required here.
        </div>
      ) : null}

      {myRole === 'MEMBER' ? (
        <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          You have {myStatus === 'APPROVED' ? 'joined' : 'applied to'} {committeeStateQuery.data?.my.committeeName}.
        </div>
      ) : null}

      {myRole === null ? renderUserPanel() : null}

      {confirmCommittee ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Confirm</p>
                <h3 className="text-lg font-semibold text-slate-50">Apply to committee</h3>
              </div>
              <button
                type="button"
                className="text-sm text-slate-300 hover:text-sky-300"
                onClick={() => setConfirmCommittee(null)}
                disabled={applyMutation.isPending}
              >
                Close
              </button>
            </div>
            <p className="text-sm text-slate-300">
              You are about to apply to {confirmCommittee.name}. You can only apply to one committee, and the head
              must approve your request.
            </p>
            <div className="flex items-center gap-3">
              <button
                className="button"
                type="button"
                onClick={() => applyMutation.mutate(confirmCommittee.name)}
                disabled={applyMutation.isPending}
              >
                {applyMutation.isPending ? 'Applying…' : 'Confirm'}
              </button>
              <button
                className="button secondary"
                type="button"
                onClick={() => setConfirmCommittee(null)}
                disabled={applyMutation.isPending}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default CommitteePage
