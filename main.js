const loginPage = document.getElementById("login-panel");
const userPage = document.getElementById("user-panel");
const adminPage = document.getElementById("admin-panel");
const summaryPage = document.getElementById("summary-panel");
const addTeamMemberPage = document.getElementById("add-team-member-panel");
const newTaskPage = document.getElementById("new-task-panel");
const viewTaskPage = document.getElementById("view-task-panel");

class DisplayPanel {
  constructor() {
    this.currentUser = undefined;
    this.currentProject = undefined;
    this.currentAdmin = undefined;
    this.currentKanbanBoard = undefined;
  }

  //Method to login the user
  userLogin() {
    const searchUserList = this.searchUser();

    if (searchUserList === false) {
      return;
    }

    if (!searchUserList) {
      this.clearLoginInputs();
      return alert("Incorrect username and password!");
    }

    this.currentUser = searchUserList;
    displayPanel.selectPanel(userPage);
    this.updateWelcomeMessage();

    this.displayUserProjects();
  }

  //Method to check whether the user has already been registered
  searchUser() {
    const userName = document.getElementById("username-login-input").value;
    const password = document.getElementById("password-login-input").value;

    if (!userName || !password) {
      alert("Require both username and password!!");
      return false;
    }

    return users.find(
      (user) => user.userName === userName && user.password === password
    );
  }

  //Method to clear the login inputs
  clearLoginInputs() {
    document.getElementById("username-login-input").value = "";
    document.getElementById("password-login-input").value = "";
  }

  //Method to print the user name in the user panel
  updateWelcomeMessage() {
    document.getElementById("welcome-msg").textContent = `Welcome ${
      this.currentUser.userName.charAt(0).toUpperCase() +
      this.currentUser.userName.slice(1)
    }`;
  }

  //Method to create a new project
  startNewProject() {
    const projectTitle = prompt("Enter project title");
    if (!projectTitle) return;

    this.createAdminAndProject(projectTitle);
    displayPanel.selectPanel(adminPage);
    document.getElementById("project-title").textContent = `${projectTitle}`;

    displayPanel.selectPanel(adminPage);
    this.displayTeamMembers();
    this.displayTasks();
  }

  //Method to display the selected project
  showProject(projectId) {
    const project = this.currentUser.createdProjects.find(
      (project) => project.id === parseInt(projectId)
    );

    if (project) {
      this.currentProject = project;
      this.selectPanel(adminPage);
      document.getElementById("project-title").textContent = project.title;

      // Check if tasks have already been rendered for this project
      const tasksDiv = document.querySelector(".task-container");
      const existingTasks = tasksDiv.innerHTML;

      this.displayTeamMembers();

      if (!existingTasks.includes(project.title)) {
        this.displayTasks();
      }
    }
  }

  //Method to create admin and new kanbanBoard
  createAdminAndProject(projectTitle) {
    const admin = new Admin(
      this.currentUser.userName,
      this.currentUser.password,
      this.currentUser.email
    );

    this.currentAdmin = admin;
    const newProject = new Project(admin, projectTitle);
    admin.createdProjects.push(newProject);
    this.currentProject = newProject;

    this.currentUser.createdProjects.push(newProject);

    this.currentProject.teamMembers = [];
    this.currentProject.tasks = [];
    this.currentKanbanBoard = this.currentProject.kanbanBoard;
  }

  //Method to add team members to the current project
  addTeamMember() {
    if (!this.currentProject) {
      return alert("No active project to add team members.");
    }

    this.currentAdmin.currentProject = this.currentProject;
    this.currentAdmin.getTeamMember();

    this.selectPanel(adminPage);
    this.displayTeamMembers();
  }

  //Method to display all the projects created by the user
  displayUserProjects() {
    const createdProjectsDiv = document.getElementById("created-projects");
    createdProjectsDiv.innerHTML = "";

    if (this.currentUser && this.currentUser.createdProjects) {
      let projectDiv = "";

      this.currentUser.createdProjects.forEach((project) => {
        projectDiv += `
          <div class="project-display" data-project-id=${project.id}>
            ${project.title}
          </div>
        `;
      });

      document.querySelector("#created-projects").innerHTML = projectDiv;
    }
  }

