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
      <div class="header-title">Project description:</div>
      <vue-editor v-model="folderDescription" class="folder-description"></vue-editor>
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
    validateSettings() {
      if (this.folderName === "") {
        this.$message.error("Name cannot be empty.");
        return false;
      }

      //Validate that something has changed
      if (
        this.folderName === this.folder.name &&
        this.folderDescription === this.folder.description &&
        this.folderStartDate === this.folder.startDate &&
        this.folderEndDate === this.folder.endDate
      ) {
        this.$message({
          message: "There are no new chages.",
          type: "warning"
        });
        return false;
      }

      //Validate date settings
      const startDate = moment(this.folderStartDate).startOf("day");
      const endDate = moment(this.folderEndDate).startOf("day");
      if (!startDate.isBefore(endDate)) {
        this.$message.error("Start date must be before end date.");
        return false;
      }

      return true;
    },
    updateFolder(e) {
      if (!this.validateSettings()) {
        this.cancel(e);
        return;
      }
      this.$apollo
        .mutate({
          mutation: UpdateFolder,
          variables: {
            id: this.folder.id,
            input: {
              name: this.folderName,
              description: this.folderDescription,
              startDate: moment(this.folderStartDate)
                .startOf("day")
                .toDate(),
              endDate: moment(this.folderEndDate)
                .startOf("day")
                .toDate()
            }
          }
        })
        .then(() => {
          this.$message({
            message: "Your changes have been saved.",
            type: "success"
          });
          this.cancel(e);
        })
        .catch(error => {
          this.$message.error("Error while saving.");
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
.folder-description {
  margin: 2px 0;
  width: 100%;
  background-color: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 4px;
  overflow: auto;
}
</style>