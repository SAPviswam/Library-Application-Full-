sap.ui.define([ 
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/Token",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, MessageBox, Token, MessageToast, Fragment, exportLibrary, Spreadsheet) {
        "use strict";
        var EdmType = exportLibrary.EdmType;
        return Controller.extend("com.app.library.controller.AdminPage", {
            onInit: function () {
                this.oQuantity = null;
                this.oAq = null;
                const oRouter = this.getOwnerComponent().getRouter();
          oRouter.attachRoutePatternMatched(this.onUserDetailsLoad,this);
        //         var oTable = this.byId("activeloansTable");
 
         
        //   var oColumn = oTable.getColumns()[7]; // Index 1 represents the second column
     
        //   // Hide the column
        //   oColumn.setVisible(false);
        

                const oLocalModel = new JSONModel({
 
                    ISBN: "",
                    title: "",
                    quantity: "",
                    author: "",
                    genre: "",
                    availability: "",
                    language: "",
 
                });
                this.getView().setModel(oLocalModel, "localModel");
 
                this.getOwnerComponent().getRouter().attachRoutePatternMatched(this.onBookListLoad, this);
            },
            setHeaderContext: function () {
                var oView = this.getView();
                oView.byId("Bookstitle").setBindingContext(
                    oView.byId("_IDGenTable1").getBinding("items").getHeaderContext());
            },
 
           
            onBookListLoad: function () {
                this.getView().byId("idBookTable").getBinding("items").refresh();
            },
            onUserDetailsLoad:function(oEvent){
                const{id}=oEvent.getParameter("arguments");
                this.ID=id;
                //const sRouterName=oEvent.getParameter("name");
                const oObjectPage=this.getView().byId("idBooksListPage");
     
                oObjectPage.bindElement(`/Users(${id})`);
            },

            onProfilePress: function () {
                this.loadProfileDialog().then(function (oDialog) {
                    var oViewModel = this.getView().getModel();
                    oDialog.setModel(oViewModel);
                    oDialog.bindElement(`/Users(${this.ID})`);
                    oDialog.open();
                }.bind(this));
            },
    
            loadProfileDialog: async function () {
                if (!this.oDialogProfile) {
                    this.oDialogProfile = await this.loadFragment("Admindetails");
                }
                return this.oDialogProfile;
            },
    
            onCloseProfile: function () {
                if (this.oDialogProfile) {
                    this.oDialogProfile.close();
                }
            },

            // Formatter function for phone number formatting
            formatPhoneNumber: function(phoneNumber) {
                // Remove commas from the phone number string
                if (typeof phoneNumber === "string") {
                    return phoneNumber.replace(/,/g, "");
                }
                return phoneNumber;
            },


    
        onSearch: function (oEvent) {
            // Get the search query
            var sQuery = oEvent.getParameter("query");
        
            // Build filters based on the search query
            var aFilters = [];
            if (sQuery) {
                // Check if the query is a number
                if (!isNaN(sQuery)) {
                    aFilters.push(new sap.ui.model.Filter({
                        filters: [
                            // new sap.ui.model.Filter("ISBN", sap.ui.model.FilterOperator.Contains, sQuery),
                            new sap.ui.model.Filter("title", sap.ui.model.FilterOperator.Contains, sQuery),
                            new sap.ui.model.Filter("author", sap.ui.model.FilterOperator.Contains, sQuery),
                            new sap.ui.model.Filter("genre", sap.ui.model.FilterOperator.Contains, sQuery),
                            new sap.ui.model.Filter("quantity", sap.ui.model.FilterOperator.EQ, parseInt(sQuery, 10)),
                            new sap.ui.model.Filter("availability", sap.ui.model.FilterOperator.EQ, parseInt(sQuery, 10)),
                        ],
                        and: false
                    }));
                } else {
                    aFilters.push(new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter("ISBN", sap.ui.model.FilterOperator.Contains, sQuery),
                            new sap.ui.model.Filter("title", sap.ui.model.FilterOperator.Contains, sQuery),
                            new sap.ui.model.Filter("author", sap.ui.model.FilterOperator.Contains, sQuery),
                            new sap.ui.model.Filter("genre", sap.ui.model.FilterOperator.Contains, sQuery),
                        ],
                        and: false
                    }));
                }
            }
        
            // Get the table and binding
            var oTable = this.byId("idBookTable");
            var oBinding = oTable.getBinding("items");
        
            // Apply the filters to the binding
            oBinding.filter(aFilters);
        },
            onCreateBtnPress: async function () {
                if (!this.createDialog) {
                    this.createDialog = await this.loadFragment("createBooks")
                }
                this.createDialog.open();
            },
            onCloseCreateDialog: function () {
                if (this.createDialog.isOpen()) {
                    this.createDialog.close()
                }
               
            },
            
            onDeleteBtnPress: async function () {
                var aSelectedItems = this.byId("idBookTable").getSelectedItems();
            
                if (aSelectedItems.length === 0) {
                    MessageToast.show("Select a title to delete.");
                    return;
                }
            
                if (aSelectedItems.length > 1) {
                    MessageToast.show("Please select only one title to delete at a time.");
                    return;
                }
            
                // Add confirmation dialog before deleting
                MessageBox.confirm("Are you sure you want to delete the selected book?", {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            var sISBN = aSelectedItems[0].getBindingContext().getObject().ISBN;
            
                            aSelectedItems[0].getBindingContext().delete("$auto", {
                                success: function () {
                                    MessageToast.show("Successfully deleted");
                                    this.getView().byId("idBookTable").removeSelections(true);
                                    this.getView().byId("idBookTable").getBinding("items").refresh();
                                }.bind(this),
                                error: function (oError) {
                                    MessageToast.show("Deletion Error: " + oError.message);
                                }
                            });
                        }
                    }.bind(this)
                });
            },
           
            onCreate: async function () {
                var oPayload = this.getView().getModel("localModel").getProperty("/"),
                    oModel = this.getView().getModel("ModelV2");
                
                oPayload.availability = oPayload.quantity;
                this.getView().getModel("localModel").setData(oPayload);
                
                // Check if all required fields are entered
                if (!(oPayload.ISBN && oPayload.author && oPayload.availability && oPayload.genre && oPayload.language && oPayload.quantity && oPayload.title)) {
                    MessageToast.show("Enter all details");
                    return;
                }
                
                // Validate ISBN length (must be exactly 17 characters)
                if (oPayload.ISBN.length !== 17) {
                    MessageToast.show("ISBN must be 17 characters long");
                    return;
                }
            
                try {
                    // Check if title already exists
                    const titleExist = await this.checkTitle(oModel, oPayload.title, oPayload.ISBN);
                    if (titleExist) {
                        MessageToast.show("Book with the same Title and ISBN already exists");
                        return;
                    }
            
                    // Create new book data
                    await this.createData(oModel, oPayload, "/Books");
                    this.createDialog.close();
                    this.getView().byId("idBookTable").getBinding("items").refresh();
            
                    // Show success message
                    MessageToast.show("New Title is added");
                } catch (error) {
                    this.createDialog.close();
                    MessageBox.error("Some technical issue occurred");
                }
            },
            
            checkTitle: async function (oModel, stitle, sISBN) {
                return new Promise((resolve, reject) => {
                    oModel.read("/Books", {
                        filters: [
                            new Filter("title", FilterOperator.EQ, stitle),
                            new Filter("ISBN", FilterOperator.EQ, sISBN)
                        ],
                        success: function (oData) {
                            resolve(oData.results.length > 0);
                        },
                        error: function () {
                            reject("An error occurred while checking book existence.");
                        }
                    });
                });
            },
            onCloseUpdateDialog: function () {
                if (this.updateDialog.isOpen()) {
                    this.updateDialog.close()
                }
            },

            onActiveLoansFilterPress: async function () {
                if (!this.activeloansDialog) {
                    this.activeloansDialog = await this.loadFragment("activeLoans")
                }
                this.activeloansDialog.open();
            },
            onIssueBooksFilterPress: async function () {
                if (!this.issueBooksDialog) {
                    this.issueBooksDialog = await this.loadFragment("issueBooks")
                }
                this.issueBooksDialog.open();
            },
            onissuebookscancelbtn: function () {
                if (this.issueBooksDialog.isOpen()) {
                    this.issueBooksDialog.close()
                }
            },
            onactiveloanscancelbtn: function () {
                if (this.activeloansDialog.isOpen()) {
                    this.activeloansDialog.close()
                }
            },
 
 
            onCloseloanpress: async function () {
                var aSelectedItems = this.byId("activeloansTable").getSelectedItems();
                var obj = this.byId("activeloansTable").getSelectedItem().getBindingContext().getObject(),
                oId=obj.book.ID,
                oAvaiable = obj.book.availability+1;
                const userModel = new sap.ui.model.json.JSONModel({
                   
                    book:{
                        availability:oAvaiable
                    }
 
                });
                this.getView().setModel(userModel, "userModel");
 
                const oPayload = this.getView().getModel("userModel").getProperty("/"),
                    oModel = this.getView().getModel("ModelV2");
                    try{
                        oModel.update("/Books(" + oId + ")", oPayload.book, {
                            success: function() {
                                 this.getView().byId("idBooksTable").getBinding("items").refresh();//
                                //this.oEditBooksDialog.close();
                            },
                            error: function(oError) {
                                //this.oEditBooksDialog.close();
                                sap.m.MessageBox.error("Failed to update book: " + oError.message);
                            }.bind(this)
                        });
                    }catch (error) {
                        //this.oCreateBooksDialog.close();
                        sap.m.MessageBox.error("Some technical Issue");
                    }
    
                if (aSelectedItems.length > 0) {
                    var aISBNs = [];
                    aSelectedItems.forEach(function (oSelectedItem) {
                        var sISBN = oSelectedItem.getBindingContext().getObject().isbn;
                        aISBNs.push(sISBN);
                        oSelectedItem.getBindingContext().delete("$auto");
                    });
 
                    Promise.all(aISBNs.map(function (sISBN) {
                        return new Promise(function (resolve, reject) {
                            resolve("Loan closed successfully ");
                        });
                    })).then(function (aMessages) {
                        aMessages.forEach(function (sMessage) {
                            MessageToast.show(sMessage);
                        });
                    }).catch(function (oError) {
                        MessageToast.show("Deletion Error: " + oError);
                    });
 
                    //this.getView().byId("activeloansTable").removeSelections(true);
                    this.getView().byId("activeloansTable").getBinding("items").refresh();
                } else {
                    MessageToast.show("Please Select Rows to Delete");
                };
                //location.reload();
           

            },
           
            onUpdateBtnPress: async function () {
                var oSelected = this.byId("idBookTable").getSelectedItems();
            
                if (oSelected.length === 0) {
                    MessageToast.show("Select a Title to Edit");
                    return
                }
             
                if (oSelected.length > 1) {
                    MessageToast.show("Select only one Title to Edit");
                    return
                }
                // var oSelect = oSelected
                if(oSelected){
                    var oID = oSelected[0].getBindingContext().getProperty("ID");
                    var oISBN = oSelected[0].getBindingContext().getProperty("ISBN");
                    var oTitle = oSelected[0].getBindingContext().getProperty("title");
                    var oAuthor = oSelected[0].getBindingContext().getProperty("author");
                    this.oQuantity = oSelected[0].getBindingContext().getProperty("quantity");
                    this.oAq = oSelected[0].getBindingContext().getProperty("availability");
                    var oGenre = oSelected[0].getBindingContext().getProperty("genre");
                    var oLanguage = oSelected[0].getBindingContext().getProperty("language");
                    
                    
            
                    var newBookModel = new sap.ui.model.json.JSONModel({
                        ID:oID,
                        ISBN:oISBN,
                        title: oTitle,
                        author: oAuthor,
                        quantity:this.oQuantity,
                        genre:oGenre,
                        availability:this.oAq,
                        language:oLanguage,

                    });
            
                    this.getView().setModel(newBookModel, "newBookModel");
                    if (!this.updateDialog) {
                        this.updateDialog = await this.loadFragment("updateBooks")
                    }
                    this.updateDialog.open();
                }
                
            },
        
        onUpdate: function() {
            var oQ = parseInt(this.getView().byId("idQuantityInput").getValue());
            var oAq = parseInt(this.getView().byId("idavailabilityInput").getValue());
        
            // Check if availability is greater than quantity
            if (oAq > oQ) {
                sap.m.MessageToast.show("Availability cannot be greater than Quantity");
                return;
            }
        
            // Calculate changes in availability
            var deltaQuantity = oQ - this.oQuantity;
            var newAvailability = this.oAq + deltaQuantity;
        
            var oPayload = this.getView().getModel("newBookModel").getData();
            oPayload.availability = newAvailability;
        
            try {
                var oDataModel = this.getOwnerComponent().getModel("ModelV2"); // Assuming this is your OData V2 model
        
                oDataModel.update("/Books(" + oPayload.ID + ")", oPayload, {
                    success: function() {
                        this.getView().byId("idBookTable").getBinding("items").refresh();
                        this.updateDialog.close();
                        // Show success message
                        sap.m.MessageToast.show("Updated Successfully ");
                    }.bind(this),
                    error: function(oError) {
                        this.updateDialog.close();
                        sap.m.MessageBox.error("Failed to update book: " + oError.message);
                    }.bind(this)
                });
            } catch (error) {
                this.updateDialog.close();
                sap.m.MessageBox.error("Some technical issue occurred");
            }
        },
        
        onReservebtnpress:async function (oEvent) {
            if(this.byId("issuebooksTable").getSelectedItems().length>1){
                MessageToast.show("Please Select only one Book");
                return
            }
            var oSelectedBook=this.byId("issuebooksTable").getSelectedItem().getBindingContext().getObject(),
            oAval=oSelectedBook.book.availability-1;
            var current=new Date();
            let due=new Date(current.getFullYear(),current.getMonth(),current.getDay()+19)
        
            const userModel = new sap.ui.model.json.JSONModel({
                book_ID : oSelectedBook.book.ID,
                user_ID: oSelectedBook.user.ID,
                issueDate: new Date(),
                dueDate:due,
                notify:
                `${oSelectedBook.book.title} Title is issued by Admin`,
                book:{
                    availability:oAval
                }
            });
            this.getView().setModel(userModel, "userModel");
        
            const oPayload = this.getView().getModel("userModel").getProperty("/"),
                oModel = this.getView().getModel("ModelV2");
        
            try {
                await this.createData(oModel, oPayload, "/ActiveLoans");
                sap.m.MessageBox.success("Title issued successfully.");
               
                this.byId("issuebooksTable").getSelectedItem().getBindingContext().delete("$auto");
                
                //this.getView().byId("idIssueBooks").getBinding("items").refresh();
                //this.oCreateBooksDialog.close();
                var oIssuebooksTable = this.byId("issuebooksTable");
                    var oSelectedItem = oIssuebooksTable.getSelectedItem();
                    oIssuebooksTable.removeItem(oSelectedItem);
                oModel.update("/Books(" + oSelectedBook.book.ID + ")", oPayload.book, {
                    success: function() {
                        // this.getView().byId("idBooksTable").getBinding("items").refresh();
                        //this.oEditBooksDialog.close();
                    },
                    error: function(oError) {
                        //this.oEditBooksDialog.close();
                        sap.m.MessageBox.error("Failed to update book: " + oError.message);
                    }.bind(this)
                });

            }
            
             catch (error) {
                //this.oCreateBooksDialog.close();
                sap.m.MessageBox.error("Some technical Issue");
            }
        },
        createColumnConfig: function() {
            return [
                { label: 'ISBN', property: 'ISBN', type: EdmType.String },
                { label: 'Title', property: 'title', type: EdmType.String },
                { label: 'Quantity', property: 'quantity', type: EdmType.Number, scale: 0 },
                { label: 'Author', property: 'author', type: EdmType.String },
                { label: 'Genre', property: 'genre', type: EdmType.String },
                { label: 'Availability', property: 'availability', type: EdmType.Number, scale: 0 },
                { label: 'Language', property: 'language', type: EdmType.String }
            ];
        },
        onExport: function() {
            var aCols, oBinding, oSettings, oSheet, oTable;

            oTable = this.byId('idBookTable');
            oBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig();

            oSettings = {
                workbook: { columns: aCols },
                dataSource: oBinding,
                fileName: 'Books.xlsx'
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function() {
                    MessageToast.show('Spreadsheet export has finished');
                })
                .finally(function() {
                    oSheet.destroy();
                });
        },
        onLogoutPress:function(){
            var oRouter=this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteHomePage",{},true)
        }
        
 
        });
    });