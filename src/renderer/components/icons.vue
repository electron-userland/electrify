<template>
  <div class="ivu-article">
    <p>Create a directory <a href="https://github.com/electron-userland/electron-builder/wiki/Options#MetadataDirectories-buildResources" target="_blank">build</a> in the root of the project and save a
    <code>background.png</code> (macOS DMG background),
    <code>icon.icns</code> (macOS app icon)
      and <code>icon.ico</code> (Windows app icon) into it.</p>

    <p>The Linux icon set will be generated automatically based on the macOS <code>icns</code> file (or you can put them into the <code>build/icons</code> directory if you want to specify them yourself.
      The filename must contain the size (e.g. <code>32x32.png</code>) of the icon).</p>
  </div>
</template>