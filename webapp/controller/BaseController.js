sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"dksh/connectclient/headerblockorder/formatter/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"
], function (Controller, UIComponent, formatter, JSONModel, Filter, FilterOperator, Fragment, MessageBox) {
	"use strict";

	return Controller.extend("dksh.connectclient.headerblockorder.controller.BaseController", {
		formatter: formatter,

		preSetModel: function (oView) {
			var oMockData = this.getOwnerComponent().getModel("MockData"),
				oDataValueHelpModel = this.getOwnerComponent().getModel("ValueHelp_SoldToParty");
			oView.setModel(oDataValueHelpModel);
			oView.setModel(new JSONModel(), "oUserDetailModel");
			oView.setModel(new JSONModel({
				panelSort: true,
				isPageBusy: false
			}), "settings");
			oView.setModel(new JSONModel({
				"soldtoParty": "",
				"salesDocNumInitial": "",
				"salesDocNumEnd": "",
				"distChannel": "",
				"initialDate": null,
				"endDate": null,
				"materialGroup4": "",
				"materialGroup": "",
				"salesOrg": "",
				"division": "",
				"customerPoNo": "",
				"itemDeliveryBlock": "",
				"shipToparty": "",
				"headerDeliveryBlock": "",
				"materialCode": "",
				"salesTeam": "",
				"salesTerritory": "",
				"orderType": "",
				"isAdmin": false
			}), "filterModel");
			oView.setModel(oMockData, "MockData");
			oView.setModel(new JSONModel(), "LoadDataModel");
			oView.setModel(new JSONModel({
				"count": 0
			}), "HeaderBlockModel");
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
		setBindingFilter: function (aFilterProperties, sFilterValue, oBinding) {
			var aFilters = [];

			for (var indx in aFilterProperties) {
				var sProperty = aFilterProperties[indx];
				if (typeof (oBinding.oList[0][sProperty]) === "string") {
					aFilters.push(new Filter(sProperty, FilterOperator.Contains, sFilterValue));
				} else {
					aFilters.push(new Filter(sProperty, FilterOperator.EQ, +sFilterValue));
				}
			}
			return aFilters;
		},
		setODataFilter: function (aProperties, oItemRow) {
			var aFilters = [];

			for (var indx in aProperties) {
				if (oItemRow[aProperties[indx]]) {
					aFilters.push(new Filter(aProperties[indx], FilterOperator.EQ, oItemRow[aProperties[indx]].toString()));
				}
			}
			return aFilters;
		},
		_setBindFilterStp: function (sId, sSearchValue) {
			var oFilterData = this.getView().getModel("filterModel").getData();
			if (!oFilterData.stp_id && !oFilterData.stp_name && !oFilterData.stp_soldorg && !oFilterData.stp_division && !oFilterData.stp_distchnl) {
				MessageBox.information(this.getText("ItemSelectFilter"));
				return;
			}
			var aFilters = [],
				oUserAccessModel = this.getView().getModel("UserAccess"),
				oBinding = this._getTable(sId).getBinding("items"),
				aProperties = ["stp_id", "stp_name", "stp_soldorg", "stp_division", "stp_distchnl"],
				aSearchProperties = ["stp_id", "stp_name", "division_text", "dist_chnl_text", "sold_org_text"],
				aDataAccess = {
					stp_soldorg: "ATR01",
					stp_division: "ATR03",
					stp_distchnl: "ATR02"
				};
			for (var index in aProperties) {
				var sProperty = aProperties[index],
					aValue = [];
				if (oFilterData[sProperty]) {
					aValue.push(oFilterData[sProperty]);
				}
				if (Object.keys(aDataAccess).includes(sProperty) && !oFilterData[sProperty]) {
					aValue = [];
					var sAccess = aDataAccess[sProperty];
					var sIAccess = oUserAccessModel.getData()[sAccess];
					if (sIAccess) {
						aValue = (sIAccess !== "*" ? sIAccess.split("@") : []);
					}
				}
				if (aValue.length === 0) {
					continue;
				}
				aFilters.push(new Filter({
					filters: [new Filter({
						filters: aValue.map(function (value) {
							return new Filter(sProperty, FilterOperator.Contains, value);
						}),
						and: false
					})],
					and: true
				}));
			}
			if (sSearchValue) {
				aFilters.push(new Filter({
					filters: aSearchProperties.map(function (sProperties) {
						return new Filter(sProperties, FilterOperator.Contains, sSearchValue);
					}),
					and: false
				}));
			}
			oBinding.filter(aFilters, true);
		},
		resetModel: function (oModel, aProperties) {
			aProperties.map(function (aProperty) {
				var sPath = ["/", aProperty].join("");
				if (typeof oModel.getProperty(sPath) === "string") {
					oModel.setProperty(sPath, "");
				} else if (typeof oModel.getProperty(sPath) === "boolean") {
					oModel.setProperty(sPath, false);
				} else if (oModel.getProperty(sPath) instanceof Date) {
					oModel.setProperty(sPath, null);
				}
			});
			oModel.updateBindings(true);
		},
		_loadFragment: function (sFragment, oEvent) {
			var sFragmentPath = this.getText("FragmentPath");
			this.getView().setBusy(true);
			Fragment.load({
				id: this.getView().getId(),
				name: this.formatter.getFragmentPath(sFragmentPath, sFragment),
				controller: this
			}).then(function (oDialog) {
				this.oFragmentList[sFragment] = oDialog;
				this.getView().addDependent(oDialog);
				if (this.vhFilter) {
					var oItemBinding = this.oFragmentList[sFragment].getBinding("items");
					oItemBinding.filter(this.vhFilter);
				}
				if (sFragment === "SoldToParty") {
					this.oFragmentList[sFragment].setModel(new JSONModel({
						"totalRecords": 0
					}), "SoldToPartyModel");
				}
				this.getView().setBusy(false);
				this.oFragmentList[sFragment].open();
			}.bind(this)).catch(function (oErr) {
				this._displayWarning(oErr).bind(this);
			}.bind(this));
		},
		_displayWarning: function (oResponse) {
			if (oResponse.responseText) {
				var errMsg = JSON.parse(oResponse.responseText).error.message.value;
				MessageBox.warning(errMsg);
			} else {
				MessageBox.warning(oResponse);
			}
			this.getView().setBusy(false);
			this._getTable("idList").setBusy(false);
		},
		_displayError: function (oResponse, si18nKey) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			if (oResponse.responseText) {
				var sMessage = new DOMParser().parseFromString(oResponse.responseText, 'text/html').getElementsByTagName('h1')[0].outerText;
				MessageBox.error("Something went wrong...\nPlease try to reload the page.", {
					title: "Error",
					details: oResourceBundle.getText("errorDetail", [oResponse.statusCode, sMessage]),
					contentWidth: "110px"
				});
			} else {
				MessageBox.error(this.getText(si18nKey), {
					title: "Error",
					details: oResponse,
					contentWidth: "110px"
				});
			}
			this.getView().setBusy(false);
			this._getTable("idList").setBusy(false);
		},
		_getTable: function (sId) {
			return this.getView().byId(sId);
		}
	});
});