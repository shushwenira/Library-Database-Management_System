const mysql = require('mysql');
const express = require('express');
const app = express();

app.use('/', express.static(__dirname + '/'));
app.use(express.json());

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
    password: pass,
    database: database,
    dateStrings: 'date'
});

con.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to Database!');
    app.listen(3000, () => console.log('Library Management System listening on port 3000!'));
});

app.get('/all-borrowers', function(req, res) {
    con.query('select * from BORROWERS order by Card_id desc', [], (err, data) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else {
            res.send(data);
        }
    });
});

app.post('/fine-payment', function(req, res) {

    var loan_id = parseInt(req.body.loan_id);
    con.query('select * from BOOK_LOANS natural join FINES where Loan_id = ?', [loan_id], (err, data) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else {
            if (!data[0].Date_in) {
                res.status(500).send("This book is not yet checked in");
            } else {
                con.query('update FINES set Paid = 1 where Loan_id = ?', [loan_id], (err, data) => {
                    if (err) {
                        res.status(500).send(err.sqlMessage);
                    } else {
                        res.send("Payment Processed");
                    }
                });

            }
        }
    });

});

app.post('/search-fine', function(req, res) {
    var includePaidFines = req.body.includePaidFines;
    var card_id = req.body.card_id;
    if (includePaidFines) {
        con.query('select Card_id, SUM(Fine_amount) as Total_fine from BOOK_LOANS natural join FINES where Card_id = ? group by Card_id', [card_id], (err, data) => {
            if (err) {
                res.status(500).send(err.sqlMessage);
            } else {
                res.send(data);
            }
        });

    } else {
        con.query('select Card_id, SUM(Fine_amount) as Total_fine from BOOK_LOANS natural join FINES where Card_id = ? and Paid = 0 group by Card_id', [card_id], (err, data) => {
            if (err) {
                res.status(500).send(err.sqlMessage);
            } else {
                res.send(data);
            }

        });
    }

});

app.post('/all-fines', function(req, res) {
    var includePaidFines = req.body.includePaidFines;
    if (includePaidFines) {
        con.query('select Card_id, SUM(Fine_amount) as Total_fine from BOOK_LOANS natural join FINES group by Card_id', (err, data) => {
            if (err) {
                res.status(500).send(err.sqlMessage);
            } else {
                res.send(data);
            }
        });

    } else {
        con.query('select Card_id, SUM(Fine_amount) as Total_fine from BOOK_LOANS natural join FINES where Paid = 0 group by card_id', (err, data) => {
            if (err) {
                res.status(500).send(err.sqlMessage);
            } else {
                res.send(data);
            }

        });
    }

});

app.post('/borrower-fines', function(req, res) {
    var includePaidFines = req.body.includePaidFines;
    var card_id = req.body.card_id;
    if (includePaidFines) {
        con.query('select Loan_id, ISBN, Date_due, Date_in, Fine_amount, Paid from BOOK_LOANS natural join FINES where Card_id = ?', [card_id], (err, data) => {
            if (err) {
                res.status(500).send(err.sqlMessage);
            } else {
                res.send(data);
            }
        });

    } else {
        con.query('select Loan_id, ISBN, Date_due, Date_in, Fine_amount, Paid from BOOK_LOANS natural join FINES where Paid = 0 and Card_id = ?', [card_id], (err, data) => {
            if (err) {
                res.status(500).send(err.sqlMessage);
            } else {
                res.send(data);
            }

        });
    }

});

