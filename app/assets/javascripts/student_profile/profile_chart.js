(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var ProfileChartSettings = window.ProfileChartSettings;
  var HighchartsWrapper = window.shared.HighchartsWrapper;

  // Component for all charts in the profile page.
  window.shared.ProfileChart = React.createClass({
    displayName: 'ProfileChart',

    propTypes: {
      quadSeries: React.PropTypes.arrayOf( // you can plot multiple series on the same graph
        React.PropTypes.shape({
          name: React.PropTypes.string.isRequired, // e.g. 'Scaled score'
          data: React.PropTypes.array.isRequired // [year, month, date, value] quads
        })
      ),
      titleText: React.PropTypes.string.isRequired, // e.g. 'MCAS scores, last 4 years'
      yAxis: React.PropTypes.object.isRequired, // options for rendering the y-axis
      student: React.PropTypes.object.isRequired
    },

    getDefaultProps: function() {
      var now = moment.utc().toDate();
      // TODO(kr) align to school year?
      // The intent of fixing this date range is that when staff are looking at profile of different students,
      // the scales are consistent (and not changing between 3 mos and 6 years depending on the student's record,
      // since that's easy to miss and misinterpret.
      var intervalBack = [4, 'years'];

      return {
        now: now,
        intervalBack: intervalBack,
        timestampRange: {
          min: moment(now).subtract(4, 'years').toDate().getTime(),
          max: now.getTime(),
        }
      };
    },

    render: function() {
      var self = this;
      return createEl(HighchartsWrapper, merge(this.baseOptions(), {
        title: {
          text: this.props.titleText,
          align: 'left'
        },
        series: this.props.quadSeries.map(function(obj){
          return {name: obj.name, data: self.quadsToPairs(obj.data || [])}
        }),
        yAxis: this.props.yAxis
      }));
    },

    getPositionsForYearStarts: function(){
      var result = {};
      var current = moment();
      var current_grade = parseInt(this.props.student.grade);
      var n = 48;

      n -= (current.month() + 1);
      current.dayOfYear(1);

      result[current.valueOf()] = current.year().toString() + "<br>" + "<b>" + "Grade " + current_grade.toString() + "</b>";

      // Take 12-month jumps backwards until we can't anymore.
      while (n - 12 > 0){
        current.subtract(1, 'year');
        n -= 12;
        current_grade -= 1;

        result[current.valueOf()] = current.year().toString() + "<br>" + "<b>" +
          (current_grade != 0 ? "Grade " + current_grade.toString() + "</b>" : "");
      }

      return result;
    },

    baseOptions: function() {
      var positionsForYearStarts = this.getPositionsForYearStarts();

      return merge(ProfileChartSettings.base_options, {
        xAxis: [
          merge(ProfileChartSettings.x_axis_datetime, {
            plotLines: this.x_axis_bands,
            min: this.props.timestampRange.min,
            max: this.props.timestampRange.max
          }),
          {
            type: "datetime",
            offset: 35,
            linkedTo: 0,
            tickPositions: _.keys(positionsForYearStarts).map(Number),
            categories: positionsForYearStarts,
          }
        ]
      });
    },

    quadsToPairs: function(quads) {
      return quads.map(function(quad) {
        var year = quad[0],
            month = quad[1],
            day = quad[2],
            value = quad[3];
        return [Date.UTC(year, month - 1, day), value]; // one-index --> zero-index on month
      });
    }
  });
})();