<template>
  <div>
    <div class="header">
      <el-row type="flex">
        <el-col :span="10">
          <div @click="reloadPage" class="pointer">
            <h1>PMTOOL</h1>
          </div>
        </el-col>
        <el-col :span="4">
          <el-autocomplete
            class="search-input"
            v-model="searchState"
            :fetch-suggestions="querySearch"
            prefix-icon="el-icon-search"
            placeholder="Type something"
            :trigger-on-focus="false"
            @select="handleSelect"
            size="small"
            clearable
          ></el-autocomplete>
        </el-col>
        <el-col :span="10">
          <div @click="logout" class="logout">
            <i class="fa fa-sign-out-alt"></i>&nbsp;Logout
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="container">
      <aside class="tree-root">
        <div
          v-if="getTeam.id"
          class="tree-item"
          @click.right.stop.prevent="$store.commit('changeActiveWidget', `folder${getTeam.id}`)"
          @click.left.stop="$router.push({name: 'folder', params: {id: getTeam.id}})"
        >
          <div class="tree-plate" v-bind:class="{active: $route.params.id === getTeam.id}">
            <div class="circle"></div>
            <span class="folder no-select-color teamname">{{ getTeam.name }}</span>
            <plus-button @click="openModal" color="white"></plus-button>

            <div class="dropdown-content left" v-show="activeWidget === `folder${getTeam.id}`">
              <div @click="openModal">Add Folder</div>
            </div>
          </div>
        </div>

        <FolderTree
          v-for="folder in getFolders"
          :key="folder.id"
          :model="folder"
          :team="getTeam.id"
        ></FolderTree>
      </aside>

      <div class="workspace-main">
        <router-view :key="$route.fullPath"></router-view>
      </div>

      <FolderForm v-if="showModal" :config="{parent: ''}" @close="showModal = false"></FolderForm>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import FolderTree from "@/components/FolderTree";
import FolderForm from "@/components/FolderForm";
import { GetFolders, GetTeam, SearchFolders } from "../constants/query.gql";

export default {
  components: {
    FolderTree,
    FolderForm
  },
  computed: mapState(["activeWidget"]),
  data() {
    return {
      showModal: false,
      getFolders: [],
      getTeam: {},
      links: [],
      searchState: ""
    };
  },
  apollo: {
    getTeam: {
      query: GetTeam
    },
    getFolders: {
      query: GetFolders,
      variables() {
        return { parent: "" };
      },
      error(error) {
        console.error(error);
      }
    }
  },
  methods: {
    openModal() {
      this.$store.commit("changeActiveWidget", null);
      this.showModal = true;
    },
    logout() {
      this.$apollo.provider.clients.defaultClient.cache.reset();
      this.removeUserData();
      this.$router.push({ name: "home" });
    },
    removeUserData() {
      localStorage.removeItem("user-id");
      localStorage.removeItem("user-token");
      this.$root.$data.userId = null;
    },
    reloadPage() {
      window.location.reload();
    },
    querySearch(queryString, cb) {
      this.$apollo
        .query({
          query: SearchFolders,
          variables: {
            text: queryString
          }
        })
        .then(({ data: { searchFolders } }) => {
          cb(
            searchFolders.map(f => {
              return { value: f.name, link: f.id };
            })
          );
        })
        .catch(error => {
          this.error = "Something went wrong";
          console.log(error);
        });
    },
    handleSelect(item) {
      this.$router.push({ name: "folder", params: { id: item.link } });
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  height: calc(100% - 52px);
}

.plus-button {
  position: absolute;
  right: 0;
  top: 7px;
  margin: 0 2px;
}

aside {
  width: 220px;
  height: 100%;
  display: inline-block;
}

.workspace-main {
  flex: 1 1;
}

.pointer {
  cursor: pointer;
}

.search-input {
  padding: 10px 0;
}

.search-input >>> input {
  color: #c0ccd8;
  background-color: #1b2430;
  border: 1px solid #444;
  width: 300px;
}

.logout {
  position: absolute;
  right: 20px;
  padding: 15px 0;
  cursor: pointer;
}
</style>