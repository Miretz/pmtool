<template>
  <el-row>
    <el-col :span="showEditor ? 12 : 24">
      <div class="white card">
        <div class="folder-header">
          <div class="folder-name">
            <div
              class="backlink"
              :model="folder"
              v-if="hasParent"
              @click.left.stop="$router.push({name: 'folder', params: {id: folder.parent }})"
            >
              <i class="fas fa-arrow-left"></i>&nbsp;
            </div>
            {{folder.name}}
            <div class="float-right" v-if="!isTeam(folder) && subRoute==='folder'">
              <!-- Project status dropdown -->
              <el-dropdown @command="handleStatusChange">
                <el-button
                  type="plain"
                  v-bind:style="{ backgroundColor: status.color, marginRight: '4px', border: 'none' }"
                >
                  {{status.name}}
                  <i class="el-icon-arrow-down el-icon--right"/>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="status in getStatuses"
                    :key="status.id"
                    :command="status.id"
                    :style="{ 'background-color': status.color}"
                  >{{status.name}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <!-- Edit button -->
              <el-button @click="toggleEditor" icon="el-icon-edit"></el-button>
            </div>
          </div>
          <el-collapse v-model="activeNames">
            <el-collapse-item title="Project Details" name="details">
              <div class="header-title" v-if="!isTeam(folder) && subRoute==='folder'">
                <el-row>
                  <el-col :span="24">
                    <div class="header-title">Project description:</div>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="24">
                    <vue-editor
                      v-model="folderDescription"
                      :editorToolbar="[]"
                      :disabled="true"
                      :editorOptions="editorSettings"
                      class="folder-description"
                    ></vue-editor>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="6">
                    <div class="header-title">Created by:</div>
                  </el-col>
                  <el-col :span="18">
                    <div class="header-title">{{createdBy}}</div>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="6">
                    <div class="header-title">Project status:</div>
                  </el-col>
                  <el-col :span="18">
                    <div class="header-title">{{folder.status.name}}</div>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="6">
                    <div class="header-title">Start date:</div>
                  </el-col>
                  <el-col :span="18">
                    <div class="header-title">{{folder.startDate | formatDate}}</div>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="6">
                    <div class="header-title">End date:</div>
                  </el-col>
                  <el-col :span="18">
                    <div class="header-title">{{folder.endDate | formatDate}}</div>
                  </el-col>
                </el-row>
              </div>
            </el-collapse-item>
            <el-collapse-item title="Project Teams" name="teams">
              <FolderTeams :key="'teams_' + folder.id" :model="folder"></FolderTeams>
            </el-collapse-item>
            <el-collapse-item title="Project Progress" name="progress">
              <FolderGantt :key="'gantt_' + folder.id" :model="folder"></FolderGantt>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-col>
    <el-col v-if="!isTeam(folder) && subRoute==='folder' && showEditor" :span="12">
      <FolderDetail :folder="folder" @hideEditor="toggleEditor"></FolderDetail>
    </el-col>
  </el-row>
</template>
<script>
import { mapState } from "vuex";
import {
  GetFolder,
  GetUserById,
  GetStatuses,
  UpdateFolder
} from "../constants/query.gql";
import FolderDetail from "./FolderDetail.vue";
import { VueEditor } from "vue2-editor";
import FolderGantt from "@/components/FolderGantt";
import FolderTeams from "@/components/FolderTeams";
export default {
  components: {
    FolderDetail,
    VueEditor,
    FolderGantt,
    FolderTeams
  },
  computed: {
    hasParent: function() {
      return this.folder.parent !== null;
    },
    ...mapState(["activeWidget"])
  },
  beforeRouteUpdate(to, from, next) {
    this.subRoute = to.name;
    next();
  },
  data() {
    return {
      subRoute: "folder",
      folderName: "",
      folderDescription: "",
      folder: {
        shareWith: []
      },
      startDate: "",
      endDate: "",
      createdBy: "",
      showEditor: localStorage.getItem("show-editor") === "true",
      editorSettings: {
        modules: { toolbar: false }
      },
      activeNames: ["progress"],
      status: {},
      getStatuses: []
    };
  },
  apollo: {
    getFolder: {
      query: GetFolder,
      variables() {
        return { id: this.$route.params.id };
      },
      result({ data: { getFolder } }) {
        this.folder = getFolder;
        this.folderName = this.folder.name;
        this.folderDescription =
          this.folder.description === ""
            ? "Project description is empty.\n"
            : this.folder.description;
        if (this.isTeam) {
          document.title = `${this.folder.name} - pmtool`;
        }
        this.status = this.folder.status;
      }
    },
    getUserById: {
      query: GetUserById,
      skip() {
        return this.folder.createdBy == null || this.folder.createdBy === "";
      },
      variables() {
        return { id: this.folder.createdBy };
      },
      result({ data: { getUserById } }) {
        const user = getUserById;
        this.createdBy = `${user.name} (${user.jobTitle})`;
      }
    },
    getStatuses: {
      query: GetStatuses
    }
  },
  methods: {
    isTeam(folder) {
      return !folder.parent && folder.shareWith.length === 0;
    },
    toggleEditor: function() {
      this.showEditor = !this.showEditor;
      // unroll details if they are currently hidden
      if (this.showEditor) {
        if (this.activeNames.indexOf("details") === -1) {
          this.activeNames.push("details");
        }
      }
      localStorage.setItem("show-editor", JSON.stringify(this.showEditor));
    },
    handleStatusChange(id) {
      const foundStatus = this.getStatuses.filter(x => x.id === id)[0];
      if (foundStatus == null) {
        this.$message.error("Status not found.");
      }
      this.status = foundStatus;
      this.$apollo
        .mutate({
          mutation: UpdateFolder,
          variables: {
            id: this.folder.id,
            input: {
              status: {
                id: foundStatus.id,
                name: foundStatus.name,
                color: foundStatus.color
              }
            }
          }
        })
        .then(() => {
          this.$message({
            message: "Status changed to: " + this.status.name,
            type: "success"
          });
        })
        .catch(error => {
          this.$message.error("Error while saving.");
          console.log(error);
        });
    }
  }
};
</script>
<style>
.folder-header {
  padding: 15px 24px 0;
  min-height: 40px;
  margin-bottom: 20px;
}
.folder-name {
  padding: 0;
  margin: 20px 0;
  height: auto;
  width: 100%;
  font-size: xx-large;
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
.menu-title {
  margin: 0 5px;
  font-size: 12px;
}
.white.card {
  display: flex;
  flex-direction: column;
}
.task-container {
  flex-grow: 1;
  overflow: scroll;
}
.float-right {
  float: right;
}
.ql-container.ql-snow {
  border: none !important;
}
</style>