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
	var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";

	return BaseController.extend("dksh.connectclient.headerblockorder.controller.MainView", {
		onInit: function () {
			// Pre Set Model (Base Controller)
			this.preSetModel(this.getView());
			this.oFragmentList = [];

			this.getView().setBusy(true);
			Promise.all([this.formatter.fetchUserInfo.call(this)]).then(function (oRes) {
				this.formatter.fetchSaleOrder.call(this);
			}.bind(this)).catch(this._displayError.bind(this));
		},
		onSortPress: function (oEvent, sId, sPath, sField) {
			var oView = this.getView(),
				oList = oView.byId(sId),
				oBinding = oList.getBinding("items"),
				settingModel = oView.getModel("settings"),
				aSorter = [],
				bDesc = !settingModel.getProperty(sPath);

			settingModel.setProperty(sPath, !settingModel.getProperty(sPath));
			aSorter.push(new Sorter(sField, bDesc, false));
			oBinding.sort(aSorter);
		},
		onDetailTableSortPress: function (oEvent, sField) {
			var sIcon = oEvent.getSource().getProperty("icon"),
				oBinding = oEvent.getSource().getParent().getParent().getParent().getBinding("items"),
				aSorters = [];

			if (sIcon === "sap-icon://drill-down") {
				oEvent.getSource().setProperty("icon", "sap-icon://drill-up");
				aSorters.push(new Sorter(sField, true, false));
			} else {
				oEvent.getSource().setProperty("icon", "sap-icon://drill-down");
				aSorters.push(new Sorter(sField, false, false));
			}
			oBinding.sort(aSorters);
		},
		onExpandAll: function (oEvent) {
			var oHeaderBlockModel = this.getView().getModel("HeaderBlockModel"),
				oData = oHeaderBlockModel.getProperty("/data");
			for (var index in oData) {
				oData[index].expanded = true;
			}
			oHeaderBlockModel.refresh();
		},
		onCollapseAll: function (oEvent) {
			var oHeaderBlockModel = this.getView().getModel("HeaderBlockModel"),
				oData = oHeaderBlockModel.getProperty("/data");
			for (var index in oData) {
				oData[index].expanded = false;
			}
			oHeaderBlockModel.refresh();
		},
		onResetValueHelp: function (oEvent) {
			var oFilterModel = this.getView().getModel("filterModel");
			this.resetModel(oFilterModel, Object.keys(this.getView().getModel("filterModel").getData()));
		},
		onPressPersonalization: function (oEvent) {
			this.getView().setModel({
				deletePersBtnVisible: false,
				savePersBtnVisible: false
			}, "FilterPersonalization");
			this._loadFragment("Personalization").bind(this);
		},
		onPressFilterPersonalization: function (oEvent) {

		},
		onSearchValueForHeader: function (oEvent) {
			var sValue = oEvent.getParameters().newValue,
				oBinding = this.byId("idList").getBinding("items"),
				aFilters = [];

			if (!oEvent.getParameters().clearButtonPressed && sValue) {
				var oFilter = new Filter({
					filters: this.setBindingFilter(["salesOrderNum", "decisionSetId"], sValue, oBinding),
					and: false
				});
				aFilters.push(oFilter);
				oBinding.filter(aFilters);
			} else {
				oBinding.filter(null);
			}
		},
		onItemTableFreeSearch: function (oEvent) {
			var sValue = oEvent.getParameters().newValue,
				// Can't get ID by view since each panel ID is generated dynamically from control itself
				// In this case, have to use sap.ui.core() to get the object of the sId
				sId = oEvent.getSource().getParent().getParent().getId(),
				oBinding = sap.ui.getCore().byId(sId).getBinding("items"),
				aFilters = [];

			if (!oEvent.getParameters().clearButtonPressed && sValue) {
				var oFilterString = new Filter({
						filters: this.setBindingFilter(["salesItemOrderNo", "shortText", "sapMaterialNum", "salesUnit", "netPrice", "splPrice",
								"netWorth", "storageLoc", "batchNum", "materialGroup",
								"materialGroup4", "itemDlvBlockText", "itemDlvBlock", "itemCategText", "itemCategory", "oldMatCode", "itemStagingStatus"
							],
							sValue, oBinding),
						and: false
					}),
					oFilterNumber = new Filter({
						filters: this.setBindingFilter(["orderedQtySales"],
							sValue, oBinding),
						and: false
					}),
					aBindingFilters = new Filter({
						filters: [oFilterString, oFilterNumber]
					});
				aFilters.push(aBindingFilters);
				oBinding.filter(aFilters);
			} else {
				oBinding.filter(null);
			}
		},
		// On Search data
		onSearchSalesHeader: function (oEvent, oFilterSaleOrder) {
			this.formatter.fetchSaleOrder.call(this);
		},
		onSearchSoldToParty: function (oEvent, sFragment, sId) {
			this._setBindFilterStp(sId);
			if (!this.oFragmentList[sFragment]) {
				this.oFragmentList[sFragment].setModel(new JSONModel({}), "SoldToPartyModel");
			} else {
				var oSoldToPartyModel = this.oFragmentList[sFragment].getModel("SoldToPartyModel");
				oSoldToPartyModel.setProperty("/totalRecords", oSoldToPartyModel.getProperty("/totalRecords"));
			}
		},
		onLiveSearchSoldToParty: function (oEvent, sId) {
			var sValue = oEvent.getParameters().newValue;
			var oFilterData = this.getView().getModel("filterModel").getData(),
				bCheck = true;

			if (!oFilterData.stp_id && !oFilterData.stp_name && !oFilterData.stp_soldorg && !oFilterData.stp_division && !oFilterData.stp_distchnl) {
				bCheck = false;
			}
			if (!oEvent.getParameters().clearButtonPressed && sValue && bCheck) {
				this._setBindFilterStp(sId, sValue);
				return;
			}
			if (bCheck) {
				this._setBindFilterStp(sId);
			}
		},
		onResetSoldToParty: function (oEvent) {
			var oFilterModel = this.getView().getModel("filterModel");
			this.resetModel(oFilterModel, ["stp_id", "stp_name", "stp_soldorg", "stp_division", "stp_distchnl"]);
		},
		onLiveChange: function (oEvent, sCode, sDescription) {
			var value = oEvent.getParameters().value,
				oBinding = oEvent.getSource().getBinding("items"),
				aFilter = [];
			if (this.vhFilter) {
				aFilter.push(new Filter({
					filters: this.vhFilter.aFilters.map(function (obj) {
						return obj;
					}),
					and: false
				}));
			}
			if (value) {
				aFilter.push(new Filter({
					filters: [new Filter(sCode, FilterOperator.Contains, value), new Filter(sDescription, FilterOperator.Contains, value)],
					and: false
				}));
			}
			oBinding.filter(new Filter(aFilter, true));
		},
		handleAdd: function (oEvent, sPath, sProperty, sBindModel, sPathReset, sPathSoldParty) {
			var selectedObj = oEvent.getParameters().selectedContexts[0].getObject(),
				oModel = this.getView().getModel(sBindModel),
				sPathM = (this.valueHelpId.includes("idstp")) ? sPathSoldParty : sPath;

			oModel.setProperty(sPathM, selectedObj[sProperty]);
			// Need to enhacne next time
			// For storage and batch value help
			if (this.sItemPath) {
				var oSelectedObj = oEvent.getParameters().selectedContexts[0].getObject();
				oModel.setProperty(this.sItemPath + sPath, oSelectedObj[sProperty]);
				if (sPathReset) {
					oModel.setProperty(this.sItemPath + sPathReset, "");
				}
			}
		},
		handleCloseValueHelp: function (oEvent, sFragmentName) {
			if (this.oFragmentList[sFragmentName]) {
				this.oFragmentList[sFragmentName].close();
			}
			this.getView().setBusy(false);
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
		onHeaderSubmission: function (oEvent, aHeader, sFragmentName) {
			var oLoadDataModel = this.getView().getModel("LoadDataModel");

			// due to java side design, pass approval status at item level for header for now
			aHeader.salesDocItemList.map(function (item) {
				item.acceptOrReject = "A";
			});
			this._getTable("idList").setBusy(true);
			// Trigger endpoint for submission
			var sUrl = "/DKSHJavaService/taskSubmit/processECCJobNew";
			this.formatter.postJavaService.call(this, oLoadDataModel, sUrl, JSON.stringify(aHeader)).then(function (oJavaRes) {
				if (oLoadDataModel.getData().status === "FAILED") {
					this._displayError(oLoadDataModel.getData().message, "SubmitFailedMessage").bind(this);
					return;
				}
				var fnCloseApprove = function (oAction) {
					if (oAction === "OK") {
						this._getTable("idList").setBusy(false);
						this.formatter.fetchSaleOrder.call(this);
					}
				}.bind(this);
				MessageBox.show(this.getText("SubmitSuccessMessage"), {
					icon: MessageBox.Icon.INFORMATION,
					title: "Information",
					actions: [MessageBox.Action.OK],
					onClose: fnCloseApprove,
					initialFocus: MessageBox.Action.OK,
					styleClass: sResponsivePaddingClasses
				});
			}.bind(this)).catch(function (oErr) {
				this._displayError(oErr).bind(this);
			});
		},
		handleCreditBlockPress: function (oEvent, sOrderNum) {
			var oButton = oEvent.getSource(),
				sFragmentPath = this.getText("MainFragmentPath"),
				oView = this.getView(),
				oModel = this.getOwnerComponent().getModel(),
				oItemRow = {},
				aFilters = [];

			oItemRow["salesOrderNum"] = sOrderNum;
			oItemRow["creditBlock"] = oButton.getProperty("text");
			var oFilter = new Filter({
				filters: this.setODataFilter([
					"salesOrderNum", "creditBlock"
				], oItemRow),
				and: true
			});
			aFilters.push(oFilter);

			if (!this.oFragmentList["CreditBlockReasons"]) {
				Fragment.load({
					id: oView.getId(),
					name: this.formatter.getFragmentPath(sFragmentPath, "CreditBlockReasons"),
					controller: this
				}).then(function (oPopover) {
					Promise.all([this.formatter.fetchData.call(this, oModel, "/CreditStatusSet", aFilters)]).
					then(function (oRes) {
						this.oFragmentList["CreditBlockReasons"] = oPopover;
						oView.addDependent(oPopover);
						this.oFragmentList["CreditBlockReasons"].setModel(new JSONModel(oRes[0]), "CreditBlockReasonsModel");
						this.oFragmentList["CreditBlockReasons"].openBy(oButton);
					}.bind(this)).catch(this._displayWarning.bind(this));
				}.bind(this));
			} else {
				Promise.all([this.formatter.fetchData.call(this, oModel, "/CreditStatusSet", aFilters)]).
				then(function (oRes) {
					this.oFragmentList["CreditBlockReasons"].openBy(oButton);
				}.bind(this)).catch(this._displayWarning.bind(this));
			}
		},
		onUpdateFinished: function (oEvent, sFragment) {
			if (this.oFragmentList[sFragment]) {
				this.oFragmentList[sFragment].getModel("SoldToPartyModel").setProperty("/totalRecords", oEvent.getParameter("total"));
			}
		},
		onSubmitSoldtoParty: function (oEvent) {
			var oTable = this._getTable("idSTPTable"),
				oFilterModel = this.getView().getModel("filterModel"),
				sPath = oTable.getSelectedContextPaths()[0],
				oItem = oTable.getModel().getProperty(sPath);

			oFilterModel.setProperty("/soldtoParty", oItem.stp_id);
			oFilterModel.setProperty("/distChannel", oItem.stp_distchnl);
			oFilterModel.setProperty("/division", oItem.stp_division);
			oFilterModel.setProperty("/salesOrg", oItem.stp_soldorg);
			this.handleCancel(oEvent, "SoldToParty");
		},
		valueHelpRequest: function (oEvent, sFragment, sField, sAccess, bCheckAccess) {
			var oUserAccessModel = this.getView().getModel("UserAccess"),
				aClearFragment = ["SoldToParty"];

			if (!oUserAccessModel.getData()[sAccess] && (sAccess) && bCheckAccess) {
				MessageToast.show(this.getText("NoDataAccess"));
				return;
			}
			// Switch to model next time
			this.valueHelpId = oEvent.getSource().getId();
			this.vhFilter = "";
			if (oUserAccessModel.getData()[sAccess]) {
				var aValue = oUserAccessModel.getData()[sAccess].split("@");
				// retrieve for blank code
				aValue.push("");
				this.vhFilter = new Filter({
					filters: aValue.map(function (value) {
						return new Filter(sField, FilterOperator.EQ, value);
					}),
					and: false
				});
			}
			// Destroy fragment avoid duplicate id occur for sold to party
			if (aClearFragment.includes(sFragment) && this.oFragmentList[sFragment]) {
				this.oFragmentList[sFragment].destroy(true);
			}
			this._loadFragment(sFragment, oEvent);
		},
		onPressRefresh: function () {
			this.formatter.fetchSaleOrder.call(this);
		},
		onReset: function (oEvent) {
			var oFilterModel = this.getView().getModel("filterModel");

			oFilterModel.setData({});
			oFilterModel.updateBindings(true);
		}
	});

});