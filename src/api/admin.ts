import apiClient from './client'

export interface Setting {
  id: number
  key: string
  value: boolean
}

export interface Variable {
  id: number
  key: string
  value: string
}

export interface SettingsResponse {
  settings: Setting[]
}

export interface SettingResponse {
  setting: Setting
}

export interface VariablesResponse {
  variables: Variable[]
}

export interface VariableResponse {
  variable: Variable
}

export interface AdminUser {
  id: number
  name: string | null
  email: string
  phoneNumber: string
  roles: string[]
}

export interface AdminUsersResponse {
  users: AdminUser[]
  availableRoles: string[]
}

export interface WebLogUser {
  id: number
  name: string | null
  email: string
}

export interface WebLog {
  id: number
  message: string
  createdAt: string
  user: WebLogUser | null
}

export interface WebLogsResponse {
  logs: WebLog[]
  total: number
  page: number
  pageSize: number
}

function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export async function fetchSettings(token: string): Promise<SettingsResponse> {
  const { data } = await apiClient.get<SettingsResponse>('/admin/settings', authHeader(token))
  return data
}

export async function updateSetting(
  key: string,
  value: boolean,
  token: string,
): Promise<SettingResponse> {
  const { data } = await apiClient.put<SettingResponse>(
    `/admin/settings/${encodeURIComponent(key)}`,
    { value },
    authHeader(token),
  )
  return data
}

export async function fetchVariables(token: string): Promise<VariablesResponse> {
  const { data } = await apiClient.get<VariablesResponse>('/admin/variables', authHeader(token))
  return data
}

export async function upsertVariable(
  key: string,
  value: string,
  token: string,
): Promise<VariableResponse> {
  const { data } = await apiClient.put<VariableResponse>(
    `/admin/variables/${encodeURIComponent(key)}`,
    { value },
    authHeader(token),
  )
  return data
}

export async function fetchAdminUsers(search: string, token: string): Promise<AdminUsersResponse> {
  const { data } = await apiClient.get<AdminUsersResponse>('/admin/users', {
    ...authHeader(token),
    params: search ? { q: search } : undefined,
  })
  return data
}

export async function updateUserRoles(
  userId: number,
  roles: string[],
  token: string,
): Promise<{ user: { id: number; roles: string[] }; message: string }> {
  const { data } = await apiClient.put<{ user: { id: number; roles: string[] }; message: string }>(
    `/admin/users/${userId}/roles`,
    { roles },
    authHeader(token),
  )
  return data
}

export async function fetchWebLogs(token: string, page = 1, pageSize = 50): Promise<WebLogsResponse> {
  const { data } = await apiClient.get<WebLogsResponse>('/admin/logs', {
    ...authHeader(token),
    params: { page, pageSize },
  })
  return data
}
