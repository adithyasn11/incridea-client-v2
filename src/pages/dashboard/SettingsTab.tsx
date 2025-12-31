import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { Setting, SettingsResponse } from '../../api/admin'

export interface SettingsTabProps {
  settingsQuery: UseQueryResult<SettingsResponse, Error>
  settings: Setting[]
  updateSettingMutation: UseMutationResult<unknown, Error, { key: string; value: boolean }>
}

function SettingsTab({ settingsQuery, settings, updateSettingMutation }: SettingsTabProps) {
  return (
    <div className="space-y-4">
      {settingsQuery.isError ? (
        <p className="text-sm text-rose-300">
          {settingsQuery.error instanceof Error ? settingsQuery.error.message : 'Failed to load settings.'}
        </p>
      ) : null}
      {settings.length === 0 ? <p className="text-sm text-slate-300">No settings found.</p> : null}
      {settings.map((setting) => (
        <div
          key={setting.key}
          className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold text-slate-100">{setting.key}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-slate-400">{setting.value ? 'On' : 'Off'}</span>
            <button
              type="button"
              aria-pressed={setting.value}
              onClick={() => updateSettingMutation.mutate({ key: setting.key, value: !setting.value })}
              disabled={updateSettingMutation.isPending}
              className={`relative inline-flex h-7 w-12 items-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                setting.value ? 'border-sky-300/70 bg-sky-500/70' : 'border-slate-700 bg-slate-800'
              } ${updateSettingMutation.isPending ? 'cursor-not-allowed opacity-60' : 'hover:border-sky-300'}`}
            >
              <span className="sr-only">Toggle {setting.key}</span>
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow transition ${
                  setting.value ? 'translate-x-6 bg-white' : 'translate-x-1 bg-slate-300'
                }`}
              />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SettingsTab
