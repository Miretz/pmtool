<script>
import { HorizontalBar } from "vue-chartjs";
import moment from "moment";

/* LINES EXTENSION */
const originalDraw = Chart.controllers.horizontalBar.prototype.draw;
Chart.controllers.horizontalBar.prototype.draw = function(ease) {
  originalDraw.call(this, ease);

  function drawLine(chart, index, color, text) {
    const context = chart.chart.ctx;
    const vScale = chart.scales["y-axis-0"];
    const hScale = chart.scales["x-axis-0"];
    const left = (index / hScale.end) * (hScale.right - hScale.left);

    context.beginPath();
    context.strokeStyle = color;
    context.moveTo(hScale.left + left, vScale.top);
    context.lineTo(hScale.left + left, vScale.bottom);
    context.stroke();

    if (text != "") {
      const x = hScale.left + left;
      const y = vScale.top - 12;
      var width = context.measureText(text).width + 10;
      context.fillStyle = "#ffffff";
      context.fillRect(x - width / 2, y - 10, width, 20);
      context.textAlign = "center";
      context.fillStyle = color;
      context.fillText(text, x, y);
    }
  }

  const lines = this.chart.chart.options.extraLines;
  lines.map(({ pos, text }) => {
    drawLine(this.chart, pos, "#fcaa00", text);
  });

  const todayDataIndex = this.chart.chart.options.lineAtIndex;
  drawLine(this.chart, todayDataIndex, "#ff0000", "");
};

/* CHART */
export default {
  extends: HorizontalBar,
  props: ["data", "firstDate", "today"],
  mounted() {
    this.generateChart();
  },
  watch: {
    data: function() {
      this.generateChart();
    }
  },
  methods: {
    indexToDate(value) {
      return this.firstDate
        .clone()
        .add(value, "days")
        .format(`${process.env.VUE_APP_DATE_FORMAT}`);
    },
    getLines() {
      const starts = this.data.datasets[0].data;
      const ends = this.data.datasets[1].data.map((x, i) => x + starts[i]);
      const all = starts.concat(ends);
      return all.map(x => {
        return { pos: x, text: this.indexToDate(x) };
      });
    },
    generateChart() {
      const todayIndex = this.today;
      const indexToDate = this.indexToDate;
      const lines = this.getLines();
      const clickHandler = this.handleClick;
      const router = this.$router;
      const options = {
        lineAtIndex: todayIndex,
        extraLines: lines,
        title: {
          display: true,
          text: ""
        },
        scales: {
          xAxes: [
            {
              ticks: {
                beginAtZero: true,
                fontFamily: "'Open Sans Bold', sans-serif",
                fontSize: 11,
                min: 0,
                stepSize: 1,
                callback: function(value, index, labels) {
                  return indexToDate(value);
                }
              },
              scaleLabel: {
                display: true,
                labelString: "Date"
              },
              gridLines: {
                color: "rgba(0, 0, 0, 0.1)"
              },
              stacked: true
            }
          ],
          yAxes: [
            {
              gridLines: {
                display: false,
                color: "#fff",
                zeroLineColor: "#fff",
                zeroLineWidth: 0
              },
              ticks: {
                fontFamily: "'Open Sans Bold', sans-serif",
                fontSize: 11
              },
              stacked: true,
              categoryPercentage: 0.4,
              barPercentage: 0.9
            }
          ]
        },
        legend: {
          display: false
        },
        tooltips: {
          enabled: false
        },
        responsive: true,
        maintainAspectRatio: false,
        pointLabelFontFamily: "'Open Sans Bold', sans-serif",
        scaleFontFamily: "'Open Sans Bold', sans-serif",
        onClick: function(evt) {
          const activeElement = this.getElementAtEvent(evt);
          if (activeElement[0] == null) {
            return;
          }
          const data = this.data.datasets[activeElement[0]._datasetIndex];
          if (data.ids == null) {
            return;
          }
          const id = data.ids[activeElement[0]._index];
          router.push({ name: "folder", params: { id: id } });
        }
      };
      this.renderChart(this.data, options);
    }
  }
};
</script>