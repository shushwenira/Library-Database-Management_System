
---------------------------------------------------------------------------------------------------------------------------------------

Following is the step by step guide to install required softwares, parse both the CSV's in to corresponding tables (DB initialization) 
and run the Library Management System application. 

- Install Node.Js (https://nodejs.org/en/download/)
- Install MySQL and configure its username, password and port (MySQL installer: https://dev.mysql.com/downloads/installer/)
- Open command promt/shell
- Navigate to Library Management System/ 
	- Run following command: This will install all the dependencies (listed at the end of the guide) of the application 
	   into Library Management System/node_modules/ 
		- npm install

- Navigate to Library Management System/DB Initialization/ 
	- Run following command to parse the CSV's in this folder and populate tables of the DB.
	   It takes hostname, MySQL port(3306 is default), MySQL username, MySQL password and your preferred database name as the arguments to connect
	   to MySQL and create a database. (Note that the database name provided, is a NEW database that is to be created)
		- node build_script.js 'localhost' '3306' 'root' 'root' 'library'
	   
- Navigate to Library Management System/ 
	-  Run following command to start the application
		- node server.js 'localhost' '3306' 'root' 'root' 'library'

- Hit the following URL in your browser to see the application running
	- http://localhost:3000/

---------------------------------------------------------------------------------------------------------------------------------------

Following platform was used to develop and run this application:
(Note that the above 7 steps may run on any platform combination)
- Intel i7 Processor
- Windows 10 Home 64 bit
- Chrome Browser
- Windows PowerShell 

---------------------------------------------------------------------------------------------------------------------------------------

Following Software versions were used to develop and run this application:
- Node.js: 8.9.4
- MySQL: 5.7
- MySQL Workbench: 6.3
- Sublime Text 3
- Chrome: 64.0.3282.167

---------------------------------------------------------------------------------------------------------------------------------------

Following are the frameworks and libraries (dependencies) with their versions used to develop and run this application:
(These are included in Library Management System/package.json)
- angular: 1.6.9
- @uirouter/angularjs: 1.0.15
- angular-animate: 1.6.9
- angular-block-ui: 0.2.2
- angular-touch: 1.6.9
- angular-ui-bootstrap: 2.5.6
- bootstrap: 3.3.7
- express: 4.16.2
- jquery: 1.12.4
- mysql: 2.15.0
- fast-csv: 2.4.1
- npm: 5.7.1
			
---------------------------------------------------------------------------------------------------------------------------------------
