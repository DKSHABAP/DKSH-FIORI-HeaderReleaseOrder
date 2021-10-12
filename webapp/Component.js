sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"dksh/connectclient/headerblockorder/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("dksh.connectclient.headerblockorder.Component", {

		metadata: {
			manifest: "json"
		},

		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model	
			this.setModel(models.createDeviceModel(), "device");

			// jQuery.sap.registerModulePath("dksh.connectclient.itemblockorder", "./connectclientitemblockorder");

			// jQuery.sap.require("dksh.connectclient.itemblockorder.Component");
		}
	});
});