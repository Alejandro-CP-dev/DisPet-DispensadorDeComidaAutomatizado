type ClaseCondicional = string | false | null | undefined

export function cx(...clases: ClaseCondicional[]): string {
  return clases.filter((clase): clase is string => Boolean(clase)).join(' ')
}
