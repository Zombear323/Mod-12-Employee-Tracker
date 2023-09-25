const inquirer = require('inquirer');
const mysql = require('mysql2');


// connection mysql to mysql2
const db = mysql.createConnection(
    {
        user: 'root',
        host: 'localhost',
        password: 'Password123!',
        database: 'compDB',
    },
)
// question to start app
const question = {
    type: 'list',
    name: 'action',
    message: 'Select next action: ',
    choices: ['View Staff', 'Add Staff', 'Update Staff Role', 'View Roles', 'Add Role', 'View Departments', 'Add Department', 'Update Manager of Staff', 'View Staff by Manager', 'View Staff by Department', 'Delete Department', 'Delete Role', 'Delete Staff', 'View total budget', 'Quit']
}

function AddStaff() {
    // get the role titles
    db.query('SELECT title FROM role', function (err, roleResults) {
        if (err) {
            console.log(err);
            return;
        }

        const roleTitles = roleResults.map((row) => row.title);

        db.query('SELECT CONCAT(first_name, " ", last_name) AS managerName FROM Staff', function (err, managerResults) {
            if (err) {
                console.log(err);
                return;
            }
            const managerNames = managerResults.map((row) => row.managerName);


            managerNames.unshift('None');
            inquirer.prompt([{
                type: 'input',
                message: "What is the Staff's first name?",
                name: 'fName'
            }, {
                type: 'input',
                message: "What is the Staff's last name?",
                name: 'lName'
            }, {
                type: 'list',
                message: "What is the Staff's role?",
                name: 'StaffRole',
                choices: roleTitles
            }, {
                type: 'list',
                message: "Who is the Staff's manager?",
                name: 'StaffManager',
                choices: managerNames
            }])
                .then((answers) => {
                    const firstName = answers.fName;
                    const lastName = answers.lName;
                    const roleTitle = answers.StaffRole;
                    const managerName = answers.StaffManager;

                    db.query(`SELECT id FROM role WHERE title = '${roleTitle}'`, function (err, roleResult) {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        const roleId = roleResult[0].id;
                        let managerId = null;

                        if (managerName !== 'None') {
                            db.query(`SELECT id FROM Staff WHERE CONCAT(first_name, ' ', last_name) = '${managerName}'`, function (err, managerResult) {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                const managerId = managerResult[0].id;
                            
                        
                        db.query(`INSERT INTO Staff (first_name, last_name, role_id, manager_id) VALUES ('${firstName}', '${lastName}', ${roleId}, ${managerId})`, function (err, results) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(`Added ${firstName} ${lastName} to the database`);
                            }
                            StaffManager();
                        });
                    });
                    };
                    });

                });
        });
    });

}

function viewStaffall() {
    db.query("SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ',m.last_name) AS manager FROM Staff e JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id LEFT JOIN Staff m ON e.manager_id = m.id",
        function (err, results) {
            if (err) {
                console.log(err);
            }
            console.table(results);
            StaffManager();
        });
}

// update role of Staff
function updateStaffRole() {
    db.query('SELECT id, CONCAT(first_name, " ", last_name) AS StaffName FROM Staff', function (err, StaffResults) {
        if (err) {
            console.log(err);
            return;
        }
        const StaffChoices = StaffResults.map((row) => {
            return {
                name: row.StaffName,
                value: row.id
            };
        });
        db.query('SELECT id, title FROM role', function (err, roleResults) {
            if (err) {
                console.log(err);
                return;
            }
            const roleChoices = roleResults.map((row) => {
                return {
                    name: row.title,
                    value: row.id
                };
            });

            inquirer.prompt([
                {
                    type: 'list',
                    message: "Which Staff's role do you want to update?",
                    name: 'selectedStaff',
                    choices: StaffChoices
                },
                {
                    type: 'list',
                    message: 'Which role do you want to assign the selected Staff?',
                    name: 'newRoleId',
                    choices: roleChoices
                }
            ])
                .then((answers) => {
                    const selectedStaffId = answers.selectedStaff;
                    const newRoleId = answers.newRoleId;


                    db.query(`UPDATE Staff SET role_id = ${newRoleId} WHERE id = ${selectedStaffId}`, function (err, updateResult) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Updated Staff's role");
                        }
                        StaffManager();
                    });
                });
        });
    });
}

function viewAllRoles() {
    db.query('SELECT r.id, r.title, d.name AS department, r.salary FROM department d JOIN role r ON d.id = r.department_id',
        function (err, results) {
            if (err) {
                console.log(err);
            }
            console.table(results);
            StaffManager()
        });
}

