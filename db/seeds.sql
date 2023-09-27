INSERT INTO department (name)
VALUES ('Sales'),
       ('Finance'),
       ('Engineering'),
       ('Legal');


INSERT INTO role (title, salary, department_id)
VALUES ('Sales Lead', 90000, 1),
       ('Salesperson', 70000, 3),
       ('Lead Engineer', 130000, 2),
       ('Account Manager', 100000, 3),
       ('Legal Team Lead', 220000, 2),
       ('Lawyer', 160000, 4),
       ('Software Engineer', 170000, 2),
       ('Accountant', 152000, 3);





INSERT INTO staff (first_name, last_name, role_id, manager_id)
VALUES ('Jane', 'Doe', 5, NULL),
       ('Mark', 'Smith', 2, 1),
       ('Luke', 'Shane', 4, NULL),
       ('Kevin', 'Grove', 4, 3),
       ('Bob', 'Brown', 6, NULL),
       ('Peter', 'Singh', 1, 5),
       ('Frank', 'Fred', 3, NULL),
       ('Ted', 'Niel', 2, NULL);