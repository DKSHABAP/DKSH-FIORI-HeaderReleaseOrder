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
			this._preSetModel(this.getView());
			this.getRouter().getRoute("MainView").attachMatched(this._onRouteMatched, this);
			// this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			// this.oFragmentList = [];

			// this.getView().setBusy(true);
			// Promise.all([this.formatter.fetchUserInfo.call(this)]).then(function (oRes) {
			// 	var oUserData = this.getView().getModel("UserInfo").getData();
			// 	var fnReturnPayload = function (appId) {
			// 		return {
			// 			userId: oUserData.name,
			// 			appId: appId,
			// 			runType: "Web",
			// 			emailId: oUserData.email
			// 		};
			// 	};
			// 	Promise.all([
			// 		this.formatter.postJavaService.call(this, this.getView().getModel("SearchHelpPersonalization"),
			// 			this.getText("getVariant"), JSON.stringify(fnReturnPayload("keySearchReleaseBlock")), "POST"),
			// 		this.formatter.postJavaService.call(this, this.getView().getModel("SoItemPersonalizationModel"),
			// 			this.getText("getVariantRelease"), JSON.stringify(fnReturnPayload(
			// 				"keyHeaderReleaseBlock@keyItemReleaseBlock")), "POST"),
			// 		this.formatter.fetchSaleOrder.call(this)
			// 	]).then(function (_oRes) {
			// 		Object.assign(this.formatter.setNumericAndSort(_oRes[0], ["sequence"]), this._returnPersDefault());
			// 		this.getView().getModel("SearchHelpPersonalization").refresh();
			// 		Object.assign(_oRes[1], this._returnPersDefault());
			// 		this.getView().setBusy(false);
			// 	}.bind(this)).catch(function (oErr) {
			// 		this._displayError(oErr);
			// 	}.bind(this));
			// }.bind(this)).catch(function (oErr) {
			// 	this._displayError(oErr);
			// }.bind(this));
		},
		/** 
		 * Routing logic for MainView
		 * @constructor 
		 * @param oEvent Event parameter
		 */
		_onRouteMatched: function (oEvent) {
			var oArgument = oEvent.getParameter("arguments");
			var oQuery = {
				sdn: oArgument["sdn"] || null
			};
			var oFilterModel = this.getView().getModel("filterModel");
			var oFilterData = oFilterModel.getData();
			if (oQuery.sdn) {
				oFilterData.salesDocNumInitial = oQuery.sdn;
				oFilterData.salesDocNumEnd = oQuery.sdn;
			}
			oFilterModel.refresh();
			this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oFragmentList = [];

			this.getView().setBusy(true);
			Promise.all([this.formatter.fetchUserInfo.call(this)]).then(function (oRes) {
				var oUserData = this.getView().getModel("UserInfo").getData();
				var fnReturnPayload = function (appId) {
					return {
						userId: oUserData.name,
						appId: appId,
						runType: "Web",
						emailId: oUserData.email
					};
				};
				Promise.all([
					this.formatter.postJavaService.call(this, this.getView().getModel("SearchHelpPersonalization"),
						this.getText("getVariant"), JSON.stringify(fnReturnPayload("keySearchReleaseBlock")), "POST"),
					this.formatter.postJavaService.call(this, this.getView().getModel("SoItemPersonalizationModel"),
						this.getText("getVariantRelease"), JSON.stringify(fnReturnPayload(
							"keyHeaderReleaseBlock@keyItemReleaseBlock")), "POST"),
					this.formatter.fetchSaleOrder.call(this)
				]).then(function (_oRes) {
					Object.assign(this.formatter.setNumericAndSort(_oRes[0], ["sequence"]), this._returnPersDefault());
					this.getView().getModel("SearchHelpPersonalization").refresh();
					Object.assign(_oRes[1], this._returnPersDefault());
					this.getView().setBusy(false);
				}.bind(this)).catch(function (oErr) {
					this._displayError(oErr);
				}.bind(this));
			}.bind(this)).catch(function (oErr) {
				this._displayError(oErr);
			}.bind(this));
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
			this.formatter.fetchSaleOrder.call(this).then(function () {
				this.getView().setBusy(false);
			}.bind(this));
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
			var sUrl = "/DKSHJavaService/taskSubmit/processECCJobNew";
			this.formatter.postJavaService.call(this, oLoadDataModel, sUrl, JSON.stringify(aHeader), "POST").then(function (oJavaRes) {
				if (oLoadDataModel.getData().status === "FAILED") {
					this._displayError(oLoadDataModel.getData().message, "SubmitFailedMessage").bind(this);
					return;
				}
				var fnCloseApprove = function (oAction) {
					if (oAction === "OK") {
						this._getTable("idList").setBusy(false);
						this.formatter.fetchSaleOrder.call(this).then(function () {
							this.getView().setBusy(false);
						}.bind(this));
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
				this._displayError(oErr);
			}.bind(this));
		},
		handleCreditBlockPress: function (oEvent, sOrderNum) {
			var oButton = oEvent.getSource(),
				sFragmentPath = this.getText("MainFragmentPath"),
				oView = this.getView(),
				oModel = this.getOwnerComponent().getModel(),
				aFilters = [];

			var oFilter = new Filter({
				filters: [new Filter("salesOrderNum", FilterOperator.EQ, sOrderNum)],
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
					this.oFragmentList["CreditBlockReasons"].setModel(new JSONModel(oRes[0]), "CreditBlockReasonsModel");
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
		onPressPersonalization: function (oEvent, sFragmentName, sModel) {
			this.getView().setModel(new JSONModel(JSON.parse(this.getView().getModel(sModel).getJSON())), "initialValueModel");
			this._loadXMLFragment(this.getText("MainFragmentPath"), sFragmentName, this.getView().getModel(sModel), sModel).bind(this);
		},
		onPresBtnShVariant: function (oEvent, sFragmentName, oModel, sModelName, sAction, isItemPers) {
			if (sAction === "Create") {
				if (isItemPers) {
					this._setPersCreationSetting(oModel.getData().header.userPersonaDto);
					this._setPersCreationSetting(oModel.getData().item.userPersonaDto);
				} else {
					this._setPersCreationSetting(oModel.getData().userPersonaDto);
				}
				var aSet = ["isSetCreatable", "isBtnVisible", "isListEnabled"];
				for (var index in aSet) {
					var oSet = aSet[index];
					oModel.setProperty("/" + oSet, !oModel.getData()[oSet]);
				}
			} else if (sAction === "Cancel") {
				var oInitialData = JSON.parse(JSON.stringify(this.getView().getModel("initialValueModel").getData()));
				oModel.setData(oInitialData, this._returnPersDefault());
			} else if (sAction === "Edit") {
				aSet = ["isBtnVisible", "isDelBtnVisible", "isListEnabled", "isEdit"];
				for (index in aSet) {
					oSet = aSet[index];
					oModel.setProperty("/" + oSet, !oModel.getData()[oSet]);
				}
			}
			this.oFragmentList[sFragmentName].getModel(sModelName).refresh();
		},
		onChangeVariant: function (oEvent, oModel, sModel, sFragmentName) {
			var oUserData = this.getView().getModel("UserInfo").getData(),
				sVariantUrl = (sFragmentName === "SearchHelpPersonalization") ? "variantListUrl" : "variantReleaseListUrl",
				sUrl = this.oResourceBundle.getText(sVariantUrl, [oUserData.name, (oEvent) ? oEvent.getParameters().selectedItem.getKey() :
					"Default"
				]);
			this.callJavaServicePersonalization(oModel, sModel, "CHANGE", null, sUrl, sFragmentName);
		},
		onVariantUpdate: function (oEvent, oModel, sModel, sAction, sFragmentName, isItemPers) {
			var oUserData = this.getView().getModel("UserInfo").getData();
			if (!oModel.getData().newVariant && !oModel.getData().isEdit) {
				oModel.setProperty("/valueState", "Error");
				this.oFragmentList[sFragmentName].getModel(sModel).refresh();
				return;
			}
			var sVariant = (oModel.getData().isEdit) ? oModel.getData().currentVariant : oModel.getData().newVariant;
			oModel.setProperty("/valueState", "None");
			var oPayload = (isItemPers) ? this._returnItemVarPayload(oModel, oUserData, sVariant) : this._returnShVarPayload(oModel, oUserData,
					"keySearchReleaseBlock", sVariant),
				sUrl = (isItemPers) ? this.getText("updateVariantRelease") : this.getText("updateVariant");
			this.callJavaServicePersonalization(oModel, sModel, sAction, JSON.stringify(oPayload), sUrl, sFragmentName);
		},
		onVariantDelete: function (oEvent, oModel, sModel, sAction, sFragmentName, isItemPers) {
			var fnClose = function (oAction) {
				if (oAction === "CANCEL") {
					return;
				}
				var oUserData = this.getView().getModel("UserInfo").getData(),
					oPayload = (isItemPers) ? this._returnItemVarPayload(oModel, oUserData, oModel.getData().currentVariant) : this._returnShVarPayload(
						oModel, oUserData, "keySearchReleaseBlock", oModel.getData().currentVariant),
					sUrl = (isItemPers) ? this.getText("deleteVariantRelease") : this.getText("deleteVariant");
				this.callJavaServicePersonalization(oModel, sModel, sAction, JSON.stringify(oPayload), sUrl, sFragmentName);
			}.bind(this);
			MessageBox.show(this.oResourceBundle.getText("variantDeleteMsg", [oModel.getData().currentVariant]), {
				icon: MessageBox.Icon.INFORMATION,
				title: "Confirmation",
				actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
				onClose: fnClose,
				initialFocus: MessageBox.Action.CANCEL,
				styleClass: sResponsivePaddingClasses
			});
		},
		callJavaServicePersonalization: function (oModel, sModel, sAction, oPayload, sUrl, sFragmentName) {
			var sMethod = (sAction === "SAVE") ? "PUT" : (sAction === "DELETE") ? "DELETE" : "POST";
			this.getView().setBusy(true);
			this.formatter.postJavaService.call(this, this.getView().getModel("LoadDataModel"), sUrl, oPayload, sMethod).then(function (_oRes) {
				if (sMethod === "DELETE") {
					oModel.setData(Object.assign(oModel.getData(), this._returnPersDefault()));
					oModel.getData().variantName.splice(oModel.getData().variantName.findIndex(function (item) {
						return item.name === oModel.getData().currentVariant;
					}), 1);
					this.onChangeVariant(null, oModel, sModel, sFragmentName);
					return;
				}
				if (sMethod === "PUT") {
					if (oModel.getData().newVariant) {
						oModel.getData()["variantName"].push({
							name: oModel.getData().newVariant
						});
					}
					oModel.setData(Object.assign(oModel.getData(), this._returnPersDefault()));
				}
				if (sFragmentName === "SearchHelpPersonalization") {
					oModel.setProperty("/currentVariant", _oRes.userPersonaDto[0].variantId);
					oModel.setProperty("/userPersonaDto", this.formatter.setNumericAndSort(_oRes, ["sequence"]).userPersonaDto);
				} else {
					oModel.setProperty("/currentVariant", _oRes.header.userPersonaDto[0].variantId);
					oModel.setProperty("/header/userPersonaDto", _oRes.header.userPersonaDto);
					oModel.setProperty("/item/userPersonaDto", _oRes.item.userPersonaDto);
				}
				var oInitialData = JSON.parse(JSON.stringify(oModel.getData()));
				this.getView().getModel("initialValueModel").setData(oInitialData);
				this.oFragmentList[sFragmentName].getModel(sModel).refresh();
				this.getView().setBusy(false);
			}.bind(this)).catch(function (oErr) {
				this._displayError(oErr);
			}.bind(this));
		},
		onAfterClose: function (oEvent, oModel, sModelName, sFragmentName) {
			this.onPresBtnShVariant(oEvent, sFragmentName, oModel, sModelName, "Cancel", false);
		},
		onPressRefresh: function () {
			this.formatter.fetchSaleOrder.call(this).then(function () {
				this.getView().setBusy(false);
			}.bind(this));
		},
		onReset: function (oEvent) {
			var oFilterModel = this.getView().getModel("filterModel");
			oFilterModel.setData({});
			oFilterModel.updateBindings(true);
		}
	});

});