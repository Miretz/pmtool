<template>
  <div v-if="isFolder">
    <div class="header-title">
      <h3>List of subprojects</h3>
    </div>

    <div class="subproject-list">
      <div
        v-for="f in getFolders"
        :key="f.id"
        :model="model"
        :class="'subproject-elem'"
        @click.left.stop="$router.push({name: 'folder', params: {id: f.id}})"
      >
        <el-row :gutter="12">
          <el-col :span="24">
            <el-row>
              <el-col :span="12">
                <div>
                  <i class="far fa-folder-open"></i>
                  &nbsp;{{f.name}}
                </div>
              </el-col>
              <el-col :span="12">
                <div class="float-right">{{f.startDate | formatDate}} - {{f.endDate | formatDate}}</div>
              </el-col>
            </el-row>
            <el-row>
              <el-col>
                <div class="gantt-progress-bar">
                  <yan-progress
                    :total="duration(f.startDate, f.endDate)"
                    :done="duration(f.startDate, f.endDate)"
                    :modify="duration(f.startDate, getCurrentDay)"
                    :tip="progressBarConfig(f)"
                  />
                </div>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="header-title">
      <h3>Detailed plan</h3>
    </div>
    <div class="gantt-chart">
      <gantt-chart
        :data="getData"
        :firstDate="getFirstDate"
        :today="getTodaysIndex"
        :styles="{position: 'relative'}"
      ></gantt-chart>
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
            data: this.getFolders.map(f =>
              this.duration(this.getFirstDate, f.startDate)
            ),
            backgroundColor: "#ffcc00",
            hoverBackgroundColor: "#ffcc00"
          },
          {
            //progress
            data: this.getFolders.map(f =>
              this.duration(f.startDate, f.endDate)
            ),
            backgroundColor: "#007acc",
            hoverBackgroundColor: "#007acc"
          },
          {
            //finished
            data: this.getFolders.map(
              f =>
                this.duration(this.getFirstDate, this.getLastDate) -
                this.duration(this.getFirstDate, f.endDate)
            ),
            backgroundColor: "#ccc",
            hoverBackgroundColor: "#eee"
          }
        ],
        labels: this.getFolders.map(f => f.name)
      };
    },
    getFirstDate: function() {
      return moment.min(this.getFolders.map(d => moment(d.startDate)));
    },
    getLastDate: function() {
      return moment.max(this.getFolders.map(d => moment(d.endDate)));
    },
    getTodaysIndex: function() {
      return this.duration(this.getFirstDate, new Date());
    },
    getCurrentDay: function() {
      return moment(new Date())
        .startOf("day")
        .toDate();
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
      return Math.abs(endDateDay.diff(startDateDay, "days"));
    },
    progressBarConfig(f) {
      const remaining = this.duration(this.getCurrentDay, f.endDate);
      return [
        {
          text: `Project done`,
          fillStyle: "#92CD00"
        },
        {
          text: `Days remaining: ${remaining}`,
          fillStyle: "#ffda6b"
        },
        {
          text: `Days spent: X`,
          fillStyle: "#92CD00"
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
  margin: 16px 10px;
  cursor: pointer;
  text-align: justify;
  padding: 10px;
  border: 1px solid #eee;
  background-color: #fff;
  border-radius: 4px;
  -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.subproject-card {
  overflow: visible;
  z-index: -1;
}
</style>
