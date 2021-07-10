// jQuery.sap.declare("com.dkhs.util.Formatter");

// com.dkhs.util.formatter = {

// 	fn_panelClass: function(type){
// 		return "hideContent";
// 	}
// };
// });

sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
	"use strict";
	return {
		getFragmentPath: function (sFragmentPath, sFragmentName) {
			return sFragmentPath + sFragmentName;
		},
		fetchUserInfo: function () {
			var oView = this.getView();
			return new Promise(
				function (resolve, reject) {
					oView.getModel("UserInfo").loadData("/services/userapi/currentUser").then(function () {
						var oUserInfoModel = oView.getModel("UserInfo"),
							oUserAccessModel = oView.getModel("UserAccess");

						oView.getModel("UserManagement").loadData("/UserManagement/service/scim/Users/" + oUserInfoModel.getProperty(
							"/name")).then(function (oUserMgtRes) {

						}.bind(this));
						// resolved only when user access has been retrieved
						oUserAccessModel.loadData("/DKSHJavaService2/userDetails/findAllRightsForUserInDomain/" + oUserInfoModel.getData().name +
								"&cc")
							.then(function (oUserAccessResp) {
								resolve(oUserAccessResp);
							}).catch(function (oErr) {});

						oView.getModel("UserManagement").loadData("/UserManagement/service/scim/Users/" + oUserInfoModel.getProperty(
							"/name")).then(function (oUserMgtRes) {}.bind(this));
					}.bind(this)).catch(function (oErr) {
						oView.setBusy(false);
						reject(oErr);
					});
				}.bind(this)
			);
		},
		fetchData: function (oModel, sPath, aFilters) {
			return new Promise(
				function (resolve, reject) {
					oModel.read(sPath, {
						filters: aFilters,
						success: function (oData, oResponse) {
							resolve(oData);
						}.bind(this),
						error: function (error) {
							reject(error);
						}.bind(this)
					});
				});
		},
		fn_panelClass: function (sStatus) {
			// alert("abc");
			return "";
		},

		itemSlockBlock: function () {

		},
		reservedTask: function (processor, taskowner) {
			/*			if (processor !== "") {
							if (processor !== taskowner) {
								return true;
							} else {
								return false;
							}
						} else {
							return false;
						}*/
		},
		approveHeaderEnable: function (processor, taskowner) {
			/*			if (processor !== "") {
							if (processor !== taskowner) {
								return false;
							} else {
								return true;
							}
						} else {
							return true;
						}*/
		},

		status: function (val) {
			/*			if (val === "Display Only") {
							return "Warning";
						} else if (val === "Approved") {
							return "Success";
						} else if (val === "Rejected") {
							return "Error";
						} else if (val === "Pending Approval") {
							return "Information";
						} else if (val === "Pending Approval by previous level") {
							return "Information";
						} else if (val === "Rejected by Previous Level") {
							return "Error";
						}*/
		},

		concatenateBatch: function (val1, val2, val3) {
			if (val1 && val2 && val3) {
				// var date = val2.getDate();
				// var month = val2.getMonth();
				// var year = val2.getYear();
				var a = new Date(val2);

				var Oval2 = a.toLocaleDateString();
				// var Oval2 = [date, month, year].join('/');
				return val1 + " " + "(" + Oval2 + ")" + " " + "(" + val3 + ")";
			} else {
				return "";
			}
		},

		dateFormatter: function (pTimeStamp) {
			if (pTimeStamp === undefined) {
				return;
			}
			var a = new Date(pTimeStamp);
			var dateFormat = a.toLocaleDateString();
			return dateFormat;
			// var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			// 	pattern: "dd/MM/YYYY"
			// });
			// return dateFormat.format(new Date(pTimeStamp));
		},
		hideMultipleFilter: function (key) {
			if (key === "salesDocNumEnd" || key === "endDate" || key === "approvalType" || key === "storageLocText") {
				return false;
			} else {
				return true;
			}
		},
		approveRejectText: function (mark) {
			if (mark === "R") {
				return "Rejected";
			}
			if (mark === "A") {
				return "Approved";
			}
			return "";
		},
		getDecisionSet: function (taskDec) {
			return taskDec.split("|")[0];
		},
		getLevel: function (taskDec) {
			return taskDec.split("|")[2];
		},
		getDate: function (taskDec) {
			return taskDec.split("|")[6];
		},
		setBlurVisibility: function (visiblity) {
			if (visiblity === 13) {
				return "";
			} else if (visiblity === 14) {
				return "BLUR";
			} else if (visiblity === 15) {
				return "BLURGreen";
			}

		},

		setStockBlock: function (itemStockBlock) {
			if (itemStockBlock !== null) {
				return "ACTIVE";
			}
		},

		formatNumber: function (sValue1, sValue2) {
			sValue1 = parseFloat(sValue1).toFixed(2);
			// return val1.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + val2;
			if (sValue1 !== undefined && sValue1 !== null) {
				sValue1 = sValue1.toString();
			}

			if (sValue2 == null)
				sValue2 = "";
			if (sValue1 == "" || sValue1 == undefined) {
				return "";
			} else {
				var x = sValue1;
				x = x.toString();
				var afterPoint = '';
				if (x.indexOf('.') > 0)
					afterPoint = x.substring(x.indexOf('.'), x.length);
				x = Math.floor(x);
				x = x.toString();
				var lastThree = x.substring(x.length - 3);
				var otherNumbers = x.substring(0, x.length - 3);
				if (otherNumbers != '')
					lastThree = ',' + lastThree;
				var res = otherNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + lastThree + afterPoint;
				if (sValue2 != "")
					return res + " (" + sValue2 + ")";
				else if (sValue2 == "" || sValue2 == undefined)
					return res;
			}

		},

		setEditRestriction: function (levelNum, processor, taskOwner) {
			if (processor === "" && levelNum === "L1") {
				return true;
			} else if (processor === taskOwner && levelNum === "L1") {
				return true;
			} else {
				return false;
			}

			if (levelNum) {
				if (levelNum === "L1") {
					return true;
				} else {
					return false;
				}
			}

		},

		setARRestriction: function (processor, taskOwner) {
			if (processor === "") {
				return true;
			} else if (processor === taskOwner) {
				return true;
			} else {
				return false;
			}
		},

		setMarkIcon: function (oAction) {
			if (oAction === "A") {
				return "sap-icon://circle-task-2";
			} else if (oAction === "R") {
				return "sap-icon://circle-task-2";
			} else {
				return "";
			}
		},
		setMarkVisibility: function (oAction) {
			if (oAction === "A" || oAction === "R") {
				return true;
			} else {
				return false;
			}
		},
		setMarkType: function (oAction) {
			if (oAction === "A") {
				return "Success";
			} else if (oAction === "R") {
				return "Error";
			} else {
				return "None";
			}
		},

		concatenateStrings: function (oVal1, oVal2, oVal3) {
			if (oVal1 === "") {
				oVal1 = 1;
			} else {
				oVal1 = parseFloat(oVal1);
			}
			if (oVal2 === "") {
				oVal2 = 1;
			} else {
				oVal2 = parseFloat(oVal2);
			}
			if (oVal1 && oVal2) {
				var val = oVal1 * oVal2;
				return val.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + "(" + oVal3 + ")";
				// return val.toFixed(2) + " " + oVal3;
			} else if (oVal1 && !oVal2) {
				val = oVal1 * oVal2;
				return val.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + "(" + oVal3 + ")";
				// return val.toFixed(2) + " " + oVal3;
			} else if (!oVal1 && oVal2) {
				val = oVal1 * oVal2;
				return val.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + "(" + oVal3 + ")";
				// return val.toFixed(2) + " " + oVal3;
			} else {
				return "";
			}
		},

		concatenateMaterial: function (oVal1, oVal2) {
			if (oVal1 && oVal2) {
				return oVal2 + " (" + oVal1 + ") ";
			} else if (oVal1 && !oVal2) {
				return oVal1;
			} else if (!oVal1 && oVal2) {
				return oVal2;
			} else {
				return "";
			}
		}

	};
});