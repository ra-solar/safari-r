let carImage;
let backgroundImage;
let animalImages = [];
let carX = 0, carY = 0; // Start at the top-left corner of the background
let carSpeed = 8; // Increased car speed
let angle = 0;
let showingAnimal = false;
let animalStartTime;
let currentAnimalImage;
let backgroundWidth, backgroundHeight;

let lastCarX = 0, lastCarY = 0;
let distanceTraveled = 0;
let distanceThreshold = 500; // Adjust this value as needed

let gameStarted = false; // Variable to track if the game has started

// Define folders and their weights
const animalFolders = [
  { name: 'buffalo', weight: 0.3, count: 2, images: [] },
  { name: 'gates', weight: 0.1, count: 6, images: [] },
  { name: 'raros', weight: 0.1, count: 6, images: [] },
  { name: 'ungulata-big', weight: 0.4, count: 5, images: [] },
  { name: 'ungulata-smol', weight: 0.7, count: 7, images: [] },
];

function preload() {
  // Load and resize the car image
  carImage = loadImage("images/toyota.png", function () {
    carImage.resize(carImage.width / 3, 0); // Made the car smaller
  });
  backgroundImage = loadImage("images/forest.png");

  // Load animal images from each folder
  for (let folder of animalFolders) {
    for (let i = 1; i <= folder.count; i++) {
      let number = String(i).padStart(2, "0");
      let img = loadImage(`images/${folder.name}/animal-${number}.png`);
      folder.images.push(img);
    }
  }
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);

  // Set background dimensions
  backgroundWidth = backgroundImage.width * 5; // Adjust the scaling factor as needed
  backgroundHeight = backgroundImage.height * 5;

  // Initialize last car position
  lastCarX = carX;
  lastCarY = carY;
}

function draw() {
  if (!gameStarted) {
    // Display intro screen
    background(0); // Black background
    fill(255); // White text
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Press space to start safari", width / 2, height / 2);
  } else if (showingAnimal) {
    // Display the animal image fullscreen
    image(currentAnimalImage, 0, 0, width, height);

    // Check if 2 seconds have passed
    if (millis() - animalStartTime >= 2000) {
      showingAnimal = false; // Return to the game
    }
  } else {
    // Update car position based on key presses
    let moved = false;
    if (keyIsDown(LEFT_ARROW)) {
      carX -= carSpeed;
      angle = PI; // Rotate 180 degrees
      moved = true;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      carX += carSpeed;
      angle = 0; // No rotation
      moved = true;
    }
    if (keyIsDown(UP_ARROW)) {
      carY -= carSpeed;
      angle = -HALF_PI; // Rotate -90 degrees (up)
      moved = true;
    }
    if (keyIsDown(DOWN_ARROW)) {
      carY += carSpeed;
      angle = HALF_PI; // Rotate 90 degrees (down)
      moved = true;
    }

    // Calculate distance traveled
    if (moved) {
      let dx = carX - lastCarX;
      let dy = carY - lastCarY;
      distanceTraveled += sqrt(dx * dx + dy * dy);
      lastCarX = carX;
      lastCarY = carY;
    }

    // Check if distance threshold is exceeded
    if (distanceTraveled >= distanceThreshold) {
      showRandomAnimal();
      distanceTraveled = 0; // Reset distance
    }

    // Constrain carX and carY
    carX = constrain(carX, -(backgroundWidth - width / 2), (backgroundWidth - width) / 2);
    carY = constrain(carY, -(backgroundHeight - height / 2), (backgroundHeight - height) / 2);

    // Draw the background moving opposite to the car's movement
    push();
    imageMode(CENTER);
    translate(-carX, -carY);
    image(backgroundImage, 0, 0, backgroundWidth, backgroundHeight);
    pop();

    // Draw the car centered on the screen
    push();
    translate(width / 2, height / 2);
    rotate(angle);
    imageMode(CENTER);
    image(carImage, 0, 0);
    pop();
  }
}

function showRandomAnimal() {
  // Create a weighted list
  let totalWeight = animalFolders.reduce((sum, folder) => sum + folder.weight, 0);
  let randomNum = random(totalWeight);
  let accumulatedWeight = 0;
  let selectedFolder;

  for (let folder of animalFolders) {
    accumulatedWeight += folder.weight;
    if (randomNum <= accumulatedWeight) {
      selectedFolder = folder;
      break;
    }
  }

  // Pick a random image from the selected folder
  currentAnimalImage = random(selectedFolder.images);

  // Set the flag to show the animal image
  showingAnimal = true;
  // Record the start time
  animalStartTime = millis();
}

function keyPressed() {
  if (keyCode === 32) { // 32 is the space bar
    if (!gameStarted) {
      gameStarted = true;
    }
  }
}
