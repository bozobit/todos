//VALIDATION

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
        var currentUser = Meteor.userId();
        return Lists.findOne({ _id: currentList, createdBy: currentUser });
    },
    onRun: function(){
        console.log("You triggered 'onRun' for 'listPage' route.");
        this.next();
    },
    onRerun: function(){
        console.log("You triggered 'onRerun' for 'listPage' route.");
    },
    onBeforeAction: function(){
        console.log("You triggered 'onBeforeAction' for 'listPage' route.");
        var currentUser = Meteor.userId();
        if(currentUser){
            this.next();
        } else {
            this.render("login");
        }
    },
    onAfterAction: function(){
        console.log("You triggered 'onAfterAction' for 'listPage' route.");
    },
    onStop: function(){
        console.log("You triggered 'onStop' for 'listPage' route.");
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
            var currentUser = Meteor.userId();
            return Todos.find({listId: currentList, createdBy: currentUser}, {sort: {createdAt: -1}});
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
            var currentUser = Meteor.userId();
            return Lists.find({createdBy: currentUser}, {sort: {name: 1}});
        },

        'userId' : function(){
            var currentUser = Meteor.userId();
            return currentUser;
        }

    });



    //CLIENT EVENTS
    Template.addTodo.events({

        'submit form': function(event){
            event.preventDefault();
            var todoName = $('[name="todoName"]').val();
            var currentList = this._id;
            var currentUser = Meteor.userId();
            Todos.insert({
                name: todoName,
                completed: false,
                createdAt: new Date(),
                createdBy: currentUser,
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
        var currentUser = Meteor.userId();
        Lists.insert({
            name: listName,
            createdBy: currentUser
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
        }
    });

    Template.register.onRendered(function(){
        var validator = $('.register').validate({
            submitHandler: function(event){
                var email = $('[name=email]').val();
                var password = $('[name=password]').val();
                Accounts.createUser({
                    email: email,
                    password: password
                }, function(error){
                    if(error){
                        if(error.reason == "Email already exists."){
                            validator.showErrors({
                                email: "That email already belongs to a registered user."   
                            });
                        }
                    } else {
                        Router.go("home");
                    }
                });
            }    
        });
    });


    Template.login.events({
        'submit form': function(event){
            event.preventDefault();
        }
    });

    Template.login.onCreated(function(){
        console.log("The 'login' template was just created.");
    });
    
    Template.login.onRendered(function(){
        var validator = $('.login').validate({
            submitHandler: function(event){
                var email = $('[name=email]').val();
                var password = $('[name=password]').val();
                Meteor.loginWithPassword(email, password, function(error){
                    if(error){
                        if(error.reason == "User not found"){
                            validator.showErrors({
                                email: "That email doesn't belong to a registered user."   
                            });
                        }
                        if(error.reason == "Incorrect password"){
                            validator.showErrors({
                                password: "You entered an incorrect password."    
                            });
                        }
                    } else {
                        var currentRoute = Router.current().route.getName();
                        if(currentRoute == "login"){
                            Router.go("home");
                        }
                    }
                });
            }
        });
    });
    
    Template.login.onDestroyed(function(){
        console.log("The 'login' template was just destroyed.");
    });

    //Common validation for login and registration.
    $.validator.setDefaults({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 6
            }
        },
        messages: {
            email: {
                required: "You must enter an email address.",
                email: "You've entered an invalid email address."
            },
            password: {
                required: "You must enter a password.",
                minlength: "Your password must be at least {0} characters."
            }
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

    class Animal {

        constructor(name) {
          this.speed = 0;
          this.name = name;
        }
      
        run(speed) {
          this.speed += speed;
          alert(`${this.name} runs with speed ${this.speed}.`);
        }
      
        stop() {
          this.speed = 0;
          alert(`${this.name} stopped.`);
        }
      
      }
      
      // Inherit from Animal
      class Rabbit extends Animal {
        hide() {
          alert(`${this.name} hides!`);
        }
      }


}  //END SERVER CODE


