FactorySim.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    var TOTAL_OPERATING_EXPENSE = 11000;

    Entities.Factory = Backbone.Model.extend({

        defaults: {
            // Time
            started: false,
            running: false,
            speed: 2,
            day: 1,
            hour: 0,
            minute: 0,

            // Money
            cash: 12725,
            profit: 0,
            runningRevenue: 0,
            purchaseExpense: 2725,
            operatingExpense: 0
        },

        initialize: function(options){
            this.workers = App.request("new:worker:entities");
            this.resources = App.request("new:resource:entities");
            this.jobs = App.request("new:job:entities");
            this.markets = App.request("new:market:entities");

            this.bindClockEvents();
        },

        bindClockEvents: function() {
            this.listenTo(App.vent, "clock:hour:over", this.payWorkers)
        },

        payWorkers: function () {
            var hourlyRate = TOTAL_OPERATING_EXPENSE / 40, // 5 days * 8 hours
                newOpperatingExpenses = this.get("operatingExpense") + hourlyRate,
                newCash = this.get("cash") - hourlyRate,
                newProfit = this.get("profit") - hourlyRate;

            this.set({
                "operatingExpense": newOpperatingExpenses,
                "cash": newCash,
                "profit": newProfit
            });
        },

        getFloorItem: function (id) {
            // most likely it will be a job
            return this.jobs.get(id) || this.resources.get(id) || this.markets.get(id);
        },

        start: function() {
            this.listenToGameEvents();
        },

        listenToGameEvents: function() {
            this.listenTo(App.vent, {
                "assign:job": this.assignJob,
                "purchase:resource": this.purchaseResource,
                "market:sold": this.addSale
            });
        },

        assignJob: function(worker, job) {
            // Make sure we have the models
            worker = this.workers.get(worker);
            job = this.jobs.get(job);
            var oldJob = worker.get("job");

            // Check if worker will take job first
            if(worker.assignJob(job)){
                if(oldJob) oldJob.workers.remove(worker);
                job.workers.add(worker);
            }
        },

        purchaseResource: function (resource, amount) {
            var total, cash, purchased, inventory;
            total = resource.get("price") * amount;
            cash = this.get("cash");
            if(cash > total){
                resource.addInventory(amount);
                this.set({
                    "cash": cash - total,
                    "purchaseExpense": this.get("purchaseExpense") + total
                });
            } else {
                resource.set("_error", "You do not have enough cash");
            }
        },

        addSale: function (cash, profit) {
            this.set({
                "cash": this.get("cash") + cash,
                "runningRevenue":  this.get("runningRevenue") + cash,
                "profit": this.get("profit") + profit
            });
        },

        startClock: function () {
            this.set({
                "started": true,
                "running": true
            });
        },

        stopClock: function () {
            this.set("running", false);
        }

    });

    App.reqres.setHandler("new:factory", function(){
        return new Entities.Factory();
    });

});