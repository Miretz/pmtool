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
            <el-card shadow="always">
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
                      :total="allFoldersDuration()"
                      :done="doneAmount(f)"
                      :modify="modifyAmount(f)"
                      :tip="ganttConfig(f)"
                    />
                  </div>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="header-title">
      <h3>Detailed plan</h3>
    </div>
    <div class="gantt-chart">
      <!-- TODO: new gant chart -->
    </div>
  </div>
</template>
<script>
import { GetFolders } from "../constants/query.gql";
import moment from "moment";
export default {
  props: ["model"],
  computed: {
    isFolder: function() {
      return this.getFolders.length > 0;
    },
    getRanges: function() {
      let result = [];
      const currentDay = new Date();
      for (let f of this.getFolders) {
        let row = {
          name: f.name
        };
        const from = this.modifyAmount(f);
        const to = this.doneAmount(f);
        const today = this.duration(this.getFirstDate(), currentDay);
        for (let n = 0; n <= this.allFoldersDuration(); n++) {
          if (n < from || n > to) {
            row["date" + n] = "";
            row["style" + n] = "";
          } else if (n === today) {
            row["date" + n] = this.formatTooltip(n);
            row["style" + n] = "gttable-current-day";
          } else {
            row["date" + n] = this.formatTooltip(n);
            row["style" + n] = "gttable-running";
          }
        }
        result.push(row);
      }
      this.ranges = result;
      return result;
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
    doneAmount(f) {
      return this.duration(this.getFirstDate(), f.endDate);
    },
    modifyAmount(f) {
      return this.duration(this.getFirstDate(), f.startDate);
    },
    getDateByIndex(value) {
      if (value === 0) return this.getFirstDate();
      return moment(this.getFirstDate()).add(value, "days");
    },
    formatTooltip(value) {
      return this.getDateByIndex(value).format(
        `${process.env.VUE_APP_DATE_FORMAT}`
      );
    },
    getFirstDate: function() {
      return moment.min(this.getFolders.map(d => moment(d.startDate)));
    },
    getLastDate: function() {
      return moment.max(this.getFolders.map(d => moment(d.endDate)));
    },
    allFoldersDuration: function() {
      return this.duration(this.getFirstDate(), this.getLastDate()) + 1;
    },
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) return "";
      let tableRow = this.ranges[rowIndex];
      return tableRow["style" + (columnIndex - 1)];
    },
    days(val) {
      return val === 1 ? `${val} day` : `${val} days`;
    },
    ganttConfig(f) {
      const modAmount = this.modifyAmount(f);
      const doneAmount = this.doneAmount(f);
      const modifyStr = this.days(modAmount);
      const durationStr = this.days(doneAmount - modAmount);
      const finishedStr = this.days(this.allFoldersDuration() - doneAmount);
      return [
        {
          text: `Project finished: ${finishedStr}`,
          fillStyle: "#ccc"
        },
        {
          text: `Project duration: ${durationStr}`,
          fillStyle: "#007acc"
        },
        {
          text: `Before start: ${modifyStr}`,
          fillStyle: "#ffcc00"
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
  max-width: 753px;
}
.subproject-list {
  margin: 20px 4px;
}
.subproject-elem {
  margin: 10px;
  cursor: pointer;
}
</style>
