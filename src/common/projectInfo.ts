export interface ProjectInfoPrerequisites {
  yarn: boolean
  electronBuilder: any
  dependencies: { [name: string]: any}
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
}