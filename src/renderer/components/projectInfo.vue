<style>
  input {
    width: 20em !important
  }
</style>
<template>
  <Form :label-width="100">
    <Form-item label="Author">
      <Input placeholder="Your Name or Foo, Inc"/>
    </Form-item>
    <Form-item label="App ID">
      <Tooltip>
        <div slot="content">
          <p style="white-space: normal;">
            Used as <a href="https://developer.apple.com/library/ios/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/20001431-102070" target="_blank">CFBundleIdentifier</a> for MacOS and as
            <a href="https://msdn.microsoft.com/en-us/library/windows/desktop/dd378459(v=vs.85).aspx" target="_blank">Application User Model ID</a>
            for Windows (NSIS target only, Squirrel.Windows not supported). It is strongly recommended that an explicit ID be set.
          </p>
        </div>
        <Input placeholder="com.electron.appName"/>

      </Tooltip>
    </Form-item>
    <Form-item label="Name" required="true">
      <Tooltip>
        <div slot="content">
          <p style="white-space: normal;">
            As <a href="https://docs.npmjs.com/files/package.json#name" target="_blank">package name</a>.</p>
        </div>
        <Input/>
      </Tooltip>
    </Form-item>
    <Form-item label="Product Name">
      <Tooltip>
        <div slot="content">
          <p style="white-space: normal;">
            As name, but allows to specify a product name for your app which contains spaces and other special characters not allowed in the name property.</p>
        </div>
        <Input/>
      </Tooltip>
    </Form-item>
    <Form-item label="Description">
      <Input type="textarea"/>
    </Form-item>
    <Form-item>
      <Button type="primary">Apply</Button>
    </Form-item>
  </Form>
</template>
<script lang="ts" src="./projectInfo.ts"></script>