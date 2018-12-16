<script>
import { HorizontalBar } from "vue-chartjs";
import moment from "moment";

const originalDraw = Chart.controllers.horizontalBar.prototype.draw;
Chart.controllers.horizontalBar.prototype.draw = function(ease) {
  originalDraw.call(this, ease);

  const context = this.chart.chart.ctx;
  const todayDataIndex = this.chart.chart.options.lineAtIndex;
  const vScale = this.chart.scales["y-axis-0"];
  const hScale = this.chart.scales["x-axis-0"];
  const left = (todayDataIndex / hScale.end) * (hScale.right - hScale.left);

  context.beginPath();
  context.strokeStyle = "#ff0000";
  context.moveTo(hScale.left + left, vScale.top);
  context.lineTo(hScale.left + left, vScale.bottom);
  context.stroke();

  context.textAlign = "center";
  context.fillStyle = "#ff0000";
  context.fillText("TODAY", hScale.left + left, vScale.top - 12);
};

export default {
  extends: HorizontalBar,
  props: ["data", "firstDate", "today"],
  mounted() {
    const dateToStart = this.firstDate.clone();
    const todayIndex = this.today;
    this.renderChart(this.data, {
      lineAtIndex: todayIndex,
      title: {
        display: true,
        text: "Detailed view"
      },
      scales: {
        xAxes: [
          {
            ticks: {
              beginAtZero: true,
              fontFamily: "'Open Sans Bold', sans-serif",
              fontSize: 11,
              stepSize: 30,
              min: 0,
              callback: function(value, index, labels) {
                if (value % 30 !== 0) return "";
                return dateToStart
                  .clone()
                  .add(value, "days")
                  .format(`${process.env.VUE_APP_DATE_FORMAT}`);
              }
            },
            scaleLabel: {
              display: true,
              labelString: "Date"
            },
            gridLines: {},
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
            stacked: true
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
    });
  }
};
</script>