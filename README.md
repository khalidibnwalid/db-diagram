# DB Graph Visualizer

A lightweight, fast, and easy-to-use database visualization tool built quickly (mostly vibecoded!) to solve the problem of clunky and bad MS SQL database visualizers.

## Why this exists
I was frustrated with the built-in MS SQL visualizers that were either too slow or too clunky. I just wanted a simple graph to look at my database, understand its structure, and see how everything connects. So, I vibecoded this project, tried to optimize it as much as possible, tried to organize, used it and added what-ever feature my muscle memory needed.

## Usage

1. Export your MS SQL tables and relationships as a CSV  from this command.
```sql
SELECT 
    KCU1.TABLE_NAME AS 'Child_Table', 
    KCU1.COLUMN_NAME AS 'Child_Column', 
    KCU2.TABLE_NAME AS 'Parent_Table', 
    KCU2.COLUMN_NAME AS 'Parent_Column',
    RC.CONSTRAINT_NAME AS 'Relationship_Name'
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS RC
INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU1 
    ON RC.CONSTRAINT_NAME = KCU1.CONSTRAINT_NAME
INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU2 
    ON RC.UNIQUE_CONSTRAINT_NAME = KCU2.CONSTRAINT_NAME
    AND KCU1.ORDINAL_POSITION = KCU2.ORDINAL_POSITION
ORDER BY Child_Table;
```

note that it will accept any csv file with the following columns:

- Child_Table
- Child_Column
- Parent_Table
- Parent_Column
- Relationship_Name

or if no header is present, it will accept any csv file with the aforesaid columns in order.

2. Load the CSV file into the application.