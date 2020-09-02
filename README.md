# Recipe-Website
A locally hosted recipe website for keeping all your recipes safe and avoiding the hassle of scrolling through ads and walls of unrelated text that seem to be common on recipe websites these days. Additionally there is a built in converter from cups and teaspoons to grams for use of a baking scale

Primarily for baking, but can be adapted for general cooking recipes, by changing category options and by adding cooking ingredients to the database

Has methods for adding, viewing, deleting and editing recipes

Each recipe page has a button to almost instantly convert the entire recipe from cups teaspoons or tablespoons to grams for use of a baking scale

Bash scripts to automate backing up the data to an external machine for saftey of the recipes

### Installation:
Note: this program was written in typescript, but I have included the pre compiled js files to make installation easier, as I have noticed compiler inconsistencies when installing on some machines, feel free to compile the typescript yourself if you don't mind troubleshooting

Another Note: if you would like to start fresh with a new database, run ```rm public_html/pictures/recipes/*``` and run the following commands inside the psql console in place of step 4 
    ```create table list (title text primary key, ingredients JSONB[], directions text, category varchar(20));
    create table conversion (ingredient text primary key, gpc smallint);```
1. Install node, npm and postgres sql
2. move into the base directory of the project
3. log into postgres sql and create an empty db
4. run the following command to import the backup db: ```pg_dump -U USERNAME DBNAME < public_html/backups/recipes.db```
5. Edit information in env.json to match your psql database setup
6. run ```npm install```
7. run ```node server```

### Linux server components setup
If you are using a systemd distribution of Linux, it is possible to assign the file to run as a service which can be automatically run at startup and is not attached to an ssh or physical user session. To do this, edit the server.sh file to reflect the path you keep the recipe database at. Then make a .service file in ```/etc/systemd/system``` specifying the service details. For more information follow this guide https://medium.com/@benmorel/creating-a-linux-service-with-systemd-611b5c8b91d6

To make automatic backups, edit information in the dump.sh file to reflect the path you have stored the code in. You will also need to create a .pgpass file if you have a password on your psql database. Then assign a cronjob to run the dump script every day, or however often you would like to do this run ```crontab -e```. Finally to customize how many backups of the database are stored, you may add more lines to the FILES variable in the dump.sh file (make sure to touch each added file so the script does not error when looking for them  