app.get('/generate-fines', function(req, res) {
    con.query('select * from BOOK_LOANS', [], (err, data) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else {
            var data_length = data.length;
            var sqlMessage = "";
            for (var i = 0; i < data_length; i++) {
                var date_due = data[i].Date_due;
                date_due = date_due.slice(0, 10);
                var date_in = data[i].Date_in;
                if (!date_in) {
                    var today = new Date();
                    var dayDiff = dayDifference(date_due, formatDate(today));
                    if (dayDiff >= 1) {
                        calculateFine(dayDiff, data[i].Loan_id, res, data_length, i);
                    } else if (i == data_length - 1) {
                        res.send("Fines Refreshed");
                    }
                } else {
                    date_in = date_in.slice(0, 10);
                    var dayDiff = dayDifference(date_due, date_in);
                    if (dayDiff >= 1) {
                        calculateFine(dayDiff, data[i].Loan_id, res, data_length, i);
                    } else if (i == data_length - 1) {
                        res.send("Fines Refreshed");
                    }
                }
            }
            if (data_length == 0) {
                res.send("No book loans to generate fines");
            }
        }
    });
});

function calculateFine(dayDiff, loan_id, res, data_length, i) {
    con.query('select * from FINES where Loan_id = ?', [loan_id], (err, data) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else {
            if (data.length == 1) {
                if (data[0].Paid == 0) {
                    var fine = data[0].Fine_amount;
                    if (fine != dayDiff * 0.25) {
                        con.query('update FINES set Fine_amount = ? where Loan_id = ?', [dayDiff * 0.25, loan_id], (err, data) => {
                            if (err) {
                                res.status(500).send(err.sqlMessage);
                            } else if (i == data_length - 1) {
                                res.send("Fines Refreshed");
                            }
                        });
                    } else if (i == data_length - 1) {
                        res.send("Fines Refreshed");
                    }
                } else if (i == data_length - 1) {
                    res.send("Fines Refreshed");
                }
            } else {
                con.query('INSERT INTO fines values(?,?,?)', [loan_id, dayDiff * 0.25, 0], (err, data) => {
                    if (err) {
                        res.status(500).send(err.sqlMessage);
                    } else if (i == data_length - 1) {
                        res.send("Fines Refreshed");
                    }
                });
            }
        }

    });
}

app.post('/check-in-search', function(req, res) {
    var searchString = req.body.searchString;
    searchString = searchString.replace(/%/g, "|%").replace(/_/g, "|_");
    searchString = "%" + searchString + "%";
    con.query('select Loan_id,Card_id,ISBN,Bname,Date_out,Date_due,Date_in from BOOK_LOANS natural join BORROWERS where (ISBN like ? ESCAPE "|" or card_id like ? ESCAPE "|" or Bname like ? ESCAPE "|" ) and Date_in is NULL ', [searchString, searchString, searchString], (err, data) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else {
            res.send(data);
        }
    });
});

app.post('/check-in', function(req, res) {
    var loan_id = req.body.loan_id;
    var today = formatDate(new Date());
    con.query('update BOOK_LOANS set Date_in = ? where Loan_id = ?', [today, loan_id], (err, data) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else {
            res.send("Checked In");
        }
    });
});

function dayDifference(date1, date2) {
    date1 = date1.split("-");
    date1[0] = parseInt(date1[0]);
    date1[1] = parseInt(date1[1]) - 1;
    date1[2] = parseInt(date1[2]);

    date2 = date2.split("-");
    date2[0] = parseInt(date2[0]);
    date2[1] = parseInt(date2[1]) - 1;
    date2[2] = parseInt(date2[2]);

    date1 = Date.UTC(date1[0], date1[1], date1[2]);
    date2 = Date.UTC(date2[0], date2[1], date2[2]);


    return (date2 - date1) / (1000 * 3600 * 24);
}

