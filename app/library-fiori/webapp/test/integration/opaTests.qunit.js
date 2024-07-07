sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/app/libraryfiori/test/integration/FirstJourney',
		'com/app/libraryfiori/test/integration/pages/BooksList',
		'com/app/libraryfiori/test/integration/pages/BooksObjectPage',
		'com/app/libraryfiori/test/integration/pages/ActiveLoansObjectPage'
    ],
    function(JourneyRunner, opaJourney, BooksList, BooksObjectPage, ActiveLoansObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/app/libraryfiori') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheBooksList: BooksList,
					onTheBooksObjectPage: BooksObjectPage,
					onTheActiveLoansObjectPage: ActiveLoansObjectPage
                }
            },
            opaJourney.run
        );
    }
);