<template>
  <div class="white card max-height">
    <div class="folder-header">
      <form @submit.prevent="updateFolder">
        <input
          class="no-outline folder-name"
          type="text"
          name="taskname"
          ref="taskname"
          v-model="folderName"
          @keyup.esc="cancel"
        >
      </form>
      <div class="header-title">Project description:</div>
      <textarea
        class="header-title folder-description"
        placeholder="Please describe your project"
        rows="8"
        name="taskdesc"
        ref="taskdesc"
        v-model="folderDescription"
        @keyup.esc="cancel"
      />
      <div class="col-25">
        <div class="header-title">Project start date:</div>
      </div>
      <div class="col-75">
        <datepicker
          :value="folderStartDate"
          :format="customFormatter"
          name="startDatePk"
          id="startDatePk"
          v-model="folderStartDate"
        ></datepicker>
      </div>
      <div class="col-25">
        <div class="header-title">Project end date:</div>
      </div>
      <div class="col-75">
        <datepicker
          :value="folderEndDate"
          :format="customFormatter"
          name="endDatePk"
          id="endDatePk"
          v-model="folderEndDate"
        ></datepicker>
      </div>
      <br>
      <el-button type="primary" @click="updateFolder">
        <i class="fa fa-save"></i>&nbsp;Save
      </el-button>
    </div>
  </div>
</template>
<script>
import { UpdateFolder } from "../constants/query.gql";
import Datepicker from "vuejs-datepicker";
import moment from "moment";
export default {
  components: {
    Datepicker
  },
  data() {
    return {
      folderName: this.folder.name,
      folderDescription: this.folder.description,
      folderStartDate: this.folder.startDate,
      folderEndDate: this.folder.endDate
    };
  },
  props: ["folder"],
  mounted() {
    document.title = `${this.folder.name} - pmtool`;
  },
  methods: {
    updateFolder(e) {
      const name = this.folderName;
      const description = this.folderDescription;
      const startDate = this.folderStartDate;
      const endDate = this.folderEndDate;
      if (
        name === this.folder.name &&
        description === this.folder.description &&
        startDate === this.folder.startDate &&
        endDate === this.folder.endDate
      ) {
        this.cancel(e);
        return;
      }
      this.$apollo
        .mutate({
          mutation: UpdateFolder,
          variables: {
            id: this.folder.id,
            input: { name, description, startDate, endDate }
          }
        })
        .then(() => {
          this.cancel(e);
        })
        .catch(error => {
          console.log(error);
        });
    },
    cancel(e) {
      e.target.blur();
    },
    customFormatter(value) {
      return moment(value).format(`${process.env.VUE_APP_DATE_FORMAT}`);
    }
  }
};
</script>
<style scoped>
.folder-header {
  padding: 15px 24px 0;
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
  margin: 40px 0;
  height: auto;
  width: 100%;
  font-size: xx-large;
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