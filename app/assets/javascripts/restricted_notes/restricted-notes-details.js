(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Educator = window.shared.Educator;
  var PropTypes = window.shared.PropTypes;
  var TakeNotes = window.shared.TakeNotes;
  var NotesList = window.shared.NotesList;
  var HelpBubble = window.shared.HelpBubble;
  var Api = window.shared.Api;

  var styles = {
    container: {
      display: 'flex'
    },
    notesContainer: {
      flex: 1,
      marginRight: 20,
      fontSize: 14 // Different from InterventionDetails (compensating for lack of a CSS).
    },
    title: {
      borderBottom: '1px solid #333',
      color: 'black',
      padding: 10,
      paddingLeft: 0
    }
  };

  /*
  Shows restricted notes about the student and allows users to enter new information about these as well.
  */
  var RestrictedNotesDetails = window.shared.RestrictedNotesDetails = React.createClass({
    propTypes: {
      eventNoteTypesIndex: React.PropTypes.object.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      currentEducator: React.PropTypes.object.isRequired,
      actions: PropTypes.actions.isRequired,
      feed: PropTypes.feed.isRequired,
    },

    getInitialState: function() {
      return {
        isTakingNotes: false,
      }
    },

    onClickTakeNotes: function(event) {
      this.setState({ isTakingNotes: true });
    },

    onCancelNotes: function(event) {
      this.setState({ isTakingNotes: false });
    },

    onClickSaveNotes: function(eventNoteParams, event) {
      this.props.actions.onClickSaveNotes(
        merge(eventNoteParams, {is_restricted: true}) // Different from InterventionDetails.
      );
      this.setState({ isTakingNotes: false });
    },

    getNotesHelpContent: function(){
      return 'Info on Restricted Notes.'
    },

    render: function() {
      return dom.div({ className: 'RestrictedNotesDetails', style: styles.container },
        dom.div({ style: styles.notesContainer },
          dom.div({style: {borderBottom: '1px solid #333', padding: 10}},
            dom.h4({style: {display: 'inline', color: 'black'}}, 'Restricted Notes'),
            createEl(HelpBubble, {
              title: 'What is a Restricted Note?',
              teaserText: '(what is this?)',
              content: this.getNotesHelpContent()
            })
          ),
          this.renderTakeNotesSection(),
          createEl(NotesList, {
            feed: this.props.feed,
            educatorsIndex: this.props.educatorsIndex,
            eventNoteTypesIndex: this.props.eventNoteTypesIndex
          })
        )
      );
    },

    renderTakeNotesSection: function() {
      if (this.state.isTakingNotes || this.props.requests.saveNotes !== null) {
        return createEl(TakeNotes, {
          nowMoment: moment.utc(), // TODO(kr) thread through
          eventNoteTypesIndex: this.props.eventNoteTypesIndex,
          currentEducator: this.props.currentEducator,
          onSave: this.onClickSaveNotes,
          onCancel: this.onCancelNotes,
          requestState: this.props.requests.saveNotes
        });
      }

      return dom.div({},
        dom.button({
          className: 'btn take-notes',
          style: { marginTop: 10 },
          onClick: this.onClickTakeNotes
        }, 'Take notes')
      );
    }
  });
})();
