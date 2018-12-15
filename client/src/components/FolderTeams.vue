<template>
  <div>
    <div class="header-title" v-if="hasTeams">
      <h3>Shared with</h3>
    </div>
    <div class="teams-list" v-if="hasTeams">
      <div
        v-for="f in getFolderTeams"
        :key="f.id"
        :model="model"
        :class="'teams-elem'"
        @click.left.stop="$router.push({name: 'folder', params: {id: f.id}})"
      >
        <i class="fas fa-users"></i>
        &nbsp;{{f.name}}
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
  text-align: justify;
  padding: 10px;
  border: 1px solid #eee;
  background-color: #e8e8e8;
  border: 2px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}
</style>

