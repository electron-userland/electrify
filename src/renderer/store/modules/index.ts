/**
 * The file enables `@/store/index.js` to import all vuex modules
 * in a one-shot manner. There should not be any reason to edit this file.
 */

const files: any = (require as any).context(".", false, /\.ts$/)
const modules: any = {}

for (const key of files.keys()) {
  if (key.startsWith("./index.")) {
    break
  }

  modules[key.replace(/(\.\/|\.js\.ts)/g, "")] = files(key).default
}

export default modules
