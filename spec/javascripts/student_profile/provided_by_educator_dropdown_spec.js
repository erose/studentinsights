//= require ./fixtures

describe('ProvidedByEducatorDropdown', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var ProvidedByEducatorDropdown = window.shared.ProvidedByEducatorDropdown;
  var SpecSugar = window.shared.SpecSugar;
  var Fixtures = window.shared.Fixtures;

  var helpers = {
    renderInto: function(el, props) {
      var mergedProps = merge(props || {}, {
        onUserTyping: function(){},
        onUserDropdownSelect: function(){},
        studentId: 1
      });
      return ReactDOM.render(createEl(ProvidedByEducatorDropdown, mergedProps), el);
    }
  };

  SpecSugar.withTestEl('integration tests', function() {
    it("contains all educator names", function(){
      var el = this.testEl;
      helpers.renderInto(el);

      expect($(el).find(".ProvidedByEducatorDropdown")).toExist();
      expect($(document).find(".ui-autocomplete")).toExist();
      console.log("About to click.");

      console.log(el);
      var a = $(el).find("a").get(0);
      console.log($(a).attr("style"));
      $(el).find("a").click();
      console.log("Clicked.");

      // $(el).keypress({
      //   type: 'keypress', keyCode: 'f'.charCodeAt(0)
      // });
    });
  });
});
