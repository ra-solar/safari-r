let carImage;
let backgroundImage;
let carX = 0, carY = 0;
let carSpeed = 8; // Increased speed
let angle = 0;
let showingAnimal = false;
let animalStartTime;
let currentAnimalImage;
let backgroundWidth, backgroundHeight;
let bgMusic; // Variable for background music
let gameState = 'intro'; // Game state variable

let lastCarX = 0, lastCarY = 0;
let distanceTraveled = 0;
let distanceThreshold = 500; // Adjust this value as needed

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
    carImage.resize(carImage.width / 3, 0); // Make the car smaller
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

  // Load the background music
  bgMusic = loadSound('music/forest.mp4');
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);

  // Set background dimensions
  backgroundWidth = backgroundImage.width * 5; // Adjust the scaling factor as needed
  backgroundHeight = backgroundImage.height * 5;

  // Initialize last car position
  lastCarX = carX;
  lastCarY = carY;

  // Initialize audio context for autoplay policies
  userStartAudio();
}

function draw() {
  if (gameState === 'intro') {
    // Display the intro screen
    background(0); // Black background
    fill(255); // White text
    textAlign(CENTER, CENTER);
    textSize(32);
    text('Press SPACE to start safari', width / 2, height / 2);
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
    let dx = 0;
    let dy = 0;

    if (keyIsDown(LEFT_ARROW)) {
      dx -= 1;
      moved = true;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      dx += 1;
      moved = true;
    }
    if (keyIsDown(UP_ARROW)) {
      dy -= 1;
      moved = true;
    }
    if (keyIsDown(DOWN_ARROW)) {
      dy += 1;
      moved = true;
    }

    if (moved) {
      // Normalize the movement vector to maintain consistent speed
      let mag = sqrt(dx * dx + dy * dy);
      dx = (dx / mag) * carSpeed;
      dy = (dy / mag) * carSpeed;

      carX += dx;
      carY += dy;

      // Calculate angle based on movement direction
      angle = atan2(dy, dx) + PI / 2;

    }

    // Calculate distance traveled
    if (moved) {
      let deltaX = carX - lastCarX;
      let deltaY = carY - lastCarY;
      distanceTraveled += sqrt(deltaX * deltaX + deltaY * deltaY);
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
    rotate(angle); // Use the corrected angle
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
  if (gameState === 'intro' && keyCode === 32) { // 32 is the keycode for SPACE
    gameState = 'play'; // Start the game

    // Start the background music
    if (!bgMusic.isPlaying()) {
      bgMusic.loop();
    }
  } else if (!showingAnimal && keyCode === 32) {
    // Show a random animal when space is pressed during the game
    showRandomAnimal();
  }
}