  //method to display the tasks in the kanbanBoard
  displayTasks() {
    const tasksDiv = document.querySelector(".task-container");
    tasksDiv.innerHTML = "";

    if (!this.currentProject || !this.currentProject.tasks) return;

    let taskDiv = "";
    this.currentProject.tasks.forEach((task) => {
      taskDiv += `
        <div class="task">
          <div><strong>${task.title}</strong></div>
          <div>${task.teamMember}</div>
          <div>${task.deadLine}</div>
        </div>
      `;
    });

    tasksDiv.innerHTML = taskDiv;
  }

 // Method to display the tem members present in the current project
  displayTeamMembers() {
    const teamMembersDiv = document.getElementById("team-members-list");
    teamMembersDiv.innerHTML = "";

    if (!this.currentProject || !this.currentProject.teamMembers) return;

    let memberDiv = "";
    this.currentProject.teamMembers.forEach((teamMember) => {
      if (teamMember !== this.currentUser) {
        memberDiv += `
          <div class="team-members">
            ${teamMember.userName}
          </div>
        `;
      }
    });

    document.getElementById("team-members-list").innerHTML = memberDiv;
  }

  //Method to get the task details from the user
  getTaskDetails() {
    const title = document.getElementById("task-name-input").value;
    const description = document.getElementById("task-desc-input").value;
    const teamMember = document.getElementById("task-mem-input").value;
    const deadLine = document.getElementById("task-deadline-input").value;
    const priority = document.getElementById("task-priority-input").value;

    if (!title || !description || !teamMember || !deadLine || !priority) {
      alert("Please fill in all fields before creating a new task.");
      return;
    }

    displayPanel.currentProject.admin.createTask(
      title,
      description,
      teamMember,
      deadLine,
      priority
    );

    document.getElementById("task-name-input").value = "";
    document.getElementById("task-desc-input").value = "";
    document.getElementById("task-mem-input").value = "";
    document.getElementById("task-deadline-input").value = "";
    document.getElementById("task-priority-input").value = "";

    displayPanel.selectPanel(adminPage);
  }

  backToUserPage() {
    this.selectPanel(userPage);
    this.displayUserProjects();
  }

  logout() {
    this.currentUser = undefined;
    this.currentProject = undefined;

    this.clearLoginInputs();

    this.selectPanel(loginPage);
  }

  summary() {
    this.selectPanel(summaryPage);
    const taskSummary = document.querySelector(".summary-lists")
    let html=""
    displayPanel.currentProject.tasks.forEach(e => {
      html += `
      <div class="task-overall-summary">
          <div>Taskname:${e.title}</div>
          <div>Team member:${e.teamMember}</div>
          <div>Deadline:${e.deadLine}</div>
        </div>
      `
    })
    taskSummary.innerHTML = html;
  }

  //Method to change the selected panel
  selectPanel(panelSelected) {
    const panels = document.querySelectorAll(".panel");
    panels.forEach((panel) => {
      panel.style.display = "none";
    });
    panelSelected.style.display = "block";
  }
}

class User {
  static userIdCounter = 1;

  constructor(userName, password, email) {
    this.userName = userName;
    this.password = password;
    this.email = email;
    this.id = User.userIdCounter++;
    this.isAdmin = false;
    this.createdProjects = [];
  }
}

class Admin extends User {
  constructor(userName, password, email) {
    super(userName, password, email);
    this.isAdmin = true;
    this.currentProject = undefined;
  }

  // Method to get the Team member for the current project
  getTeamMember() {
    const memberName = document.getElementById(
      "add-member-username-input"
    ).value;
    const memberEmail = document.getElementById("add-member-email-input").value;

    if (!memberEmail || !memberName)
      return alert("Require both name and password");

    if (!this.currentProject) {
      return alert("No active project to add team members.");
    }

    //To check if the member selected already exists in the project
    const existingTeamMember = this.currentProject.teamMembers.find(
      (teamMember) =>
        teamMember.userName === memberName && teamMember.email === memberEmail
    );

    if (existingTeamMember) {
      return alert("Team member is already present in the project.");
    }

    const foundUser = users.find(
      (user) => memberName === user.userName && memberEmail === user.email
    );

    if (foundUser) {
      this.currentProject.teamMembers.push(foundUser);
      pop(displayPanel.currentProject.teamMembers);
    } else {
      alert("User not found");
    }

    document.getElementById("add-member-username-input").value = "";
    document.getElementById("add-member-email-input").value = "";

    displayPanel.selectPanel(adminPage);
    displayPanel.displayTeamMembers();
  }

