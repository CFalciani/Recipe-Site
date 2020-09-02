#!/bin/bash
BASE="/home/clayx11/Recipe-Website/public_html/backups/"
FILES="${BASE}recipes_5.db
${BASE}recipes_4.db
${BASE}recipes_3.db
${BASE}recipes_2.db
${BASE}recipes_1.db
"
#Move each backup back one number, and overwrite the 6th one
for FILE in $FILES
do
	NUM=$(echo $FILE | cut -d'_' -f3 | cut -d'.' -f1)
	mv "$FILE" "${BASE}recipes_$(expr 1 + $NUM).db"
done
mv "${BASE}recipes.db" "${BASE}recipes_1.db"
pg_dump -d recipes -U postgres -f /home/clayx11/Recipe-Website/public_html/backups/recipes.db
