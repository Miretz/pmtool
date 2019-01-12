<template>
  <div>
    <!-- PROJECT PROGRESS -->
    <div class="subproject-list">
      <div class="subproject-elem parent">
        <el-row :gutter="12">
          <el-col :span="24">
            <el-row>
              <el-col :span="12">
                <div>
                  <i class="far fa-folder-open"></i>
                  &nbsp;{{model.name}}
                  &nbsp;
                  <el-button
                    v-if="model.status != null"
                    type="plain"
                    v-bind:style="{ backgroundColor: model.status.color, color: '#555', border: 'none'}"
                    size="mini"
                    disabled
                  >{{model.status.name}}</el-button>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="gantt-progress-bar">
                  <yan-progress
                    :total="duration(model.startDate, model.endDate)"
                    :done="duration(model.startDate, model.endDate)"
                    :modify="calculateDaysSpent(model)"
                    :tip="progressBarConfig(model)"
                  />
                </div>
              </el-col>
              <el-col :span="6">
                <div
                  class="float-right"
                >{{model.startDate | formatDate}} - {{model.endDate | formatDate}}</div>
              </el-col>
            </el-row>
            <el-row>
              
            </el-row>
          </el-col>
        </el-row>
      </div>
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
                  <i class="far fa-folder"></i>
                  &nbsp;/ {{f.name}}
                  &nbsp;
                  <el-button
                    type="plain"
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
            data: this.getFolders.map(f =>
              this.duration(this.getFirstDate, f.startDate)
            ),
            backgroundColor: "rgba(255, 255, 255, 0)",
            hoverBackgroundColor: "rgba(255, 255, 255, 0)"
          },
          {
            //progress
            data: this.getFolders.map(f =>
              this.duration(f.startDate, f.endDate)
            ),
            ids: this.getFolders.map(f => f.id),
            backgroundColor: "rgba(0, 122, 204, 0.8)",
            hoverBackgroundColor: "rgba(0, 122, 204, 1)",
            borderWidth: 2
          },
          {
            //finished
            data: this.getFolders.map(
              f =>
                this.duration(this.getFirstDate, this.getLastDate) -
                this.duration(this.getFirstDate, f.endDate)
            ),
            backgroundColor: "rgba(255, 255, 255, 0)",
            hoverBackgroundColor: "rgba(255, 255, 255, 0)"
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
