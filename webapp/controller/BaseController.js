sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"dksh/connectclient/headerblockorder/formatter/formatter",
	"sap/ui/model/json/JSONModel"
], function (Controller, UIComponent, formatter, JSONModel) {
	"use strict";

	return Controller.extend("dksh.connectclient.headerblockorder.controller.BaseController", {
		formatter: formatter,

		preSetModel: function (oView) {
			var oMockData = this.getOwnerComponent().getModel("MockData"),
				oDataValueHelpModel = this.getOwnerComponent().getModel("ValueHelp_SoldToParty");
			/*				oValueHelpModel = this.getOwnerComponent().getModel("ValueHelp");*/
			oView.setModel(oDataValueHelpModel);
			oView.setModel(new JSONModel({
				panelSort: false,
				isPageBusy: false
			}), "settings");
			oView.setModel(new JSONModel({}), "filterModel");
			oView.setModel(oMockData, "MockData");
			oView.setModel(new JSONModel(), "UserInfo");
			oView.setModel(new JSONModel(), "UserManagement");
			oView.setModel(new JSONModel(), "UserAccess");

		},
		getText: function (sText) {
			if (!sText) {
				return sText;
			}
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sText);
		},
		displayWarning: function () {

		},
		displayError: function () {

		}
	});
});