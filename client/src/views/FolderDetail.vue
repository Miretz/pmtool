<template>
  <div class="white card max-height">
    <div class="folder-header">
      <form @submit.prevent="updateFolder">
        <input class="no-outline header-title folder-name" type="text" name="taskname" ref="taskname" v-model="folderName" @keyup.esc="cancel" />
      </form>
      <form @submit.prevent="updateFolder">
        <textarea class="no-outline header-title folder-description" rows="4" name="taskdesc" ref="taskdesc" v-model="folderDescription" />
        <button class="btn btn-large"><i class="fa fa-save"></i>&nbsp;Save</button>
      </form>
    </div>
  </div>
</template>
<script>
import { UpdateFolder } from '../constants/query.gql'
export default {
  data() {
    return {
      folderName: this.folder.name,
      folderDescription: this.folder.description,
    }
  },
  props: ['folder'],
  mounted() {
    document.title = `${this.folder.name} - pmtool`
  },
  methods: {
    updateFolder(e) {
      const name = this.folderName
      const description = this.folderDescription
      if (name === this.folder.name && description === this.folder.description) {
        this.cancel(e)
        return
      }
      this.$apollo.mutate({
        mutation: UpdateFolder,
        variables: { id: this.folder.id, input: {name: name, description: description} },
      }).then(() => {
        this.cancel(e)
      }).catch((error) => {
        console.log(error)
      })
    },
    cancel(e) {
      e.target.blur()
    }
  }
}
</script>
<style scoped>
.folder-header {
  padding: 15px 24px 0;
  line-height: 21px;
  min-height: 40px;
}
.folder-statebar {
  display: flex;
  height: 48px;
  position: relative;
  padding: 0 24px;
  border-bottom: solid 1px;
  border-color: rgba(0, 0, 0, 0.16);
}
.folder-name {
  padding: 0;
  margin: 5px 0;
  height: 32px;
  width: 100%;
}
.shared-with {
  padding-left: 7px;
}
.subfolder:hover {
  color: initial;
  cursor: default;
}
/*tooltip*/
.member-avatar {
  margin-right: 8px;
  cursor: pointer;
}
.member-avatar:hover .remove-button {
  visibility: visible;
}
.tooltip .tooltip-content {
  width: 278px;
  left: 50%;
  margin-left: -139px;
}
.search-input {
  padding: 15px;
}
.contact-picker-item-list {
  padding-bottom: 24px;
  max-height: 295px;
  overflow: auto;
}
.group-field {
  box-sizing: border-box;
  padding: 15px;
}
.add-additional {
  display: flex;
  flex-direction: row;
}
.label {
  text-align: left;
}
</style>