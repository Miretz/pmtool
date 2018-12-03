<template>
  <el-row class="max-height">
    <el-col :span="12" class="max-height">
      <div class="white card max-height">
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
          </div>
          <div class="header-title">Project description:</div>
          <pre><div class="header-title folder-description">{{folderDescription}}</div></pre>
          <div class="col-25">
            <div class="header-title">Project start date:</div>
          </div>
          <div class="col-75">
            <div class="header-title">{{folder.startDate | formatDate}}</div>
          </div>
          <div class="col-25">
            <div class="header-title">Project end date:</div>
          </div>
          <div class="col-75">
            <div class="header-title">{{folder.endDate | formatDate}}</div>
          </div>
          <div class="col-25">
            <div class="header-title">Created by:</div>
          </div>
          <div class="col-75">
            <div class="header-title">{{createdBy}}</div>
          </div>
          <!-- List of subprojects -->
          <div class="header-title" v-if="isFolder">List of subprojects</div>
          <div class="subproject-list" v-if="isFolder">
            <div
              v-for="f in getFolders"
              :key="f.id"
              :model="folder"
              :class="'subproject-elem'"
              @click.left.stop="$router.push({name: 'folder', params: {id: f.id}})"
            >
              <div class="col-75">
                <i class="far fa-folder-open"></i>
                &nbsp;{{f.name}}
              </div>
              <div class="col-25">{{f.startDate | formatDate}} - {{f.endDate | formatDate}}</div>
            </div>
          </div>
        </div>
      </div>
    </el-col>
    <el-col v-if="!isTeam(folder) && subRoute==='folder'" :span="12" class="max-height">
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
      getFolders: []
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
    }
  }
};
</script>
<style>
.folder-header {
  padding: 15px 24px 0;
  min-height: 40px;
}
.folder-name {
  padding: 0;
  margin: 40px 0;
  height: auto;
  width: 100%;
  font-size: xx-large;
}
.folder-description {
  margin: 5px 0;
  height: auto;
  width: 100%;
}

.menu-title {
  margin: 0 5px;
  font-size: 12px;
}
.max-height {
  height: 100%;
}
.white.card {
  display: flex;
  flex-direction: column;
}
.task-container {
  flex-grow: 1;
  overflow: scroll;
}
</style>