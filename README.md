# box-status

(aka Box Now)

## About

This project was built for the Box 2015 hackathon. Essentially, it enabled users viewing a file list to see "chat heads" (à la Box Notes) that indicated what other users were viewing files in that folder. When a user opened a file in Preview, their avatar would appear next to the file in the file list (see the `viewing` and `leaving` events in [`appLogic.js`](https://github.com/mattbasta/box-status/blob/master/appLogic.js). Additionally, this information would show up in the header bar of the Preview lightbox.

To make this more useful, two users viewing the same file in Preview would see an option to start a Box Note for the file. Clicking the button would open a new Note with the name of the file as the title. Every other user who had the file open would receive a prompt asking whether they would like to open the file. If a Note had already been created for that file, the existing note would be opened instead. This facilitates the creation of instant meetings or building realtime discussions around existing content on Box.


## License

This code is available as [ISC](http://opensource.org/licenses/ISC) or [CC0](https://creativecommons.org/publicdomain/zero/1.0/); whichever is most permissive for the user's use case. 
