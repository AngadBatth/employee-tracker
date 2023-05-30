INSERT INTO department(name)
VALUES ("Finance"),
       ("Engineering"),
       ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES ("Lead Accountant", 100000, 1),
       ("Accountant", 75000, 1),
       ("Senior Developer", 130000, 2), 
       ("Associate Engineer", 65000, 2), 
       ("Lawyer", 110000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Angad", "Batth", 3, NULL), 
       ("John", "Doe", 4, 1),
       ("Ethan", "Dubu", 1, NULL),
       ("Jane", "Doe", 2, 3),
       ("Kyle", "Lowry", 5, NULL),
       ("Brandon", "Ingram", 5, 5),
       ("Nikola", "Jokic", 5, 5);