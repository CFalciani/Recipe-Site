# Recipe-Website
A locally hosted recipe website for keeping all your recipes safe and avoiding the hassle of scrolling through ads and walls of unrelated text that seem to be common on recipe websites these days. Additionally there is a built in converter from cups and teaspoons to grams for use of a baking scale

Primarily for baking, but can be adapted for general cooking recipes, by changing category options and by adding cooking ingredients to the database

Has methods for adding, viewing, deleting and editing recipes

Each recipe page has a button to almost instantly convert the entire recipe from cups teaspoons or tablespoons to grams for use of a baking scale

Bash scripts to automate backing up the data to an external machine for saftey of the recipes

## Installation:
1. Install node, npm and postgres sql
2. move into the base directory of the project
3. log into postgres sql and create an empty db
4. run the following command to import the backup db: ```pg_dump -U USERNAME DBNAME < public_html/backups/recipes.db```
5. Edit information in env.json to match your psql database setup
6. To run the bash scripts for backup, change the path names to match where you have stored the source code
5. run ```npm install```
6. run ```node server```
