export { rewriteBaseUrl }

/**
 * Replaces Postman placeholders `{{baseUrl}}` with `{{<baseUrlKeyName>}}` everywhere in the
 * collection JSON, and renames the auto-generated root collection variable from `baseUrl` to
 * `baseUrlKeyName`.
 */
function rewriteBaseUrl(
  collection: Record<string, unknown>,
  baseUrlKeyName: string
): Record<string, unknown> {
  const swapped = JSON.parse(
    JSON.stringify(collection).replace(
      /\{\{baseUrl\}\}/g,
      `{{${baseUrlKeyName}}}`
    )
  ) as Record<string, unknown>

  if (!Array.isArray(swapped.variable)) {
    return swapped
  }

  for (const v of swapped.variable) {
    if (
      typeof v === 'object' &&
      v !== null &&
      'key' in v &&
      (v as { key: unknown }).key === 'baseUrl'
    ) {
      ;(v as { key: string }).key = baseUrlKeyName
    }
  }

  return swapped
}
