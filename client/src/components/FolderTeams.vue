<template>
  <div v-if="hasTeams">
    <div class="teams-list">
      <div
        v-for="f in getFolderTeams"
        :key="f.id"
        :model="model"
        :class="'teams-elem'"
        @click.left.stop="$router.push({name: 'folder', params: {id: f.id}})"
      >
        <el-row :gutter="12">
          <el-col :span="8">
            <el-card shadow="always">
              <i class="fas fa-users"></i>
              &nbsp;{{f.name}}
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script>
import { GetFolderTeams } from "../constants/query.gql";
export default {
  props: ["model"],
  computed: {
    hasTeams: function() {
      return this.getFolderTeams.length > 0;
    }
  },
  data() {
    return {
      getFolderTeams: []
    };
  },
  apollo: {
    getFolderTeams: {
      query: GetFolderTeams,
      skip() {
        return this.model.id == null || this.model.id === "";
      },
      variables() {
        return { id: this.model.id };
      },
      error(error) {
        console.error(error);
      }
    }
  }
};
</script>
<style scoped>
.teams-list {
  margin: 20px 4px;
}
.teams-elem {
  margin: 10px;
  cursor: pointer;
}
</style>

