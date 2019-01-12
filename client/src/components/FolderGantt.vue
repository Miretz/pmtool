<template>
  <div>
    <!-- PROJECT PROGRESS -->
    <div class="subproject-list">
      <div
        v-for="f in allFolders"
        :key="f.id"
        :model="model"
        :class="'subproject-elem' + (model.id==f.id ? ' parent': '')"
        @click.left.stop="$router.push({name: 'folder', params: {id: f.id}})"
      >
        <el-row :gutter="12">
          <el-col :span="24">
            <el-row>
              <el-col :span="12">
                <div>
                  <i class="far fa-folder-open" v-if="model.id==f.id"></i>
                  <i class="far fa-folder" v-if="model.id!=f.id"></i>
                  {{ model.id!=f.id ? '/': '' }}
                  {{f.name}}
                  <el-button
                    type="plain"
                    v-if="f.status != null"
                    v-bind:style="{ backgroundColor: f.status.color, color: '#555', border: 'none'}"
                    size="mini"
                    disabled
                  >{{f.status.name}}</el-button>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="gantt-progress-bar">
                  <yan-progress
                    :total="duration(f.startDate, f.endDate)"
                    :done="duration(f.startDate, f.endDate)"
                    :modify="calculateDaysSpent(f)"
                    :tip="progressBarConfig(f)"
                  />
                </div>
              </el-col>
              <el-col :span="6">
                <div class="float-right">{{f.startDate | formatDate}} - {{f.endDate | formatDate}}</div>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
    </div>
    <!-- GANTT CHART -->
    <div v-if="isFolder">
      <div class="gantt-chart">
        <gantt-chart
          :data="getData"
          :firstDate="getFirstDate"
          :today="getTodaysIndex"
          :styles="{position: 'relative'}"
        ></gantt-chart>
      </div>
    </div>
  </div>
</template>
<script>
import { GetFolders } from "../constants/query.gql";
import moment from "moment";
import GanttChart from "./GanttChart.vue";
export default {
  props: ["model"],
  components: {
    GanttChart
  },
  computed: {
    isFolder: function() {
      return this.getFolders.length > 0;
    },
    getData: function() {
      return {
        datasets: [
          {
            //before
            data: this.allFolders.map(f =>
              this.duration(this.getFirstDate, f.startDate)
            ),
            backgroundColor: "rgba(255, 255, 255, 0)",
            hoverBackgroundColor: "rgba(255, 255, 255, 0)"
          },
          {
            //progress
            data: this.allFolders.map(f =>
              this.duration(f.startDate, f.endDate)
            ),
            ids: this.allFolders.map(f => f.id),
            backgroundColor: this.allFolders.map(f =>
              f.id == this.model.id
                ? "rgba(0, 156, 204, 0.2)"
                : "rgba(0, 122, 204, 0.8)"
            ),
            hoverBackgroundColor: this.allFolders.map(f =>
              f.id == this.model.id
                ? "rgba(0, 156, 204, 0.3)"
                : "rgba(0, 122, 204, 1)"
            )
          },
          {
            //finished
            data: this.allFolders.map(
              f =>
                this.duration(this.getFirstDate, this.getLastDate) -
                this.duration(this.getFirstDate, f.endDate)
            ),
            backgroundColor: "rgba(255, 255, 255, 0)",
            hoverBackgroundColor: "rgba(255, 255, 255, 0)"
          }
        ],
        labels: this.allFolders.map(f => f.name)
      };
    },
    getFirstDate: function() {
      return moment.min(this.allFolders.map(d => moment(d.startDate)));
    },
    getLastDate: function() {
      return moment.max(this.allFolders.map(d => moment(d.endDate)));
    },
    getTodaysIndex: function() {
      return this.duration(this.getFirstDate, new Date());
    },
    getCurrentDay: function() {
      return moment(new Date())
        .startOf("day")
        .toDate();
    },
    allFolders: function() {
      let folders = Object.assign([], this.getFolders);
      folders.unshift(this.model);
      return folders;
    }
  },
  data() {
    return {
      getFolders: [],
      ranges: []
    };
  },
  apollo: {
    getFolders: {
      query: GetFolders,
      variables() {
        return { parent: this.model.id };
      },
      error(error) {
        console.error(error);
      }
    }
  },
  methods: {
    duration(startDate, endDate) {
      const startDateDay = moment(startDate);
      const endDateDay = moment(endDate);
      return endDateDay.diff(startDateDay, "days");
    },
    calculateDaysSpent(model) {
      return Math.max(
        this.duration(model.startDate, model.endDate) -
          this.duration(this.getCurrentDay, model.endDate),
        0
      );
    },
    progressBarConfig(f) {
      let remaining = Math.max(
        this.duration(f.startDate, f.endDate) - this.calculateDaysSpent(f),
        0
      );
      return [
        {
          text: `Project done`,
          fillStyle: "#92CD00"
        },
        {
          text: `Days remaining: ${remaining}`,
          fillStyle: "#92CD00"
        },
        {
          text: `Days spent: X`,
          fillStyle: "#ffda6b"
        }
      ];
    }
  }
};
</script>
<style scoped>
.gantt-progress-bar {
  margin: 10px 0;
}
.gantt-chart {
  margin: 14px;
  display: block;
}
.subproject-list {
  margin: 20px 4px;
}
.subproject-elem {
  margin: 8px 20px 8px 30px;
  cursor: pointer;
  text-align: justify;
  padding: 10px;
  border: 1px solid #eee;
  background-color: #fff;
  border-radius: 4px;
  -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.parent {
  margin: 8px 20px 8px 20px;
  border: 2px solid #ccc;
  font-weight: bold;
}
.subproject-card {
  overflow: visible;
  z-index: -1;
}
</style>
