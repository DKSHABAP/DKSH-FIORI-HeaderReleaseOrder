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
		onExpand: function (oEvent) {},
		onSortPress: function (oEvent, sId, sPath, sField) {
			var oView = this.getView(),
				oList = oView.byId(sId),
				oBinding = oList.getBinding("items"),
				settingModel = oView.getModel("settings"),
				aSorter = [];

			settingModel.setProperty(sPath, !settingModel.getProperty(sPath));
			aSorter.push(new Sorter(sField, settingModel.getProperty(sPath), false));
			oBinding.sort(aSorter);
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
		valueHelpRequestSoldToParty: function (oEvent, sFragment) {
			var oView = this.getView(),
				sFragmentPath = this.getText("FragmentPath");

			this.valueHelpId = oEvent.getSource().getId();
			if (!this.oFragmentList[sFragment]) {
				Fragment.load({
					id: oView.getId(),
					name: this.formatter.getFragmentPath(sFragmentPath, sFragment),
					controller: this
				}).then(function (oDialog) {
					this.oFragmentList[sFragment] = oDialog;
					oView.addDependent(oDialog);
					this.oFragmentList[sFragment].setModel(new JSONModel({
						"totalRecords": 0
					}), "SoldToPartyModel");
					this.oFragmentList[sFragment].open();
				}.bind(this)).catch(function (oErr) {});
			} else {
				this.oFragmentList[sFragment].open();
			}
		},
		onSearchSoldToParty: function (oEvent, sFragment, sPath, sId) {
			var oView = this.getView(),
				oData = oView.getModel("filterModel").getData(),
				oTable = this._getTable(sId),
				oValueHelpModel = oView.getModel("ValueHelp_SoldToParty"),
				aFilters = [];

			if (!oData.SoldToPartId && !oData.SoldToPartName && !oData.SoldToPartSaleOrg && !oData.SoldToPartDivision && !oData.SoldToPartDistChannel) {
				MessageBox.information(this.getText("ItemSelectFilter"));
				return;
			}
			debugger
			oTable.setBusy(true);
			var oFilter = new Filter({
				filters: this.setODataFilter([
					"CustCode", "Name1", "SalesOrg", "Division", "Distchl", "languageID"
				], {
					"CustCode": oData.SoldToPartId,
					"Name1": oData.SoldToPartName,
					"SalesOrg": oData.SoldToPartSaleOrg,
					"Division": oData.SoldToPartDivision,
					"Distchl": oData.SoldToPartDistChannel,
					"languageID": "E"
				}),
				and: true
			});
			aFilters.push(oFilter);
			this.formatter.fetchData.call(this, oValueHelpModel, sPath, aFilters).then(function (oRes) {
				Object.assign(oRes, {
					"totalRecords": oRes.results.length
				});
				this.oFragmentList[sFragment].setModel(new JSONModel(oRes), "SoldToPartyModel");
				oTable.setBusy(false);
			}.bind(this)).catch(function (oErr) {
				oTable.setBusy(false);
				var errMsg = JSON.parse(oErr.responseText).error.message.value;
				MessageBox.warning(errMsg);
			});
			/*			this._getSmartTable("idSoldToPartSmartTable").rebindTable();*/
		},
		onLiveSearchSoldToParty: function (oEvent, sId) {
			var sValue = oEvent.getParameters().newValue,
				oBinding = this._getTable(sId).getBinding("items"),
				aFilters = [];

			if (!oEvent.getParameters().clearButtonPressed && sValue) {
				var oFilterString = new Filter({
						filters: this.setBindingFilter(["CustCode", "Name1", "DName", "DCName", "SOrgName"],
							sValue, oBinding),
						and: false
					}),
					aBindingFilters = new Filter({
						filters: [oFilterString]
					});
				aFilters.push(aBindingFilters);
				oBinding.filter(aFilters);
			} else {
				oBinding.filter(null);
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