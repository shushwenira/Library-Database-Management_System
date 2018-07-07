const mysql = require('mysql');
const csv = require('fast-csv');

var con = {};
var host = process.argv[2];
var port = process.argv[3];
var user = process.argv[4];
var pass = process.argv[5];
var database = process.argv[6];

con = mysql.createConnection({
    host: host,
    port: port,
    user: user,
    password: pass
});

con.connect((err) => {
    if (err) {
        throw err;
    } else {
        console.log(" ");
        console.log('Connected to MySQL.');
        console.log(" ");
    }
});

var timeStarted = new Date().getTime();

con.query('CREATE DATABASE IF NOT EXISTS ' + database, (err, data) => {
    if (err) {
        throw err;
    } else {

        console.log("'" + database + "' database created successfully.");

        con.query('USE ' + database, (err, data) => {
            if (err) {
                throw err;
            } else {
                console.log("Using '" + database + "' database to create and populate tables.");
                console.log(" ");

                con.query('CREATE TABLE IF NOT EXISTS BOOK(Isbn VARCHAR(10) NOT NULL, Title VARCHAR(200) NOT NULL, CONSTRAINT pk_book PRIMARY KEY (Isbn))', (err, data) => {
                    if (err) {
                        throw err;
                    } else {
                        console.log("BOOK table created.");

                        con.query('CREATE TABLE IF NOT EXISTS AUTHORS(Author_id int NOT NULL AUTO_INCREMENT, Name VARCHAR(100) NOT NULL,CONSTRAINT uk_name UNIQUE (Name), CONSTRAINT pk_book PRIMARY KEY (Author_id))', (err, data) => {
                            if (err) {
                                throw err;
                            } else {
                                console.log("AUTHORS table created.");

                                con.query('CREATE TABLE IF NOT EXISTS BOOK_AUTHORS(Author_id int NOT NULL, ISBN VARCHAR(10) NOT NULL,CONSTRAINT pk_book_authors PRIMARY KEY (Author_id,ISBN), CONSTRAINT fk_book_athors_book FOREIGN KEY (ISBN) references BOOK(ISBN), CONSTRAINT fk_book_authors_authors FOREIGN KEY (Author_id) references AUTHORS(Author_id))', (err, data) => {
                                    if (err) {
                                        throw err;
                                    } else {
                                        console.log("BOOK_AUTHORS table created.");

                                        con.query('CREATE TABLE IF NOT EXISTS BORROWERS(Card_id varchar(6) NOT NULL, SSN VARCHAR(11) NOT NULL,Bname varchar(40) NOT NULL, Address varchar(100) NOT NULL, Phone bigint(10) NOT NULL, CONSTRAINT pk_borrowers PRIMARY KEY (Card_id),CONSTRAINT uk_ssn UNIQUE (SSN))', (err, data) => {
                                            if (err) {
                                                throw err;
                                            } else {
                                                console.log("BORROWERS table created.");

                                                con.query('CREATE TABLE IF NOT EXISTS BOOK_LOANS(Loan_id int NOT NULL AUTO_INCREMENT, ISBN VARCHAR(10) NOT NULL, Card_id varchar(6) NOT NULL, Date_out date NOT NULL, Date_due date NOT NULL, Date_in date, CONSTRAINT pk_book_loans PRIMARY KEY (Loan_id),  CONSTRAINT fk_loans_book FOREIGN KEY (ISBN) references BOOK(ISBN),  CONSTRAINT fk_loans_borrower FOREIGN KEY (Card_id) references BORROWERS(Card_id))', (err, data) => {
                                                    if (err) {
                                                        throw err;
                                                    } else {
                                                        console.log("BOOK_LOANS table created.");
                                                        con.query('CREATE TABLE IF NOT EXISTS FINES(Loan_id int NOT NULL, Fine_amount decimal(10,2) NOT NULL, Paid tinyint NOT NULL, CONSTRAINT pk_fines PRIMARY KEY (Loan_id),  CONSTRAINT fk_loans_fines FOREIGN KEY (Loan_id) references BOOK_LOANS(Loan_id))', (err, data) => {
                                                            if (err) {
                                                                throw err;
                                                            } else {
                                                                console.log("FINES table created.");
                                                                console.log(" ");
                                                                populateTables();
                                                            }
                                                        });

                                                    }
                                                });

                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});

function populateTables() {
    var books = [];
    var borrowers = [];

    csv.fromPath("borrowers.csv", { 'headers': true, 'delimiter': "," })
        .on("data", function(data) {
            borrowers.push(data);
        })
        .on("end", function() {
            console.log("Populating BORROWERS table by parsing borrowers.csv. Please wait.....");
            for (var i = 0; i < borrowers.length; i++) {
                (function(i, borrowers) {
                    var name = borrowers[i].first_name + " " + borrowers[i].last_name;
                    var address = borrowers[i].address + "," + borrowers[i].city + "," + borrowers[i].state;
                    var phoneString = borrowers[i].phone;
                    var phoneInt = "";
                    for (var j = 0; j < phoneString.length; j++) {
                        if (!isNaN(phoneString.charAt(j)) && phoneString.charAt(j) != " ") {
                            phoneInt += phoneString.charAt(j);
                        }
                    }
                    phoneInt = parseInt(phoneInt);
                    con.query('INSERT into BORROWERS(Card_id, SSN, Bname, Address, Phone) values(?,?,?,?,?)', [borrowers[i].borrower_id, borrowers[i].ssn, name, address, phoneInt], (err3, data) => {
                        if (err3) {
                            throw err3;
                        } else if (i == borrowers.length - 1) {
                            console.log("BORROWERS table populated successfully.");
                            console.log(" ")
                            console.log("Populating BOOK, AUTHORS and BOOK_AUTHORS tables by parsing book.csv. Please wait. This may take a while.....");
                        }
                    });
                })(i, borrowers);
            }
        });

    csv.fromPath("book.csv", { 'headers': true, 'delimiter': "\t" })
        .on("data", function(data) {
            books.push(data);
        })
        .on("end", function() {
            for (var i = 0; i < books.length; i++) {

                (function(i, books) {

                    con.query('INSERT into BOOK values(?,?)', [books[i].ISBN10, books[i].Title], (err3, data) => {
                        if (err3) {
                            throw err3;
                        } else if (i == books.length - 1) {
                            console.log("BOOK table populated successfully.");
                        }
                    });

                    var authors = [];
                    authors = books[i].Authro.split(",");

                    for (var j = 0; j < authors.length; j++) {

                        con.query('INSERT IGNORE into AUTHORS(Name) values(?)', [authors[j]], (err1, data) => {
                            if (err1) {
                                throw err1;
                            } else if (i == books.length - 1) {
                                console.log("Authors table populated successfully.")
                            }
                        });

                        con.query('INSERT IGNORE into BOOK_AUTHORS values((SELECT author_id from AUTHORS where name=?), ?)', [authors[j], books[i].ISBN10], (err2, data) => {
                            if (err2) {
                                throw err2;
                            } else if (i == books.length - 1) {
                                console.log("BOOK_AUTHORS table populated successfully.")
                                var timeEnded = new Date().getTime();
                                var timeTaken = (timeEnded - timeStarted) / (1000 * 60);
                                console.log(" ");
                                console.log("Database is now set up! (Time taken: "+timeTaken+" minutes)");
                                console.log(" ");
                                con.end();
                            }
                        });
                    }
                })(i, books);

            }
        });

    
}