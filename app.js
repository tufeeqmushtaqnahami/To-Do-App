// Wait until the DOM (HTML structure) is fully loaded before running JS
document.addEventListener("DOMContentLoaded", () => {
  // Get references to DOM elements
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");
  const emptyImage = document.querySelector(".empty-image");
  const todosContainer = document.querySelector(".todos-container");
  const progressBar = document.querySelector("#progress");
  const progressNumbers = document.querySelector("#number");

  // Toggle empty state (image + container width)
  const toggleEmptyState = () => {
    emptyImage.style.display =
      taskList.children.length === 0 ? "block" : "none";
    todosContainer.style.width =
      taskList.children.length > 0 ? "100%" : "50%";
  };

  // Update progress bar + completion numbers
  const updateProgress = (checkCompletion = true) => {
    const totalTask = taskList.children.length;
    const completedTask =
      taskList.querySelectorAll(".checkbox:checked").length;

    // Set progress bar width
    progressBar.style.width = totalTask
      ? `${(completedTask / totalTask) * 100}%`
      : "0%";

    // Update text (example: 2 / 5)
    progressNumbers.textContent = `${completedTask} / ${totalTask}`;

    // If all tasks completed → trigger confetti
    if (checkCompletion && totalTask > 0 && completedTask === totalTask) {
      launchConfetti();
    }
  };

  // Load saved tasks from localStorage
  const loadFromLocalStorage = () => {
    const savedTask = JSON.parse(localStorage.getItem("tasks")) || [];
    savedTask.forEach(({ text, completed }) => addTask(text, completed));
    toggleEmptyState();
    updateProgress();
  };

  // Save tasks to localStorage
  const saveToLocalStorage = () => {
    const tasks = Array.from(taskList.querySelectorAll("li")).map((li) => ({
      text: li.querySelector("span").textContent,
      completed: li.querySelector(".checkbox").checked,
    }));
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  // Add new task to list
  const addTask = (text, completed = false) => {
    const taskText = text || taskInput.value.trim();
    if (!taskText) return; // Ignore empty tasks

    // Create <li> for task
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" class="checkbox" ${completed ? "checked" : ""}/>
      <span>${taskText}</span>
      <div class="task-buttons">
        <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    const checkbox = li.querySelector(".checkbox");
    const editBtn = li.querySelector(".edit-btn");

    // If task is already completed
    if (completed) {
      li.classList.add("completed");
      editBtn.disabled = true;
      editBtn.style.opacity = "0.5";
      editBtn.style.pointerEvents = "none";
    }

    // Handle checkbox toggle (complete/uncomplete)
    checkbox.addEventListener("change", () => {
      const isChecked = checkbox.checked;
      li.classList.toggle("completed", isChecked);

      // Disable editing if completed
      editBtn.disabled = isChecked;
      editBtn.style.opacity = isChecked ? "0.5" : "1";
      editBtn.style.pointerEvents = isChecked ? "none" : "auto";

      updateProgress();
      saveToLocalStorage();
    });

    // Handle edit button
    editBtn.addEventListener("click", () => {
      if (!checkbox.checked) {
        taskInput.value = li.querySelector("span").textContent;
        li.remove(); // Remove old task
        toggleEmptyState();
        updateProgress(false);
        saveToLocalStorage();
      }
    });

    // Handle delete button
    li.querySelector(".delete-btn").addEventListener("click", () => {
      li.remove();
      toggleEmptyState();
      updateProgress();
      saveToLocalStorage();
    });

    // Append task to list
    taskList.appendChild(li);

    // Clear input field
    taskInput.value = "";

    // Update UI + save
    toggleEmptyState();
    updateProgress();
    saveToLocalStorage();
  };

  // Add task when clicking the "Add" button
  addTaskBtn.addEventListener("click", () => {
    addTask();
    saveToLocalStorage();
  });

  // Add task when pressing "Enter"
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      addTask();
    }
  });

  // Load saved tasks on startup
  loadFromLocalStorage();
});

// Confetti effect when all tasks are completed
const launchConfetti = () => {
  const count = 200,
    defaults = {
      origin: { y: 0.7 },
    };

  function fire(particleRatio, opts) {
    window.confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      })
    );
  }

  // Different bursts of confetti 🎉
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};
