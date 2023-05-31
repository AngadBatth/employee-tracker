// Including packages
const consoleTable = require("console.table");
const inquire = require("inquirer");
const mySql = require("mysql2");

// Creating DB connection
const dbConnect = mySql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "rootsql",
        database: "employees_db",
    }
);

// Initial Prompts for User
function promptUser() {
  inquire
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit',
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case 'View all departments':
          viewDepartment();
          break;

        case 'View all roles':
          viewRoles();
          break;

        case 'View all employees':
          viewEmployees();
          break;

        case 'Add a department':
          addDepartment();
          break;

        case 'Add a role':
          addRole();
          break;

        case 'Add an employee':
          addEmployee();
          break;

        case 'Update an employee role':
          updateRole();
          break;

        case 'Exit':
          dbConnect.end();
          break;
      }
    });
}

// Function to View all Departments
function viewDepartment() {
  dbConnect.query('SELECT * FROM department', (err, res) => {
    if (err) throw err;
    console.table(res);
    promptUser();
  });
}

// Function to View all Roles
function viewRoles() {
  dbConnect.query(
    `SELECT role.id, role.title, department.name, role.salary FROM role INNER JOIN department ON department.id = role.department_id`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      promptUser();
    }
  );
}

// Function to View all Employees and their respective Managers
function viewEmployees() {
  dbConnect.query(
    `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name," ",m.last_name) AS manager FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON department.id = role.department_id LEFT JOIN employee m ON m.id = employee.manager_id;`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      promptUser();
    }
  );
}

// Function to add a new Department
function addDepartment() {
  inquire
    .prompt([
      {
        name: 'newDept',
        type: 'input',
        message: 'Enter the name of the department: ',
      },
    ])
    .then((data)=>{
        const sqlQuery = `INSERT INTO department (name) VALUE ("${data.newDept}")`;
        dbConnect.query(sqlQuery, (err, result) =>{
            if (result)
            {
                console.log("Successfully added Department.");
            }
            else
            {
                console.error(err);
            }
            promptUser();
        })
    })
};

// Function to add a new Role and its Salary
const addRole = () => {
    dbConnect.query(`SELECT * FROM department`, (err, departments) => {
      if (err) 
      {
        console.log(err);
        return;
      }
  
      const deptList = departments.map((dept) => {
        return {
          name: dept.name,
          value: dept.id,
        };
      });
  
      inquire
        .prompt([
          {
            type: "input",
            name: "newRole",
            message: "Enter the title of the role: ",
          },
          {
            type: "input",
            name: "newSalary",
            message: "Enter the salary for the role: ",
          },
          {
            type: "list",
            name: "belongsToDept",
            message: "Which department does the role belong to? ",
            choices: deptList,
          },
        ])
        .then((data) => {
          const sqlQuery = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
          const params = [data.newRole, data.newSalary, data.belongsToDept];
  
          dbConnect.query(sqlQuery, params, (err, result) => {
            if (err) {
              console.error(err);
            } else {
              console.log("Successfully added new Role.");
            }
            promptUser();
          });
        })
        .catch((error) => {
          console.log("An error has occurred: ", error);
        });
    });
  };

  // Function to add a new Employee as well as their Department, Role, Salary and Manager
  const addEmployee = () => {
    dbConnect.query(`SELECT * FROM role`, (err, roles) => {
        if (err) 
        {
            console.log(err);
            return;
        }

        const roleList = roles.map((role) => {
            return {
                name: role.title,
                value: role.id,
            };
        });

        dbConnect.query(`SELECT * FROM employee`, (err, employees) => {
            if (err) 
            {
                console.log(err);
                return;
            }

            const assignLead = employees.map((employee) => {
                return {
                    name: employee.first_name + " " + employee.last_name,
                    value: employee.id,
                };
            });
            assignLead.unshift({ name: "None", value: null });

            inquire
                .prompt([
                {
                    type: "input",
                    name: "employeeFn",
                    message: "Please enter the employees first name: "
                },
                {
                    type: "input",
                    name: "employeeLn",
                    message: "Please enter the employees last name: "
                },
                {
                    type: "list",
                    name: "newRole",
                    message: "Please select the Employees Role.",
                    choices: roleList
                },
                {
                    type: "list",
                    name: "teamLead",
                    message: "Please select the Employee's Manager.",
                    choices: assignLead
                }
            ])
            .then((data) => {
                const sqlQuery = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                const params = [data.employeeFn, data.employeeLn, data.newRole, data.teamLead];

                db.query(sqlQuery, params, (err, result) => {
                    if (err) 
                    {
                        console.error(err);
                    } 
                    else 
                    {
                        console.log("Successfully added new Employee.");
                    }
                    promptUser();
                });
            })
            .catch((error) => {
                console.log("An error occurred:", error);
            });
        });
    });
};

// Function to update an Employees Role
const updateRole = () => {
    dbConnect.query(`SELECT * FROM employee`, (err, employees) => {
      if (err) 
      {
        console.log(err);
        return;
      }
  
      const empList = employees.map((employee) => {
        return {
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        };
      });
  
      dbConnect.query(`SELECT * FROM role`, (err, roles) => {
        if (err) 
        {
          console.log(err);
          return;
        }
  
        const rolesList = roles.map((role) => {
          return {
            name: role.title,
            value: role.id,
          };
        });
  
        inquire
          .prompt([
            {
              type: "list",
              name: "empId",
              message: "Select desired employee to update.",
              choices: empList,
            },
            {
              type: "list",
              name: "roleId",
              message: "Select desired role for the employee.",
              choices: rolesList,
            },
          ])
          .then((data) => {
            const sqlQuery = "UPDATE employee SET role_id = ? WHERE id = ?";
            const params = [data.roleId, data.empId];
  
            dbConnect.query(sqlQuery, params, (err, result) => {
              if (err) 
              {
                console.error(err);
              } 
              else 
              {
                console.log("Updated Employee role successfully.");
              }
              promptUser();
            });
          })
          .catch((error) => {
            console.log("An error has occurred: ", error);
          });
      });
    });
  };

  // Calls function to start the program when using `node index.js`
  promptUser();