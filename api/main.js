import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';
import './db/migrations';
import './tasks/tasks.methods';
import './tasks/tasks.publications';
import '../common/tasks/tasks';
/**
 * This is the server-side entry point
 */
Meteor.startup(() => {
  Migrations.migrateTo('latest');
});
