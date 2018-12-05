<template>
  <el-row>
    <el-col :span="12">
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
            <div class="toggle-editor" v-if="!isTeam(folder) && subRoute==='folder'">
              <el-button @click="toggleEditor" icon="el-icon-edit"></el-button>
            </div>
          </div>
          <div v-if="!isTeam(folder) && subRoute==='folder'">
            <h3>Project details</h3>
            <el-row>
              <el-col :span="24">
                <div class="header-title">Project description:</div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <pre><div class="header-title folder-description">{{folderDescription}}</div></pre>
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
          <!-- List of subprojects -->
          <div class="header-title" v-if="isFolder">
            <h3>List of subprojects</h3>
          </div>
          <div class="subproject-list" v-if="isFolder">
            <div
              v-for="f in getFolders"
              :key="f.id"
              :model="folder"
              :class="'subproject-elem'"
              @click.left.stop="$router.push({name: 'folder', params: {id: f.id}})"
            >
              <el-row>
                <el-col :span="12">
                  <div>
                    <i class="far fa-folder-open"></i>
                    &nbsp;{{f.name}}
                  </div>
                </el-col>
                <el-col :span="12">
                  <div
                    class="header-title"
                  >{{f.startDate | formatDate}} - {{f.endDate | formatDate}}</div>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </div>
    </el-col>
    <el-col v-if="!isTeam(folder) && subRoute==='folder' && showEditor" :span="12">
      <FolderDetail :folder="folder"></FolderDetail>
    </el-col>
  </el-row>
</template>
<script>
import { mapState } from "vuex";
import { GetFolder, GetUserById, GetFolders } from "../constants/query.gql";
import FolderDetail from "./FolderDetail.vue";
export default {
  components: {
    FolderDetail
  },
  computed: {
    isFolder: function() {
      return this.getFolders.length > 0;
    },
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
      getFolders: [],
      showEditor: false
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
        this.createdBy = this.folder.createdBy;
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
    getFolders: {
      query: GetFolders,
      skip() {
        return this.folder.id == null || this.folder.id === "";
      },
      variables() {
        return { parent: this.folder.id };
      },
      error(error) {
        console.error(error);
      }
    }
  },
  methods: {
    isTeam(folder) {
      return !folder.parent && folder.shareWith.length === 0;
    },
    toggleEditor: function() {
      this.showEditor = !this.showEditor;
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
  border: 2px solid #ccc;
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
.toggle-editor {
  float: right;
}
</style>