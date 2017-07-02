export interface ProjectInfoPrerequisites {
  yarn: boolean
  dependencies: { [name: string]: any}
}

export interface ProjectInfo {
  prerequisites: ProjectInfoPrerequisites
}