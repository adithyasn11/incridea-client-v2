export function normalizeRoles(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return []
  }

  const normalized = input
    .filter((role): role is string => typeof role === 'string')
    .map((role) => role.trim())
    .filter(Boolean)

  return Array.from(new Set(normalized))
}

export function hasRole(roles: unknown, target: string): boolean {
  return normalizeRoles(roles).includes(target)
}