  //Method to remove a team member from the current project
  removeTeamMember() {
    if (!this.currentProject || !this.currentProject.teamMembers.length) {
      return alert("No team members to remove.");
    }

    const memberNameToRemove = prompt(
      "Enter the username of the team member to remove:"
    );

    if (!memberNameToRemove) {
      return alert("Invalid input. Please enter a username.");
    }

    const teamMemberToRemove = this.currentProject.teamMembers.find(
      (teamMember) => teamMember.userName === memberNameToRemove
    );

    if (!teamMemberToRemove) {
      return alert("Team member not found in the project.");
    }

    const indexToRemove =
      this.currentProject.teamMembers.indexOf(teamMemberToRemove);
    this.currentProject.teamMembers.splice(indexToRemove, 1);

    displayPanel.displayTeamMembers();
  }

  //Method to create a new task
  createTask(title, description, teamMember, deadLine, priority) {
    const task = new Task(title, description, teamMember, deadLine, priority);
    displayPanel.currentProject.tasks.push(task);
    displayPanel.currentProject.kanbanBoard.addTask(btnId, task);
  }
}

class Project {
  static projectIdCounter = 1;

  constructor(admin, title) {
    this.id = Project.projectIdCounter++;
    this.title = title;
    this.admin = admin;
    this.teamMembers = [];
    this.tasks = [];
    this.kanbanBoard = new KanbanBoard();
  }
}

class KanbanBoard {
  static boardIdCounter = 1;
  constructor() {
    this.id = KanbanBoard.boardIdCounter++;
    this.columns = {
      todo: new Column(),
      progress: new Column(),
      done: new Column(),
    };
  }

  addTask(column, task) {
    this.columns[column].addTask(task);
    this.renderTasks(column);
  }

  renderTasks(column) {
    const columnElement = document.getElementById(`${column}-tasks`);
    columnElement.innerHTML = "";
    let taskElement = "";
   
    this.columns[column].tasks.forEach((task) => {
   
      taskElement += `
        <div class="column-tasks" draggable="true" style="background-color: ${task.priorityColor};">
          <div>
            <div><strong>${task.title}</strong></div>
            <div>${task.teamMember}</div>
          </div>
          <div>${task.deadLine}</div>
        </div>
      `;
    });
   
    document.getElementById(`${column}-tasks`).innerHTML = taskElement;
  }
}

class Column {
  constructor() {
    this.tasks = [];
  }

  addTask(task) {
    this.tasks.push(task);
  }
}

class Task {
  static taskIdCounter = 1;

  constructor(title, description, teamMember, deadLine, priority) {
    this.title = title;
    this.description = description;
    this.teamMember = teamMember;
    this.deadLine = deadLine;
    this.priority = priority;
    this.id = Task.taskIdCounter++;
    this.priorityColor = this.getPriorityColor(priority);
  }

  getPriorityColor(priority) {
   
    if (priority === "High priority") {
      return "lightpink";
    } else if (priority === "Low priority") {
      return "lightblue";
    } else {
      return "white";
    }
  }
  
}

const displayPanel = new DisplayPanel();
const users = [
  new User("kepha", "pw1", "kepha@gmail.com"),
  new User("mizpah", "pw2", "mizpah@gmail.com"),
  new User("madav", "pw3", "madav@gmail.com"),
  new User("suriya", "pw4", "suriya@gmail.com"),
  new User("varshini", "pw5", "varshini@gmail.com"),
];

document.querySelector("#created-projects").addEventListener("click", (e) => {
  if (e.target.classList.contains("project-display")) {
    const projectId = e.target.dataset.projectId;
    displayPanel.showProject(projectId);
  }
});

function addNewTask(button) {
  btnId = button.id;
  displayPanel.selectPanel(newTaskPage);
}

const selectElement = document.getElementById("task-mem-input");
function pop(teamMembers) {
  selectElement.innerHTML = "";
  teamMembers.forEach((member) => {
    const optionElement = document.createElement("option");
    optionElement.value = member.userName;
    optionElement.text = member.userName;

    selectElement.appendChild(optionElement);
  });
}
