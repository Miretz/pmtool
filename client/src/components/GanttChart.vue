<script>
import { HorizontalBar } from "vue-chartjs";
import moment from "moment";

/* TODAY LINE */
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

    context.textAlign = "center";
    context.fillStyle = color;
    context.fillText(text, hScale.left + left, vScale.top - 10);
  }

  const todayDataIndex = this.chart.chart.options.lineAtIndex;
  drawLine(this.chart, todayDataIndex, "#ff0000", "TODAY");

  const lines = this.chart.chart.options.extraLines;
  lines.map(({ pos, text }) => {
    drawLine(this.chart, pos, "#ffcc00", text);
  });
};

/* CHART */
export default {
  extends: HorizontalBar,
  props: ["data", "firstDate", "today"],
  mounted() {
    this.generateChart();
  },
  methods: {
    indexToDate(value) {
      return this.firstDate
        .clone()
        .add(value, "days")
        .format(`${process.env.VUE_APP_DATE_FORMAT}`);
    },
    getLines(){
      const starts = this.data.datasets[0].data
      const ends = this.data.datasets[1].data.map((x, i) => x+starts[i]);
      const all = starts.concat(ends);
      return all.map(x => {return {pos: x, text: this.indexToDate(x)}});
    },
    generateChart() {
      const todayIndex = this.today;
      const indexToDate = this.indexToDate;
      const lines = this.getLines();
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
                callback: function(value, index, labels) {
                  return indexToDate(value);
                }
              },
              scaleLabel: {
                display: true,
                labelString: "Date"
              },
              gridLines: {
                color: "rgba(0, 0, 0, 0.1)",
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
        responsive: true,
        maintainAspectRatio: false,
        pointLabelFontFamily: "'Open Sans Bold', sans-serif",
        scaleFontFamily: "'Open Sans Bold', sans-serif"
      };
      this.renderChart(this.data, options);
    }
  }
};
</script>