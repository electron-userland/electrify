export interface ProjectInfoPrerequisites {
  yarn: boolean
  electronBuilder: DependencyInfo
  dependencies: { [name: string]: any}
}

export interface DependencyInfo {
  installed: boolean
  latest: string | null
}

export interface ProjectInfo {
  prerequisites: ProjectInfoPrerequisites

  metadata: ProjectMetadata
}

export interface ProjectMetadata {
  name?: string
  productName?: string
  appId?: string
  description?: string

  author?: string
}