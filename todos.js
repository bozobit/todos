//GLOBAL VARIABLES
Todos = new Meteor.Collection('todos');
Lists = new Meteor.Collection('lists'); 

//ROUTES

Router.configure({
    layoutTemplate: 'main'
});

Router.route('/', {
    name: 'home',
    template: 'home'
});

Router.route('/register');

Router.route('/login');

Router.route('/list/:_id', {
    name: 'listPage',
    template: 'listPage',
    data: function(){
        var currentList = this.params._id;
        return Lists.findOne({ _id: currentList });
    }
});

//METHODS


//CLIENT CODE
if(Meteor.isClient){
    
    //SUBSCRIBING DATA

    //HELPER FUNCTIONS

    //Helpers for todos and todo items
    Template.todos.helpers({
        'todo': function(){
            var currentList = this._id;
            return Todos.find({listId: currentList}, {sort: {createdAt: -1}});
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
            var currentList = this._id;
            return Todos.find({listId: currentList}).count();
        },
        'completedTodos': function(){
            var currentList = this._id;
            return Todos.find({listId: currentList, completed: true}).count();
        }
    })

    // Helpers for lists and list items    
    Template.lists.helpers({
        'list': function(){
            return Lists.find({}, {sort: {name: 1}});
        }
    });



    //CLIENT EVENTS
    Template.addTodo.events({

        'submit form': function(event){
            event.preventDefault();
            var todoName = $('[name="todoName"]').val();
            var currentList = this._id;
            Todos.insert({
                name: todoName,
                completed: false,
                createdAt: new Date(),
                listId: currentList
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

    Template.addList.events({

        'submit form': function(event){
        event.preventDefault();
        var listName = $('[name=listName]').val();
        Lists.insert({
            name: listName
            }, function(error, results) {
                Router.go('listPage', { _id: results });
            }
        );
        $('[name=listName]').val('');
        }

    });

    Template.register.events({
        'submit form': function(event){
            event.preventDefault();
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Accounts.createUser({
                email: email,
                password: password},
                function(error){
                    if(error){
                        console.log(error.reason); // Output error if registration fails
                    } else {
                        Router.go("home"); // Redirect user if registration succeeds
                    }
                }
            );
        }
    });

    Template.login.events({
        'submit form': function(event){
            event.preventDefault();
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Meteor.loginWithPassword(email, password, function(error){
                if(error){
                    console.log(error.reason);
                } else {
                    Router.go("home");
                }
            });
        }
    });

    Template.navigation.events({
        'click .logout': function(event){
            event.preventDefault();
            Meteor.logout();
            Router.go('login');
        }
    });


}  //END CLIENT CODE


//SERVER CODE
if(Meteor.isServer){
    // server code goes here


}  //END SERVER CODE