function formatDate(date) {
    var d = new Date(date);
    var month = '' + (d.getMonth() + 1);
    var day = '' + d.getDate();
    var year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

app.post('/check-out', function(req, res) {
    var isbn = req.body.isbn;
    var card_id = req.body.card_id;
    var today = new Date();
    var date_out = formatDate(today);
    var date_due = new Date(today.setDate(today.getDate() + 13));
    var date_due = formatDate(date_due);

    con.query('select * from BORROWERS where Card_id = ?', [card_id], (err, data) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else {
            if (data.length == 0) {
                res.status(500).send("Invalid Card ID");
            } else {
                con.query('select * from BOOK_LOANS where date_in is NULL and ISBN =?', [isbn], (err, data) => {
                    if (err) {
                        res.status(500).send(err.sqlMessage);
                    } else if (data.length > 0) {
                        res.status(500).send("This book is already checked out");
                    } else {
                        con.query('select * from BOOK_LOANS where card_id = ? and date_in is NULL', [card_id], (err, data) => {
                            if (err) {
                                res.status(500).send(err.sqlMessage);
                            } else if (data.length > 2) {
                                res.status(500).send("Cant check out more than 3 books for a borrower");
                            } else {
                                con.query('insert into BOOK_LOANS(ISBN,Card_id,Date_out,Date_due) values(?,?,?,?)', [isbn, card_id, date_out, date_due], (err, data) => {
                                    if (err) {
                                        res.status(500).send(err.sqlMessage);
                                    }
                                    res.status(200).send("Book checked out successfully");
                                });
                            }

                        });
                    }

                });
            }
        }
    });

});

app.post('/add-borrower', function(req, res) {
    var ssn = req.body.ssn;
    con.query('select * from BORROWERS where SSN = ?', [ssn], (err1, data) => {
        if (data.length != 0) {
            res.status(500).send("A borrower with same SSN already exists");
        } else {
            con.query('select count(*) from BORROWERS', (err1, data) => {
                var ID = data[0]["count(*)"] + 1;
                ID = "" + ID;
                var i = 6;
                var ID_length = ID.length;
                while (i > ID_length) {
                    ID = "0" + ID;
                    i--;
                }

                con.query('insert into BORROWERS values(?,?,?,?,?)', [ID, ssn, req.body.name, req.body.address, req.body.phone], (err, data) => {
                    if (err) {
                        res.status(500).send(err.sqlMessage);
                    } else {
                        res.send("Borrower added successfully");
                    }

                });
            });
        }
    });
});

app.post('/search', function(req, res) {
    var searchString = req.body.searchString;
    searchString = searchString.replace(/%/g, "|%").replace(/_/g, "|_");
    searchString = "%" + searchString + "%";
    var formatted_data = [];
    con.query('select distinct ISBN,Title from BOOK natural join BOOK_AUTHORS natural Join AUTHORS where ISBN like ? ESCAPE "|" or Title like ? ESCAPE "|" or Name like ? ESCAPE "|" order by ISBN', [searchString, searchString, searchString], (err, data) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else {
            var data_length = data.length;
            if (data_length == 0) {
                res.send(data);
            } else {
                for (var i = 0; i < data_length; i++) {
                    var isbn = data[i].ISBN;
                    data[i].Name = "";
                    data[i].availability = "";
                    (function(data, i, data_length) {
                        con.query('select Name,Author_id from BOOK_AUTHORS natural join AUTHORS where ISBN = ?', [isbn], (err, records) => {
                            if (err) {
                                res.status(500).send(err.sqlMessage);
                            } else {
                                var no_of_authors = records.length;
                                for (var j = 0; j < no_of_authors; j++) {
                                    if (j == no_of_authors - 1) {
                                        data[i].Name += records[j].Name;
                                    } else {
                                        data[i].Name += records[j].Name + ", ";
                                    }
                                }
                            }
                        });
                    })(data, i, data_length);
                    (function(data, i, data_length) {
                        con.query('select * from BOOK_LOANS where ISBN = ? and Date_in is NULL', [isbn], (err, records) => {
                            if (err) {
                                res.status(500).send(err.sqlMessage);
                            } else if (records.length > 0) {
                                data[i].availability = "No";
                            } else if (records.length == 0) {
                                data[i].availability = "Yes";
                            }
                            if (i == data_length - 1) {
                                res.send(data);
                            }
                        });
                    })(data, i, data_length);
                }
            }

        }
    })
});