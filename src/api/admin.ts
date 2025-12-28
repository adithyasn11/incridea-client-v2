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
