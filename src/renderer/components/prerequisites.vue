<template>
  <div>
    <Card>
      <div slot="title">yarn
        <Tag v-if="yarn" color="green">Installed</Tag>
        <template v-else>
          <a href="https://yarnpkg.com/en/docs/install/" target="_blank"><Tag color="yellow">Not installed</Tag></a>
          Please <a href="https://yarnpkg.com/en/docs/install/" target="_blank">install.</a>
        </template>
      </div>
      <p><a href="https://yarnpkg.com/" target="_blank">Yarn</a> offers fast and reliable build, with reduced application size.</p>
      <ul>
        <li>-&nbsp;&nbsp;npm is unreliable and slow,</li>
        <li>-&nbsp;&nbsp;npm doesn't produce ideal dependency tree,</li>
        <li>-&nbsp;&nbsp;npm doesn't perform automatic deduplication and cleaning.</li>
      </ul>
    </Card>
  </div>
  <!--<Steps direction="vertical">-->
    <!--<Step title="Yarn" status="wait">-->
      <!--<template slot="content">-->
      <!--<ul>-->
        <!--<li>npm is unreliable and slow</li>-->
        <!--<li>npm doesn't produce ideal file tree</li>-->
        <!--<li>npm doesn't perform automatic deduplication and cleaning</li>-->
      <!--</ul>-->
      <!--</template>-->
    <!--</Step>-->
    <!--<Step title="electron-builder" content="wef" status="finish"></Step>-->
    <!--<Step title="electron-builder" content="wef" status="wait"></Step>-->
  <!--</Steps>-->
</template>

<script lang="ts">
  export default {
    data: function () {
      return {
        yarn: false
      }
    },
  }
</script>