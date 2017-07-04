export interface ProjectInfoPrerequisites {
  yarn: boolean
  electronBuilder: any
  dependencies: { [name: string]: any}
}

export interface ProjectInfo {
  prerequisites: ProjectInfoPrerequisites
}