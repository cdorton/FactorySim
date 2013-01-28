FactorySim.module("Sim", function(Sim, App, Backbone, Marionette, $, _){

    Sim.Router = Marionette.AppRouter.extend({
        appRoutes:{
            "": "main"
        }
    });

    Sim.Controller = Marionette.Controller.extend({
        initialize: function(options){

            App.factory = new App.Factory.Factory(options);

        },

        main:function(){
            var view = new App.Factory.WelcomeView();
            this.listenTo(view, "login", this._login);
            App.mainRegion.show(view);
        },

        _login: function(users){
            App.settings.users = users;
            this._showLayout();
        },

        _showLayout:function(){

            // Show the clock
            var clockView = new App.Factory.ClockView({model:App.factory.clock});
            App.clockRegion.show(clockView);

            // Show the bank
            var bankView = new App.Factory.BankAccountView({model: App.factory.bank});
            App.bankRegion.show(bankView);

            // Show the options
            var optionsView = new App.Factory.OptionsView();
            App.optionsRegion.show(optionsView);

            var floorView = new App.Floor.FloorView({collection: App.factory.floor});
            App.mainRegion.show(floorView);

            // Show the workforce
            var WFview = new App.Workers.WorkforceView({collection: App.factory.workforce});
            App.workforceRegion.show(WFview);

            // Listen for end of the week event
            this.listenTo(App.vent, "clock:weekOver", this._showEndOfWeek);
        },

        _showEndOfWeek: function(){
            // Close other views
            App.clockRegion.close();
            App.bankRegion.close();
            App.workforceRegion.close();
            // Show Stats
            //App.mainRegion
        }

    });

    Sim.addInitializer(function(){
        App.controller = new Sim.Controller();
        App.router = new Sim.Router({controller: App.controller});
    });

});