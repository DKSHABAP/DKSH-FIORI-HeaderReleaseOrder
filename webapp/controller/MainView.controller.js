sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, Fragment, Sorter, Filter, FilterOperator, MessageBox, MessageToast) {
	"use strict";

	return BaseController.extend("dksh.connectclient.headerblockorder.controller.MainView", {
		onInit: function () {
			var oView = this.getView();
			// Pre Set Model (Base Controller)
			this.preSetModel(oView);
			this.oFragmentList = [];

			Promise.all([this.formatter.fetchUserInfo.call(this)]).then(function (oRes) {}.bind(this));
			// check this later
			/*			this.claimedTaskId = [];*/
			/*			oView.setModel(JSONModel(), "oClaimTaskModel");*/
		},
		onExpand: function (oEvent) {

		},
		onSortPress: function (oEvent) {
			var oView = this.getView(),
				oList = oView.byId("idList"),
				oBinding = oList.getBinding("items"),
				settingModel = oView.getModel("settings"),
				aSorter = [];

			aSorter.push(new Sorter("SaleOrder", !settingModel.getProperty("/panelSort"), false));
			oBinding.sort(aSorter);
			settingModel.setProperty("/panelSort", !settingModel.getProperty("/panelSort"));

			// OData need to refresh
			this._refresh();
		},
		onExpandAll: function (oEvent) {
			var MockDataModel = this.getView().getModel("MockData"),
				oWorkBoxDtos = MockDataModel.getProperty("/workBoxDtos");
			for (var index in oWorkBoxDtos) {
				oWorkBoxDtos[index].expanded = true;
			}
			MockDataModel.refresh();

		},
		onCollapseAll: function (oEvent) {
			var MockDataModel = this.getView().getModel("MockData"),
				oWorkBoxDtos = MockDataModel.getProperty("/workBoxDtos");
			for (var index in oWorkBoxDtos) {
				oWorkBoxDtos[index].expanded = false;
			}
			MockDataModel.refresh();
		},
		onPressFilterPersonalization: function (oEvent) {

		},
		valueHelpRequest: function (oEvent, sFragment, sPath, sAccess, filter1) {
			var oView = this.getView(),
				oUserAccessModel = oView.getModel("UserAccess"),
				filter = [];

			if (!oUserAccessModel.getData()[sAccess] && (sAccess)) {
				MessageToast.show(this.getText("NoDataAccess"));
				return;
			}
			filter.push(new Filter("Language", FilterOperator.EQ, (sap.ui.getCore().getConfiguration().getLanguage() === "th") ? "2" : "EN"));
			if (sAccess) {
				filter.push(new Filter(filter1, FilterOperator.EQ, oUserAccessModel.getData()[sAccess]));
			}

			var aFilters = [],
				oFilter = new Filter({
					filters: filter,
					and: true
				}),
				oValueHelpModel = this.getOwnerComponent().getModel("ValueHelp"),
				sFragmentPath = this.getText("FragmentPath");

			this.valueHelpId = oEvent.getSource().getId();
			aFilters.push(oFilter);
			if (!this.oFragmentList[sFragment]) {
				Fragment.load({
					id: oView.getId(),
					name: this.formatter.getFragmentPath(sFragmentPath, sFragment),
					controller: this
				}).then(function (oDialog) {
					Promise.all([this.formatter.fetchData.call(this, oValueHelpModel, sPath, aFilters)]).
					then(function (oRes) {
						this.oFragmentList[sFragment] = oDialog;
						oView.addDependent(oDialog);
						this.oFragmentList[sFragment].setModel(new JSONModel(oRes[0]), "ValueHelpSet");
						this.oFragmentList[sFragment].open();
					}.bind(this)).catch(function (oErrResp) {});
				}.bind(this)).catch(function (oErr) {});
			} else {
				this.oFragmentList[sFragment].open();
			}
		},
		valueHelpRequestSoldToParty: function (oEvent) {
			var oView = this.getView(),
				sFragmentPath = this.getText("FragmentPath");

			this.valueHelpId = oEvent.getSource().getId();
			if (!this.oFragmentList["SoldToParty"]) {
				Fragment.load({
					id: oView.getId(),
					name: this.formatter.getFragmentPath(sFragmentPath, "SoldToParty"),
					controller: this
				}).then(function (oDialog) {
					this.oFragmentList["SoldToParty"] = oDialog;
					oView.addDependent(oDialog);
					this.oFragmentList["SoldToParty"].open();
				}.bind(this)).catch(function (oErr) {});
			} else {
				this.oFragmentList["SoldToParty"].open();
			}
		},
		onLiveChange: function (oEvent, sFilter1, sFilter2) {
			var value = oEvent.getParameters().value,
				filters = [],
				oFilter = new Filter([new Filter(sFilter1, FilterOperator.Contains, value),
					new Filter(sFilter2, FilterOperator.Contains, value)
				]),
				oBinding = oEvent.getSource().getBinding("items");

			filters.push(oFilter);
			oBinding.filter(filters);
		},
		handleAdd: function (oEvent, sPath, sPathSoldToPart, sProperty) {
			var oView = this.getView(),
				selectedObj = oEvent.getParameters().selectedContexts[0].getObject(),
				oFilterModel = oView.getModel("filterModel");
			oEvent.getSource().getBinding("items").filter([]);
			if (!selectedObj) {
				return;
			}
			if (this.valueHelpId.includes("idSoldToPart")) {
				oFilterModel.setProperty(sPathSoldToPart, selectedObj[sProperty]);
			} else {
				oFilterModel.setProperty(sPath, selectedObj[sProperty]);
			}
		},
		handleCloseValueHelp: function (oEvent, sFragmentName) {
			if (this.oFragmentList[sFragmentName]) {
				this.oFragmentList[sFragmentName].close();
			}
		},
		//	On Cancel for particular fragment
		handleCancel: function (oEvent, sFragmentName) {
			this.valueHelpId = "";
			if (oEvent.getSource().getBinding("items")) {
				oEvent.getSource().getBinding("items").filter([]);
			}
			if (this.oFragmentList[sFragmentName]) {
				this.oFragmentList[sFragmentName].close();
			}
		},
		onSearchSoldToParty: function (oEvent) {
			var oView = this.getView(),
				oData = oView.getModel("filterModel").getData();
			if (!oData.SoldToPartId && !oData.SoldToPartName && !oData.SoldToPartSaleOrg && !oData.SoldToPartDivision && !oData.SoldToPartDistChannel) {
				MessageBox.information(this.getText("ItemSelectFilter"));
				return;
			}
			this._getSmartTable("idSoldToPartSmartTable").rebindTable();
		},
		onBeforeRebindTable: function (oEvent) {
			var oView = this.getView(),
				oBinding = oEvent.getParameter("bindingParams"),
				oData = oView.getModel("filterModel").getData(),
				afilters = [];
			if (oData.SoldToPartId) {
				afilters.push(new Filter("CustCode", FilterOperator.EQ, oData.SoldToPartId));
			}
			if (oData.SoldToPartName) {
				afilters.push(new Filter("Name1", FilterOperator.EQ, oData.SoldToPartName));
			}
			if (oData.SoldToPartSaleOrg) {
				afilters.push(new Filter("SalesOrg", FilterOperator.EQ, oData.SoldToPartSaleOrg));
			}
			if (oData.SoldToPartDivision) {
				afilters.push(new Filter("Division", FilterOperator.EQ, oData.SoldToPartDivision));
			}
			if (oData.SoldToPartDistChannel) {
				afilters.push(new Filter("Distchl", FilterOperator.EQ, oData.SoldToPartDistChannel));
			}
			afilters.push(new Filter("languageID", FilterOperator.EQ, "E"));

			var bindFilters = new Filter({
				filters: afilters,
				and: true
			});
			oBinding.filters.push(bindFilters);
		},
		onSubmitSoldtoParty: function (oEvent) {
			var oView = this.getView(),
				oTable = this._getTable("idSoldtoPartyTable"),
				oFilterModel = oView.getModel("filterModel"),
				sPath = oTable.getSelectedContexts()[0].sPath,
				oData = oTable.getModel().getProperty(sPath);

			oFilterModel.setProperty("/selectedSoldToParty", oData.CustCode);
			this.handleCancel(oEvent, "SoldToParty");
		},
		onResetValueHelp: function (oEvent) {
			var oFilterModel = this.getView().getModel("filterModel");

			oFilterModel.setData({});
			oFilterModel.updateBindings(true);
		},
		onResetSoldToParty: function (oEvent) {
			var oFilterModel = this.getView().getModel("filterModel");

			oFilterModel.setProperty("/SoldToPartId", "");
			oFilterModel.setProperty("/SoldToPartName", "");
			oFilterModel.setProperty("/SoldToPartSaleOrg", "");
			oFilterModel.setProperty("/SoldToPartDivision", "");
			oFilterModel.setProperty("/SoldToPartDistChannel", "");
			oFilterModel.updateBindings(true);
		},

		_refresh: function () {
			var oView = this.getView(),
				oModel = oView.getModel();

		},
		_resetModel: function (oEvent) {

		},
		_getSmartTable: function (sId) {
			return this.getView().byId(sId);
		},
		_getTable: function (sId) {
			return this.getView().byId(sId);
		}
	});

});