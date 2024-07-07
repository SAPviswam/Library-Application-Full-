
sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
],
    function (Controller, MessageToast, ODataModel, Filter, FilterOperator, JSONModel) {
        "use strict";

        return Controller.extend("com.app.library.controller.HomePage", {
            onInit: function () {
                var oModel = new ODataModel("/v2/BooksSrv/");
                this.getView().setModel(oModel);
                const oLocalModel = new JSONModel({
                    userName: "",
                    password: "",
                    email: "",
                    phoneNumber:"",
                    Address: "",
                    userType: "user",
                });
                this.getView().setModel(oLocalModel, "localModel");
            },

            onPressLogin: async function () {
                if (!this.loginDialog) {
                    this.loginDialog = await this.loadFragment("authenticate")
                }
                this.loginDialog.open();
            },

            oncancelbtn: function () {
                if (this.loginDialog.isOpen()) {
                    this.loginDialog.close()
                }
            },

            loginBtnClick: function () {
                var oView = this.getView();
                var sUsername = oView.byId("user").getValue();
                var sPassword = oView.byId("pswd").getValue();

                if (!sUsername || !sPassword) {
                    MessageToast.show("Please enter username and password.");
                    return;
                }

                var oModel = this.getView().getModel();
                oModel.read("/Users", {
                    filters: [
                        new Filter("email", FilterOperator.EQ, sUsername),
                        new Filter("password", FilterOperator.EQ, sPassword)
                    ],
                    success: function (oData) {
                        if (oData.results.length > 0) {
                            var userId = oData.results[0].ID;
                            var usertype = oData.results[0].userType;
                            MessageToast.show("Login Successful");
                            var oRouter = this.getOwnerComponent().getRouter();
                            if (usertype === "user") {
                                oRouter.navTo("RouteUserPage", { id: userId });
                            } else {
                                oRouter.navTo("RouteAdminPage", { id: userId });
                            }
                        } else {
                            MessageToast.show("Invalid username or password.");
                        }
                    }.bind(this),
                    error: function () {
                        MessageToast.show("An error occurred during login.");
                    }
                });
            },

            onBtnSignup: async function () {
                if (!this.signupDialog) {
                    this.signupDialog = await this.loadFragment("signup");
                }
                this.signupDialog.open();
            },

            onsignupcancelbtn: function () {
                if (this.signupDialog.isOpen()) {
                    this.signupDialog.close();
                }
            },

            onClearFilterPress: function () {
                this.byId("user").setValue("");
                this.byId("pswd").setValue("");
            },


            signupBtnClick: async function () {
                var oView = this.getView();
                const oPayload = oView.getModel("localModel").getProperty("/");
                var oModel = oView.getModel();

                var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                var phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;

                if (!(emailRegex.test(oPayload.email) && phoneRegex.test(oPayload.phoneNumber))) {
                    MessageToast.show("Please enter a valid Email and Phone Number");
                    return;
                }

                // Check if user already exists
                oModel.read("/Users", {
                    filters: [
                        new Filter("email", FilterOperator.EQ, oPayload.email)
                    ],
                    success: function (oData) {
                        if (oData.results.length > 0) {
                            MessageToast.show("User already exists. Please enter valid details");
                        } else {
                            // User does not exist, proceed with signup
                            this.createData(oModel, oPayload, "/Users").then(function() {
                                this.signupDialog.close();
                                MessageToast.show("Signup Successful");
                            }.bind(this)).catch(function() {
                                MessageToast.show("An error occurred during signup. Please try again.");
                            });
                        }
                    }.bind(this),
                    error: function () {
                        MessageToast.show("An error occurred during the check. Please try again.");
                    }
                });
            },

            createData: function (oModel, oPayload, sPath) {
                return new Promise(function (resolve, reject) {
                    oModel.create(sPath, oPayload, {
                        success: function (oData) {
                            resolve(oData);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                });
            },

            onEmailLiveChange: async function (oEvent) {
                var oEmail = oEvent.getSource();
                var oVal = oEmail.getValue();
                var regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (oVal.trim() === '') {
                    oEmail.setValueState("None");
                } else if (oVal.match(regexp)) {
                    oEmail.setValueState("Success");
                } else {
                    oEmail.setValueState("Error");
                    if (sap.m.MessageToast) {
                        sap.m.MessageToast.show("Invalid Email format");
                    } else {
                        console.error("MessageToast is not available.");
                    }
                }
            },

            onMobileVal: async function (oEvent) {
                var oPhone = oEvent.getSource();
                var oVal1 = oPhone.getValue();
                var regexpMobile = /^[0-9]{10}$/;
                if (oVal1.trim() === '') {
                    oPhone.setValueState("None");
                } else if (oVal1.match(regexpMobile)) {
                    oPhone.setValueState("Success");
                } else {
                    oPhone.setValueState("Error");
                    if (sap.m.MessageToast) {
                        sap.m.MessageToast.show("Invalid Phone format");
                    }
                }
            },

            clearInputs: function () {
                var oView = this.getView();
                oView.byId("user1").setValue("");
                oView.byId("password1").setValue("");
                oView.byId("email").setValue("");
                oView.byId("phoneNumber").setValue("");
                oView.byId("Address").setValue("");
            },
        });
    }
);
