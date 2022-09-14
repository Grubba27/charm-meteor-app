import { createRouter } from 'meteor/rpc';
import { z } from 'zod';
import { check } from 'meteor/check';
import { checkLoggedIn } from '../../api/common/auth';
import { TasksCollection } from '../../api/tasks/tasks.collection';
import { Meteor } from 'meteor/meteor';


/**
 * Insert a task for the logged user.
 * @param {{ description: String }}
 * @throws Will throw an error if user is not logged in.
 */
const insertTask = ({ description }) => {
  check(description, String);
  checkLoggedIn();
  TasksCollection.insert({
    description,
    userId: Meteor.userId(),
    createdAt: new Date(),
  });
};
/**
 * Insert a task for the logged user.
 * @param {{ newDescripiton: String , taskId: String}}
 * @throws Will throw an error if user is not logged in.
 */
const updateTask = ({ newDescripiton, taskId }) => {
  check(newDescripiton, String);
  checkLoggedIn();
  TasksCollection.update(
    { _id: taskId },
    { $set: { description: newDescripiton } }
  );
};

/**
 * Check if user is logged in and is the task owner.
 * @param {{ taskId: String }}
 * @throws Will throw an error if user is not logged in or is not the task owner.
 */
const checkTaskOwner = ({ taskId }) => {
  check(taskId, String);
  checkLoggedIn();
  const task = TasksCollection.findOne({
    _id: taskId,
    userId: Meteor.userId(),
  });
  if (!task) {
    throw new Meteor.Error('Error', 'Access denied.');
  }
};

/**
 * Remove a task.
 * @param {{ taskId: String }}
 * @throws Will throw an error if user is not logged in or is not the task owner.
 */
export const removeTask = ({ taskId }) => {
  checkTaskOwner({ taskId });
  TasksCollection.remove(taskId);
};

/**
 * Toggle task as done or not.
 * @param {{ taskId: String }}
 * @throws Will throw an error if user is not logged in or is not the task owner.
 */
const toggleTaskDone = ({ taskId }) => {
  checkTaskOwner({ taskId });
  const task = TasksCollection.findOne(taskId);
  TasksCollection.update({ _id: taskId }, { $set: { done: !task.done } });
};

function publishTasks() {
  return TasksCollection.find({ userId: this.userId });
}

const Tasks = createRouter('tasks')
  .addMethod('insert', z.object({ description: z.string() }), insertTask)
  .addMethod('update', z.object({ newDescripiton: z.string(), taskId: z.string() }), updateTask)
  .addMethod('remove', z.object({ taskId: z.string() }), removeTask)
  .addMethod('toggleDone', z.object({ taskId: z.string() }), toggleTaskDone)
  .addPublication('byUser', z.any(), publishTasks)
  .build();

// Tasks schema is like this: {
//   "insert": ({description: string}) => void;
//   "update": ({newDescripiton: string, taskId: string)} => void;
//   "remove": ({taskId: string}) => void;
//   "toggleDone": ({taskId: string}) => void;
//   "byUser": () => Mongo.Cursor;
// }


export { Tasks };
