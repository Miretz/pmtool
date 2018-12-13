<template>
  <div class="white card">
    <div class="folder-header">
      <div class="folder-name">
        <el-row>
          <el-col :span="18">
            <form @submit.prevent="updateFolder">
              <input
                class="no-outline"
                type="text"
                name="taskname"
                ref="taskname"
                v-model="folderName"
                @keyup.esc="cancel"
              >
            </form>
          </el-col>
          <el-col :span="6">
            <div class="float-right">
              <el-button @click="hideEditor" icon="el-icon-close"></el-button>
            </div>
          </el-col>
        </el-row>
      </div>
      <h3>Project details</h3>
      <div class="header-title">Project description:</div>
      <vue-editor v-model="folderDescription"></vue-editor>
      <el-row>
        <el-col :span="6">
          <div class="header-title">Start date:</div>
        </el-col>
        <el-col :span="18">
          <datepicker
            :value="folderStartDate"
            :format="customFormatter"
            name="startDatePk"
            id="startDatePk"
            v-model="folderStartDate"
          ></datepicker>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <div class="header-title">End date:</div>
        </el-col>
        <el-col :span="18">
          <datepicker
            :value="folderEndDate"
            :format="customFormatter"
            name="endDatePk"
            id="endDatePk"
            v-model="folderEndDate"
          ></datepicker>
        </el-col>
      </el-row>
      <br>
      <el-row>
        <el-col :span="24">
          <el-button type="primary" @click="updateFolder" icon="el-icon-check">Save</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import { UpdateFolder } from "../constants/query.gql";
import Datepicker from "vuejs-datepicker";
import moment from "moment";
import { VueEditor } from "vue2-editor";
export default {
  components: {
    Datepicker,
    VueEditor
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
      if (name === "") {
        this.cancel(e);
        return;
      }
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
    },
    hideEditor: function() {
      this.$emit("hideEditor");
    }
  }
};
</script>
<style scoped>
.folder-header {
  padding: 15px 24px 0;
  min-height: 40px;
  margin-bottom: 20px;
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
  margin: 20px 0;
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
.float-right {
  float: right;
}
</style>