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
      </div>
    </div>

    <div class="header-title">
      <h3>Detailed plan</h3>
    </div>
    <el-row>
      <el-col :span="24">
        <div class="gantt-chart">
          <el-table :data="getRanges()" border style="width: 100%" :cell-class-name="cellClassName">
            <el-table-column prop="name" label="Name" width="100"></el-table-column>
            <el-table-column
              :prop="'date' + n"
              :label="formatTooltip(n)"
              :key="'date' + n"
              v-for="n in allFoldersDuration()"
              :width="75"
            ></el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
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
      const startDateDay = moment(startDate)
        .startOf("day")
        .clone();
      const endDateDay = moment(endDate)
        .startOf("day")
        .clone();
      return Math.abs(endDateDay.diff(startDateDay, "days"));
    },
    doneAmount(f) {
      return this.duration(this.getFirstDate(), f.endDate);
    },
    modifyAmount(f) {
      return this.duration(this.getFirstDate(), f.startDate);
    },
    getDateByIndex(value) {
      return moment(this.getFirstDate())
        .startOf("day")
        .clone()
        .add(value, "days");
    },
    formatTooltip(value) {
      return this.getDateByIndex(value).format("DD.MM.");
    },
    getFirstDate: function() {
      const minDate = moment.min(this.getFolders.map(d => moment(d.startDate)));
      return minDate.clone().startOf("day");
    },
    getLastDate: function() {
      const maxDate = moment.max(this.getFolders.map(d => moment(d.endDate)));
      return maxDate.clone().startOf("day");
    },
    allFoldersDuration: function() {
      return this.duration(this.getFirstDate(), this.getLastDate());
    },
    isIndexInDateRange(index, start, end) {
      return (
        this.getDateByIndex(index).isSameOrAfter(
          moment(start).startOf("day")
        ) &&
        this.getDateByIndex(index).isSameOrBefore(moment(end).startOf("day"))
      );
    },
    getRanges: function() {
      let result = [];
      for (let f of this.getFolders) {
        let row = {
          name: f.name
        };
        for (let n = 0; n < this.allFoldersDuration(); n++) {
          const dateColumn = "date" + n;
          const styleColumn = "style" + n;
          row[dateColumn] = "";
          row[styleColumn] = "";
          if (this.getDateByIndex(n).isSame(new Date(), "day")) {
            row[dateColumn] = this.formatTooltip(n);
            row[styleColumn] = "gttable-current-day";
          } else if (this.isIndexInDateRange(n, f.startDate, f.endDate)) {
            row[dateColumn] = this.formatTooltip(n);
            row[styleColumn] = "gttable-running";
          }
        }
        result.push(row);
      }
      this.ranges = result;
      return result;
    },
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) return "";
      let tableRow = this.ranges[rowIndex];
      return tableRow["style" + columnIndex];
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
  z-index: -1;
}
.subproject-list {
  margin: 20px 4px;
}
.subproject-elem {
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
