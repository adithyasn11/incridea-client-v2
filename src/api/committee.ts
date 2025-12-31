import apiClient from './client'

export type CommitteeName =
  | 'MEDIA'
  | 'SOCIAL_MEDIA'
  | 'THORANA'
  | 'EVENT_MANAGEMENT'
  | 'ACCOMMODATION'
  | 'DIGITAL'
  | 'INAUGURAL'
  | 'CREW'
  | 'HOUSE_KEEPING'
  | 'FOOD'
  | 'TRANSPORT'
  | 'PUBLICITY'
  | 'DOCUMENTATION'
  | 'FINANCE'
  | 'CULTURAL'
  | 'REQUIREMENTS'
  | 'DISCIPLINARY'
  | 'TECHNICAL'
  | 'JURY'

export type CommitteeRole = 'HEAD' | 'CO_HEAD' | 'MEMBER' | null
export type CommitteeMembershipStatus = 'PENDING' | 'APPROVED'

export interface CommitteeStateResponse {
  isCommitteeRegOpen: boolean
  committees: {
    id: number
    name: CommitteeName
    head: { id: number; name: string | null; email: string } | null
    coHead: { id: number; name: string | null; email: string } | null
    memberCount: number
  }[]
  my: {
    role: CommitteeRole
    committeeId: number | null
    committeeName: CommitteeName | null
    status: CommitteeMembershipStatus | null
  }
  pendingApplicants: {
    membershipId: number
    userId: number
    name: string | null
    email: string
    phoneNumber: string
    status: CommitteeMembershipStatus
  }[]
  approvedMembers: {
    membershipId: number
    userId: number
    name: string | null
    email: string
    phoneNumber: string
    status: CommitteeMembershipStatus
  }[]
}

export async function fetchCommitteeState(token: string): Promise<CommitteeStateResponse> {
  const response = await apiClient.get<CommitteeStateResponse>('/committee/state', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function applyToCommittee(
  committee: CommitteeName,
  token: string,
): Promise<{ membership: { id: number; status: CommitteeMembershipStatus; committeeId: number; committeeName: CommitteeName }; message: string }> {
  const response = await apiClient.post(
    '/committee/apply',
    { committee },
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response.data as {
    membership: { id: number; status: CommitteeMembershipStatus; committeeId: number; committeeName: CommitteeName }
    message: string
  }
}

export async function assignCommitteeHead(
  payload: { committee: CommitteeName; email: string },
  token: string,
): Promise<{ committee: { id: number; name: CommitteeName; head: { id: number; name: string | null; email: string } | null; coHead: { id: number; name: string | null; email: string } | null }; message: string }> {
  const response = await apiClient.post('/committee/assign-head', payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data as {
    committee: {
      id: number
      name: CommitteeName
      head: { id: number; name: string | null; email: string } | null
      coHead: { id: number; name: string | null; email: string } | null
    }
    message: string
  }
}

export async function assignCommitteeCoHead(
  payload: { committee: CommitteeName; email: string },
  token: string,
): Promise<{ committee: { id: number; name: CommitteeName; head: { id: number; name: string | null; email: string } | null; coHead: { id: number; name: string | null; email: string } | null }; message: string }> {
  const response = await apiClient.post('/committee/assign-cohead', payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data as {
    committee: {
      id: number
      name: CommitteeName
      head: { id: number; name: string | null; email: string } | null
      coHead: { id: number; name: string | null; email: string } | null
    }
    message: string
  }
}

export async function approveCommitteeMember(
  payload: { membershipId: number },
  token: string,
): Promise<{ membership: { id: number; status: CommitteeMembershipStatus; user: { id: number; name: string | null; email: string; phoneNumber: string } }; message: string }> {
  const response = await apiClient.post('/committee/approve-member', payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data as {
    membership: {
      id: number
      status: CommitteeMembershipStatus
      user: { id: number; name: string | null; email: string; phoneNumber: string }
    }
    message: string
  }
}

export async function searchCommitteeUsers(
  query: string,
  token: string,
): Promise<{ users: { id: number; name: string | null; email: string; phoneNumber: string }[] }> {
  const response = await apiClient.get<{ users: { id: number; name: string | null; email: string; phoneNumber: string }[] }>(
    '/committee/users',
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query },
    },
  )
  return response.data
}