function viewDepartments() {
    db.query('SELECT * FROM department', function (err, results) {
        if (err) {
            console.log(err);
        }
        console.table(results);
        StaffManager();
    });
}
// add new Role
function addRole() {
    db.query('SELECT name FROM department', function (err, results) {
        if (err) {
            console.log(err);
            return;
        }

        const departmentChoices = results.map((row) => row.name);

        inquirer.prompt([{
            type: 'input',
            message: 'What is the name of the role?',
            name: 'roleName'
        }, {
            type: 'input',
            message: 'What is the salary of the role?',
            name: 'salary'
        }, {
            type: 'list',
            message: 'Which department does the role belong to?',
            name: 'departmentChoice',
            choices: departmentChoices
        }])
            .then((answers) => {
                const roleName = answers.roleName;
                const salary = answers.salary;
                const department = answers.departmentChoice;

                db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${roleName}', '${salary}',(SELECT id FROM department WHERE name = '${department}'))`, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(`Added ${roleName} to the database`);
                    }
                    StaffManager();
                })
            });
    });
}

function viewStaffByManager() {
    db.query('SELECT DISTINCT m.id, CONCAT(m.first_name, " ", m.last_name) AS managerName FROM Staff e JOIN Staff m ON e.manager_id = m.id', function (err, managerResults) {
        if (err) {
            console.log(err);
            return;
        }
        const managerChoices = managerResults.map((row) => {
            return {
                name: row.managerName,
                value: row.id
            };
        });
        inquirer.prompt([
            {
                type: 'list',
                message: 'Which manager would you like to view the Staff from?',
                name: 'selectedManager',
                choices: managerChoices
            }
        ])
            .then((answers) => {
                const selectedManagerId = answers.selectedManager;
                db.query(`SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary FROM Staff e JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id WHERE e.manager_id = ${selectedManagerId}`, function (err, results) {
                    if (err) {
                        console.log(err);
                    }
                    console.table(results);
                    StaffManager();
                });
            })
    })
}

// add another department
function addDepartment() {
    inquirer.prompt({
        type: 'input',
        message: 'What is the name of the department?',
        name: 'departmentName'
    }).then((answers) => {
        const newDepartment = answers.departmentName;

        db.query(`INSERT INTO department (name) VALUES ('${newDepartment}')`, function (err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log(`Added ${newDepartment} to the database`);
            }
            StaffManager();
        });
    });
}

function updateStaffManager() {
    db.query('SELECT id, CONCAT(first_name, " ", last_name) AS StaffName FROM Staff', function (err, StaffResults) {
        if (err) {
            console.log(err);
            return;
        }

        const StaffChoices = StaffResults.map((row) => {
            return {
                name: row.StaffName,
                value: row.id
            };
        });

        const managerChoices = [
            ...StaffChoices,
            { name: 'None', value: null },
        ];
        inquirer.prompt([
            {
                type: 'list',
                message: "Which Staff's manager do you want to update?",
                name: 'selectedStaff',
                choices: StaffChoices
            },
            {
                type: 'list',
                message: "Which new manager would you like to choose for the Staff?",
                name: 'newManagerId',
                choices: managerChoices
            }
        ])
            .then((answers) => {

                const selectedStaffId = answers.selectedStaff;
                const newManagerId = answers.newManagerId;

                db.query(`UPDATE Staff SET manager_id = ${newManagerId} WHERE id = ${selectedStaffId}`, function (err, updateResult) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(`Updated Staff's manager`);
                    }

                    StaffManager();
                });
            });
    });
}


// View Staff by Department
function viewStaffByDepartment() {
    db.query('SELECT * FROM department', function (err, departmentResults) {
        if (err) {
            console.log(err);
            return;
        }

        const departmentChoices = departmentResults.map((row) => {
            return {
                name: row.name,
                value: row.id
            };
        });

        inquirer.prompt([
            {
                type: 'list',
                message: "Which department would you like to see its Staff from?",
                name: 'selectedDepartment',
                choices: departmentChoices
            }
        ])
            .then((answers) => {
                const selectedDepartmentId = answers.selectedDepartment;
                db.query(`SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary FROM Staff e JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id WHERE d.id = ${selectedDepartmentId}`, function (err, results) {
                    if (err) {
                        console.log(err);
                    }

                    console.table(results);
                    StaffManager();
                });
            });
    });
}

