//GLOBAL VARIABLES
Todos = new Mongo.Collection('todos');


//METHODS


//CLIENT CODE
if(Meteor.isClient){
    
    //SUBSCRIBING DATA

    //HELPER FUNCTIONS
    Template.todos.helpers({

        'todo': function(){
            return Todos.find({}, {sort: {createdAt: -1}});
        }

    })

    Template.todoItem.helpers({

        'checked': function(){
            var isCompleted = this.completed
            if(isCompleted){
                return "checked";
            } else {
                return "";
            }
        }

    })

    Template.todosCount.helpers({

        'totalTodos': function(){
            return Todos.find().count();
        },

        'completedTodos': function(){
            return Todos.find({completed: true}).count();
        }

    })


    //CLIENT EVENTS
    Template.addTodo.events({

        'submit form': function(event){
            event.preventDefault();
            var todoName = $('[name="todoName"]').val();
            console.log(todoName)
            Todos.insert({
                name: todoName,
                completed: false,
                createdAt: new Date()
            })
            $('[name="todoName"]').val('');
        }

    })

    Template.todoItem.events({

        'click .delete-todo': function(event){
            event.preventDefault();
            var documentId = this._id;
            var confirm = window.confirm("Delete this task?");
            if(confirm){
                Todos.remove({_id: documentId});
            }
        },

        'keyup [name=todoItem]': function(event){
            var documentId = this._id;
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur(); //remove focus
            } else {
                var todoItem = $(event.target).val();
                Todos.update({_id: documentId}, {$set: {name: todoItem}});
            }
        },

        'change [type=checkbox]': function(){
            var documentId = this._id;
            var isCompleted = this.completed;
            if(isCompleted){
                Todos.update({_id: documentId}, {$set: {completed: false}});
                //console.log("Task marked incomplete.")
            } else {
                Todos.update({_id: documentId}, {$set: {completed: true}});
                //console.log("Task marked complete.")
            }
        }

    })



}


//SERVER CODE
if(Meteor.isServer){
    // server code goes here
}