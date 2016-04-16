(function() {
  window.shared || (window.shared = {});
  var merge = window.shared.ReactHelpers.merge;

  /*
  Functions for transforming the feed data structure that holds
  all notes and services for a student.
  */
  var FeedHelpers = window.shared.FeedHelpers = {
    // Merges data from event_notes and deprecated tables (notes, interventions).
    mergedNotes: function(feed) {
      var deprecatedInterventions = feed.deprecated.interventions.map(function(intervention) {
        return merge(intervention, {
          type: 'deprecated_interventions',
          sort_timestamp: intervention.start_date_timestamp
        });
      });
      var deprecatedProgressNotes = _.flatten(feed.deprecated.interventions.map(function(intervention) {
        return intervention.progress_notes.map(function(progressNote) {
          return merge(progressNote, {
            type: 'deprecated_progress_notes',
            sort_timestamp: progressNote.created_at_timestamp,
            intervention: intervention
          });
        });
      }));
      var eventNotes = feed.event_notes.map(function(eventNote) {
        return merge(eventNote, {
          type: 'event_notes',
          sort_timestamp: eventNote.recorded_at
        });
      });

      var mergedNotes = eventNotes.concat.apply(eventNotes, [
        deprecatedInterventions,
        deprecatedProgressNotes
      ]);
      return _.sortBy(mergedNotes, 'sort_timestamp').reverse();
    },

    matchesMergedNoteType: function(mergedNote, mergedNoteType, mergedNoteTypeId) {
      if (mergedNote.type !== mergedNoteType) return false;
      switch (mergedNote.type) {
        case 'event_notes': return (mergedNote.event_note_type_id === mergedNoteTypeId);
        case 'deprecated_notes': return true;
        case 'deprecated_interventions': return (mergedNote.intervention_type_id === mergedNoteTypeId);
        case 'deprecated_progress_notes': return (mergedNote.intervention.intervention_type_id === mergedNoteTypeId);
      }

      return false;
    },

    // Returns a list of all educatorIds that are active for the student,
    // based on the feed.
    allEducatorIds: function(feed) {
      var mergedNotes = FeedHelpers.mergedNotes(feed);
      var idsFromNotes = _.pluck(mergedNotes, 'educator_id');
      var idsFromServices = _.pluck(feed.services.active, 'provided_by_educator_id');
      var uniqueIds = _.unique(idsFromNotes.concat(idsFromServices));

      // Filter out null ids: for services with no recorded provided_by_educator
      return _.filter(uniqueIds, function(id) { return id !== null; });
    }
  };
})();
