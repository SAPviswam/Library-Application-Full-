
// sap.ui.define(
//     [
//         "./BaseController",
//         "sap/ui/model/json/JSONModel",
//         "sap/m/MessageBox",
//         "sap/m/MessageToast"
//     ],
//     function(Controller, JSONModel, MessageBox,MessageToast) {
//         "use strict";
  
//         return Controller.extend("com.app.library.controller.allBooks", {
//             onInit: function() {
//                 const oRouter = this.getOwnerComponent().getRouter();
//                 oRouter.attachRoutePatternMatched(this.onUserDetailsLoad, this);
//             },

//             onUserDetailsLoad: function(oEvent) {
//                 const { id } = oEvent.getParameter("arguments");
//                 this.ID = id;
//                 const oObjectPage = this.getView().byId("idUserPage");
//                 oObjectPage.bindElement(`/Users(${id})`);
//             },

//             setHeaderContext: function() {
//                 var oView = this.getView();
//                 oView.byId("Bookstitle").setBindingContext(
//                     oView.byId("_IDGenTable1").getBinding("items").getHeaderContext()
//                 );
//             },
//             // onSearch: function (oEvent) {
//             //     // Get the search query
//             //     var sQuery = oEvent.getParameter("query");
        
//             //     // Build filters based on the search query
//             //     var aFilters = [];
//             //     if (sQuery) {
//             //         aFilters.push(new sap.ui.model.Filter({
//             //             filters: [
//             //                 new sap.ui.model.Filter("title", sap.ui.model.FilterOperator.Contains, sQuery),
//             //                 new sap.ui.model.Filter("author", sap.ui.model.FilterOperator.Contains, sQuery),
//             //                 new sap.ui.model.Filter("genre", sap.ui.model.FilterOperator.Contains, sQuery)
//             //             ],
//             //             and: false
//             //         }));
//             //     }
//             //     // Get the table and binding
//             //     var oTable = this.byId("idAllBookTable");
//             //     var oBinding = oTable.getBinding("items");
//             //     // Apply the filters to the binding
//             //     oBinding.filter(aFilters);
//             // },
//             onSearch: function(oEvent) {
//                 // Get the search query
//                 var sQuery = oEvent.getParameter("query");

//                 // Get the table and its items
//                 var oTable = this.byId("idAllBookTable");
//                 var oItemsBinding = oTable.getBinding("items");

//                 // Check if oItemsBinding exists
//                 if (!oItemsBinding) {
//                     MessageToast.show("No items to search.");
//                     return;
//                 }

//                 // Retrieve the list of items
//                 var oItems = oItemsBinding.oList;

//                 // Check if oItems exists
//                 if (!oItems) {
//                     MessageToast.show("No items found.");
//                     return;
//                 }

//                 // Define a filter function for case-sensitive search
//                 var aFilteredItems = oItems.filter(function(item) {
//                     return (item.title.includes(sQuery) || 
//                             item.author.includes(sQuery) || 
//                             item.genre.includes(sQuery));
//                 });

//                 // Create filters to apply to the binding
//                 var aFilters = aFilteredItems.map(function(item) {
//                     return new sap.ui.model.Filter({
//                         path: oItemsBinding.sPath,
//                         operator: sap.ui.model.FilterOperator.EQ,
//                         value1: item
//                     });
//                 });

//                 // Apply the filters to the binding
//                 oItemsBinding.filter(aFilters);
//             },
//             onReservePress: function(oEvent) {
//                 var oSelectedItem = oEvent.getSource();
//                 var userId = this.ID;

//                 if (this.byId("idAllBookTable").getSelectedItems().length > 1) {
//                     MessageToast.show("Please Select only one Book");
//                     return;
//                 }

//                 var oSelectedBook = this.byId("idAllBookTable").getSelectedItem().getBindingContext().getObject();
//                 var oQuantity = oSelectedBook.availability - 1;
//                 var sBookTitle = oSelectedBook.title;

//                 MessageBox.confirm(`Do you want to reserve the book "${sBookTitle}"?`, {
//                     actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
//                     onClose: async function(oAction) {
//                         if (oAction === MessageBox.Action.OK) {
//                             const userModel = new sap.ui.model.json.JSONModel({
//                                 user_ID: userId,
//                                 book_ID: oSelectedBook.ID,
//                                 reservedDate: new Date(),
//                                 book: {
//                                     availability: oQuantity
//                                 }
//                             });
//                             this.getView().setModel(userModel, "userModel");

