FactorySim.module("FactoryFloorApp.Show", function(Show, App, Backbone, Marionette, $, _){

    var ResourceView = Marionette.ItemView.extend({
        template: "#resource-template",
        className: "floor-item resource span2",

        bindings: {
            ".purchased": "purchased",
            ".inventory": "inventory"
        },

        ui: {
            toggleBtn: ".js-toggle"
        },

        events: {
            "click .js-toggle": "grabFocus",
            "click .js-buy": "onBuyClicked",
            "keyup input": "onBuyKeyUp"
        },

        modelEvents: {
            "change:purchased": "closeBuy",
            "change:_error": "showBuyError"
        },


        onRender: function() {
            this.stickit();
            this.$el.css({
                left: Show.COLLUMNS[this.model.get("x")],
                top: Show.ROWS[this.model.get("y")]
            });
        },

        onShow: function () {
            var opts = this.getPopoverOptions();
            this.ui.toggleBtn.popover(opts);
        },

        getPopoverOptions: function () {
            return {
                title: "How many?!",
                html: true,
                content: _.template($("#resource-popover-template").html()),
                placement: "left"
            };
        },

        grabFocus: function (){
            this.$("input").focus();
        },

        onBuyClicked: function (event) {
            var val = $(event.target).siblings("input").val();
            this._buy(val);
        },

        onBuyKeyUp: function (e) {
            this.hideError();
            if(e.keyCode == 13){
                this._buy(this.$("input").val());
            }
        },

        _buy: function (val) {
            this.hideError();
            if(!_.isEmpty(val)){
                val = parseInt(val, 10);
                if(!_.isNaN(val)){
                    this.trigger("buy:resource", val);
                } else {
                    return this.showError("You must specify a number.");
                }
            } else {
                this.closeBuy();
            }
        },

        closeBuy:function () {
            this.ui.toggleBtn.popover("hide");
        },

        showBuyError: function(model, value){
            if(!_.isEmpty(value)){
                this.showError(value);
            }
        },

        showError: function (error) {
            var group = this.$(".control-group");
            group.addClass("error");
            group.find(".help-block").text(error);
        },

        hideError:function () {
            var group = this.$(".control-group");
            group.removeClass("error");
            group.find(".help-block").text("");
        }

    });


    // Make the Resource View a floor item
    // There's gotta be a better place for this
    _.extend(ResourceView, App.Views.FloorItemMixin);

    Show.ResourcesView = Marionette.CollectionView.extend({
        itemView: ResourceView,
        itemViewEventPrefix: "childView"
    });


});