export interface LogsRoot {
  status: boolean
  logData?: Logs[]
  page: number
  pages: number
  rowCount: number
}

export interface Logs {
  id: string
  title: string
  description: string
  date: string
  __v: number
}