// delete department
function deleteDepartment() {
    db.query('SELECT * FROM department', function (err, departmentResults) {
        if (err) {
            console.log(err);
            return;
        }

        const departmentChoices = departmentResults.map((row) => {
            return {
                name: row.name,
                value: row.id
            };

        });

        inquirer.prompt([
            {
                type: 'list',
                message: "Which department would you like to delete?",
                name: 'selectedDepartment',
                choices: departmentChoices
            }
        ])
            .then((answers) => {
                const selectedDepartmentId = answers.selectedDepartment;
                db.query(`DELETE FROM department WHERE id = ${selectedDepartmentId}`, function (err, deleteResult) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Department removed from the database");
                    }
                    StaffManager();
                });
            });
    });
}

// delete role
function deleteRole() {
    db.query('SELECT * FROM role', function (err, roleResults) {
        if (err) {
            console.log(err);
            return;
        }

        const roleChoices = roleResults.map((row) => {
            return {
                name: row.title,
                value: row.id
            };
        });

        inquirer.prompt([
            {
                type: 'list',
                message: 'Which role would you like to delete?',
                name: 'selectedRole',
                choices: roleChoices
            }
        ])
            .then((answers) => {
                const selectedRoleId = answers.selectedRole;

                db.query(`DELETE FROM role WHERE id = ${selectedRoleId}`, function (err, deleteResult) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Role removed from the database");
                    }
                    StaffManager();
                });
            });
    });

}

// Delete Staff
function deleteStaff() {
    db.query('SELECT id, CONCAT(first_name, " ", last_name) AS StaffName FROM Staff', function (err, StaffResults) {
        if (err) {
            console.log(err);
            return;
        }

        const StaffChoices = StaffResults.map((row) => {
            return {
                name: row.StaffName,
                value: row.id
            };
        });

        inquirer.prompt([
            {
                type: 'list',
                message: 'Which Staff would you like to delete?',
                name: 'selectedStaff',
                choices: StaffChoices
            }
        ])
            .then((answers) => {
                const selectedStaffId = answers.selectedStaff;

                db.query(`DELETE FROM Staff WHERE id = ${selectedStaffId}`, function (err, deleteResult) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Staff removed from the database');
                    }
                    StaffManager();
                });
            });
    });
}

// calculate budget
function calculateTotalBudget() {
    db.query('SELECT * FROM department', function (err, departmentResults) {
        if (err) {
            console.log(err);
            return;
        }
        const departmentChoices = departmentResults.map((row) => {
            return {
                name: row.name,
                value: row.id
            };
        });

        inquirer.prompt([
            {
                type: 'list',
                message: 'Which department would you like to calculate its total budget from?',
                name: 'selectedDepartment',
                choices: departmentChoices
            }
        ])
            .then((answers) => {
                const selectedDepartmentId = answers.selectedDepartment;

                db.query(`SELECT SUM(r.salary) AS totalBudget FROM Staff e JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id WHERE d.id = ${selectedDepartmentId}`, function (err, results) {
                    if (err) {
                        console.log(err);
                    }
                    console.log(`The total budget of the department: $${results[0].totalBudget}`);
                    StaffManager();
                });
            });
    });
}

function StaffManager() {
    inquirer.prompt(question)
        .then((answers) => {
            switch (answers.action) {
                case 'View Staff':
                    viewStaffall();
                    break;
                case 'Add Staff':
                    AddStaff();
                    break;
                case 'Update Staff Role':
                    updateStaffRole();
                    break;
                case 'View Roles':
                    viewAllRoles();
                    break;
                case 'Add Role':
                    addRole();
                    break;
                case 'View Departments':
                    viewDepartments();
                    break;
                case 'Add Department':
                    addDepartment();
                    break;
                case 'Update Manager of Staff':
                    updateStaffManager();
                    break;
                case 'View Staff by Manager':
                    viewStaffByManager();
                    break;
                case 'View Staff by Department':
                    viewStaffByDepartment();
                    break;
                case 'Delete Department':
                    deleteDepartment();
                    break;
                case 'Delete Role':
                    deleteRole();
                    break;
                case 'Delete Staff':
                    deleteStaff();
                    break;
                case 'View total budget':
                    calculateTotalBudget();
                    break;
                case 'Quit':
                    console.log('Exiting the Staff manager...see you next time!');
                    process.exit();
                    break;
            }
        });
}




// start StaffManager app
StaffManager();