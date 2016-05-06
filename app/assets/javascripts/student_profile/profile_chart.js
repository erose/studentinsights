(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var QuadConverter = window.shared.QuadConverter;

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
      return createEl(HighchartsWrapper, merge(this.baseOptions(), {
        title: {
          text: this.props.titleText,
          align: 'left'
        },
        series: this.props.quadSeries.map(function(obj){
          return {
            name: obj.name,
            data: obj.data ? _.map(obj.data, QuadConverter.toPair): []
          }
        }),
        yAxis: this.props.yAxis
      }));
    },

    getSchoolYearStartPositions: function(n, d, current_grade){
      // Takes in an integer (number of months back), the current date as a Moment object (UTC), and the student's current grade.
      // Returns an object mapping integer (tick position) --> string (school year starting at that position).

      var result = {};
      var current = d;

      n -= current.month() + 1;
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
      var positionsForYearStarts = this.getSchoolYearStartPositions(48, moment.utc(), parseInt(this.props.student.grade));

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
  });
})();