//                             const oPayload = this.getView().getModel("userModel").getProperty("/"),
//                                 oModel = this.getView().getModel("ModelV2");

//                             try {
//                                 await this.createData(oModel, oPayload, "/IssueBooks");
//                                 // sap.m.MessageBox.success("You reserved the book.");
//                             } catch (error) {
//                                 sap.m.MessageBox.error("Some technical issue occurred.");
//                             }
//                         }
//                     }.bind(this)
//                 });
//             }
//         });
//     }
// );
sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageBox",
        "sap/m/MessageToast"
    ],
    function(Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
        "use strict";
  
        return Controller.extend("com.app.library.controller.allBooks", {
            onInit: function() {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.attachRoutePatternMatched(this.onUserDetailsLoad, this);
            },

            onUserDetailsLoad: function(oEvent) {
                const { id } = oEvent.getParameter("arguments");
                this.ID = id;

                // Make sure the view is rendered before accessing the element
                const oView = this.getView();
                oView.attachEventOnce("afterRendering", function() {
                    const oObjectPage = oView.byId("idUserPage");
                    if (oObjectPage) {
                        oObjectPage.bindElement(`/Users(${id})`);
                    } else {
                        MessageToast.show("User page not found.");
                    }
                });
            },

            setHeaderContext: function() {
                var oView = this.getView();
                oView.byId("Bookstitle").setBindingContext(
                    oView.byId("_IDGenTable1").getBinding("items").getHeaderContext()
                );
            },

            onSearch: function(oEvent) {
                // Get the search query
                var sQuery = oEvent.getParameter("query");
                if (!sQuery) {
                    sQuery = oEvent.getParameter("newValue");
                }
            
                // Define filters for case-sensitive and case-insensitive search
                var aFilters = [];
                if (sQuery) {
                    var oFilterCaseSensitive = new Filter({
                        filters: [
                            new Filter("title", FilterOperator.Contains, sQuery),
                            new Filter("author", FilterOperator.Contains, sQuery),
                            new Filter("genre", FilterOperator.Contains, sQuery)
                        ],
                        and: false,
                        caseSensitive: true // Case-sensitive filter
                    });
            
                    var oFilterCaseInsensitive = new Filter({
                        filters: [
                            new Filter("title", FilterOperator.Contains, sQuery),
                            new Filter("author", FilterOperator.Contains, sQuery),
                            new Filter("genre", FilterOperator.Contains, sQuery)
                        ],
                        and: false,
                        caseSensitive: true // Case-insensitive filter
                    });
            
                    aFilters.push(oFilterCaseSensitive, oFilterCaseInsensitive);
                }
            
                // Get the table and its binding
                var oTable = this.byId("idAllBookTable");
                var oBinding = oTable.getBinding("items");
            
                // Apply the filters to the binding
                oBinding.filter(aFilters);
            },
            
           
            onReservePress: function(oEvent) {
                var oSelectedItem = oEvent.getSource();
                var userId = this.ID;

                if (this.byId("idAllBookTable").getSelectedItems().length > 1) {
                    MessageToast.show("Please Select only one Book");
                    return;
                }

                var oSelectedBook = this.byId("idAllBookTable").getSelectedItem().getBindingContext().getObject();
                var oQuantity = oSelectedBook.availability - 1;
                var sBookTitle = oSelectedBook.title;

                MessageBox.confirm(`Do you want to reserve the book "${sBookTitle}"?`, {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    onClose: async function(oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            const userModel = new sap.ui.model.json.JSONModel({
                                user_ID: userId,
                                book_ID: oSelectedBook.ID,
                                reservedDate: new Date(),
                                book: {
                                    availability: oQuantity
                                }
                            });
                            this.getView().setModel(userModel, "userModel");

                            const oPayload = this.getView().getModel("userModel").getProperty("/"),
                                oModel = this.getView().getModel("ModelV2");

                            try {
                                await this.createData(oModel, oPayload, "/IssueBooks");
                                // sap.m.MessageBox.success("You reserved the book.");
                            } catch (error) {
                                sap.m.MessageBox.error("Some technical issue occurred.");
                            }
                        }
                    }.bind(this)
                });
            }
        });
    }
);
