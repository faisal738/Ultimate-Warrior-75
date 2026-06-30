// Exercise Database categorized by target type, equipment, and difficulty
export const exercisesDatabase = {
  push: {
    gym: {
      beginner: [
        { name: "Dumbbell Chest Press", reps: "10-12 reps", sets: 3, duration: "6 mins", description: "Flat bench dumbbell chest press for chest strength." },
        { name: "Dumbbell Shoulder Press (Seated)", reps: "10-12 reps", sets: 3, duration: "6 mins", description: "Shoulder pressing movement focusing on anterior deltoids." },
        { name: "Triceps Pushdown (Cables)", reps: "12-15 reps", sets: 3, duration: "5 mins", description: "Tricep isolation using cable machine." },
        { name: "Incline Dumbbell Press", reps: "10-12 reps", sets: 3, duration: "6 mins", description: "Incline press for upper chest development." }
      ],
      intermediate: [
        { name: "Barbell Bench Press", reps: "8-10 reps", sets: 4, duration: "8 mins", description: "Standard flat barbell bench press." },
        { name: "Overhead Barbell Press", reps: "8-10 reps", sets: 4, duration: "8 mins", description: "Standing overhead press for shoulder power." },
        { name: "Dips (Chest Focus)", reps: "8-12 reps", sets: 3, duration: "6 mins", description: "Leaning forward dips using parallel bars." },
        { name: "Triceps Overhead Extension (Dumbbell)", reps: "10-12 reps", sets: 3, duration: "5 mins", description: "Overhead triceps stretch and press." }
      ],
      advanced: [
        { name: "Weighted Barbell Bench Press", reps: "5-6 reps", sets: 5, duration: "10 mins", description: "Heavy chest strength builder." },
        { name: "Handstand Pushups (Wall Supported)", reps: "8-10 reps", sets: 4, duration: "8 mins", description: "Advanced bodyweight shoulder press." },
        { name: "Close-Grip Barbell Bench Press", reps: "6-8 reps", sets: 4, duration: "8 mins", description: "Heavy tricep builder." },
        { name: "Cable Lateral Raises", reps: "12-15 reps", sets: 4, duration: "6 mins", description: "Constant tension lateral raise for shoulder width." }
      ]
    },
    home: {
      beginner: [
        { name: "Incline Pushups", reps: "8-10 reps", sets: 3, duration: "5 mins", description: "Pushups with hands on elevated surface like a bed/chair." },
        { name: "Knee Pushups", reps: "10-12 reps", sets: 3, duration: "5 mins", description: "Pushups with knees on ground." },
        { name: "Pike Pushups (Hands Elevated)", reps: "8-10 reps", sets: 3, duration: "6 mins", description: "Decline pushup setup targeting shoulders." },
        { name: "Triceps Chair Dips", reps: "10-12 reps", sets: 3, duration: "5 mins", description: "Bodyweight dips using a chair." }
      ],
      intermediate: [
        { name: "Standard Pushups", reps: "12-15 reps", sets: 4, duration: "8 mins", description: "Classic chest/triceps exercise on the floor." },
        { name: "Pike Pushups", reps: "8-10 reps", sets: 3, duration: "7 mins", description: "Pike posture pushups on floor targeting shoulders." },
        { name: "Diamond Pushups", reps: "8-12 reps", sets: 3, duration: "6 mins", description: "Close-hand pushups to isolate triceps." },
        { name: "Decline Pushups", reps: "10-12 reps", sets: 3, duration: "6 mins", description: "Feet elevated on a chair to hit upper chest." }
      ],
      advanced: [
        { name: "Archer Pushups", reps: "6-8 reps per side", sets: 4, duration: "8 mins", description: "One-arm assisted pushup movement." },
        { name: "Handstand Pushups (Wall-assisted)", reps: "5-8 reps", sets: 4, duration: "8 mins", description: "Advanced bodyweight shoulder press." },
        { name: "Pseudo Planche Pushups", reps: "8-10 reps", sets: 4, duration: "8 mins", description: "Leaning forward pushups to load shoulders." },
        { name: "One-Arm Pushup Progression", reps: "4-6 reps", sets: 3, duration: "6 mins", description: "Extremely challenging unilateral push." }
      ]
    }
  },
  pull: {
    gym: {
      beginner: [
        { name: "Lat Pulldown (Cable)", reps: "10-12 reps", sets: 3, duration: "6 mins", description: "Cable vertical pull for back width." },
        { name: "Seated Cable Row", reps: "10-12 reps", sets: 3, duration: "6 mins", description: "Horizontal cable pull for mid-back thickness." },
        { name: "Dumbbell Bicep Curls", reps: "12-15 reps", sets: 3, duration: "5 mins", description: "Standing isolation curl for bicep peaks." },
        { name: "Face Pulls", reps: "15 reps", sets: 3, duration: "5 mins", description: "Cable pull to face targeting rear delts and rotator cuffs." }
      ],
      intermediate: [
        { name: "Pullups (Bodyweight)", reps: "6-10 reps", sets: 4, duration: "8 mins", description: "Overhand grip chin-up bar pull." },
        { name: "Barbell Bent-Over Row", reps: "8-10 reps", sets: 4, duration: "8 mins", description: "Heavy horizontal row for full back power." },
        { name: "Hammer Curls", reps: "10-12 reps", sets: 3, duration: "5 mins", description: "Neutral grip curl for forearm and biceps." },
        { name: "Single-Arm Dumbbell Row", reps: "10-12 reps per side", sets: 3, duration: "6 mins", description: "Unilateral row supporting on a bench." }
      ],
      advanced: [
        { name: "Weighted Pullups", reps: "5-6 reps", sets: 4, duration: "8 mins", description: "Pullups with weight belt or dumbbell." },
        { name: "Pendlay Rows", reps: "6-8 reps", sets: 4, duration: "8 mins", description: "Horizontal row starting dead stop from floor." },
        { name: "Incline Dumbbell Curls", reps: "8-10 reps", sets: 3, duration: "6 mins", description: "Bicep curl on incline bench for maximum stretch." },
        { name: "Barbell Shrugs", reps: "10-12 reps", sets: 4, duration: "6 mins", description: "Heavy shrugs for traps development." }
      ]
    },
    home: {
      beginner: [
        { name: "Bed Sheet Rows", reps: "10-12 reps", sets: 3, duration: "6 mins", description: "Rowing movement using a bed sheet anchored to door." },
        { name: "Resistance Band Pulldown", reps: "12-15 reps", sets: 3, duration: "6 mins", description: "Banded pull imitating lat machine." },
        { name: "Water Jug Bicep Curls", reps: "12-15 reps", sets: 3, duration: "5 mins", description: "Improvised weight curls using water jugs." },
        { name: "Floor Back Extensions", reps: "15 reps", sets: 3, duration: "5 mins", description: "Superman lifts for lower back strength." }
      ],
      intermediate: [
        { name: "Doorway Row / Table Row", reps: "8-12 reps", sets: 4, duration: "8 mins", description: "Rowing under a table or gripping a sturdy doorframe." },
        { name: "Chin-ups (Door Frame Bar)", reps: "6-8 reps", sets: 3, duration: "6 mins", description: "Underhand grip vertical pull." },
        { name: "Resistance Band Bicep Curls", reps: "12-15 reps", sets: 3, duration: "5 mins", description: "High-tension band curls." },
        { name: "Prone Cobra", reps: "Hold for 45s", sets: 3, duration: "5 mins", description: "Lie face down, lift upper body and rotate thumbs up." }
      ],
      advanced: [
        { name: "L-Sit Pullups", reps: "5-8 reps", sets: 4, duration: "8 mins", description: "Pullups keeping legs in an L-sit posture." },
        { name: "Towel Pullups", reps: "6-8 reps", sets: 4, duration: "8 mins", description: "Vertical pull gripping a towel for grip strength." },
        { name: "Resistance Band Single-Arm Row", reps: "10-12 reps per side", sets: 4, duration: "6 mins", description: "High tension bands unilateral row." },
        { name: "Supermans (Weighted)", reps: "12-15 reps", sets: 4, duration: "6 mins", description: "Superman holds holding light objects in hands." }
      ]
    }
  },
  legs: {
    gym: {
      beginner: [
        { name: "Goblet Squat (Dumbbell)", reps: "10-12 reps", sets: 3, duration: "6 mins", description: "Holding a dumbbell at chest height while squatting." },
        { name: "Leg Press", reps: "10-12 reps", sets: 3, duration: "6 mins", description: "Machine leg press for quad and glute strength." },
        { name: "Lying Leg Curl", reps: "12-15 reps", sets: 3, duration: "5 mins", description: "Hamstrings isolation on a machine." },
        { name: "Standing Calf Raises", reps: "15-20 reps", sets: 3, duration: "5 mins", description: "Calf extension movements." }
      ],
      intermediate: [
        { name: "Barbell Back Squat", reps: "8-10 reps", sets: 4, duration: "8 mins", description: "Primary compound leg strength builder." },
        { name: "Romanian Deadlift (Barbell)", reps: "10-12 reps", sets: 3, duration: "7 mins", description: "Hip-hinge targeting hamstrings and glutes." },
        { name: "Walking Lunges (Dumbbell)", reps: "10 steps per side", sets: 3, duration: "6 mins", description: "Lunge steps holding dumbbells." },
        { name: "Seated Calf Raises", reps: "12-15 reps", sets: 3, duration: "5 mins", description: "Calf activation machine." }
      ],
      advanced: [
        { name: "Barbell Front Squat", reps: "6-8 reps", sets: 4, duration: "8 mins", description: "Quad-dominant front-rack squat." },
        { name: "Deficit Romanian Deadlift", reps: "8-10 reps", sets: 4, duration: "8 mins", description: "RDL standing on a plate for extra range of motion." },
        { name: "Bulgarian Split Squats (Dumbbells)", reps: "8-10 reps per side", sets: 3, duration: "7 mins", description: "Single-leg torture exercise." },
        { name: "Hamstring Glute-Ham Raise (GHD)", reps: "8-10 reps", sets: 3, duration: "6 mins", description: "Bodyweight eccentric hamstring curls." }
      ]
    },
    home: {
      beginner: [
        { name: "Air Squats", reps: "15-20 reps", sets: 3, duration: "5 mins", description: "Bodyweight deep squats." },
        { name: "Glute Bridges", reps: "15-20 reps", sets: 3, duration: "5 mins", description: "Lying on back, driving hips up to squeeze glutes." },
        { name: "Step-ups (onto Chair)", reps: "10 reps per side", sets: 3, duration: "5 mins", description: "Stepping onto a sturdy chair or couch." },
        { name: "Calf Raises (Flat Ground)", reps: "20-25 reps", sets: 3, duration: "4 mins", description: "Standing double-leg calf raises." }
      ],
      intermediate: [
        { name: "Bulgarian Split Squat", reps: "10-12 reps per side", sets: 3, duration: "6 mins", description: "Rear foot elevated on bed/chair." },
        { name: "Single-Leg Glute Bridges", reps: "10-12 reps per side", sets: 3, duration: "6 mins", description: "Glute bridges on one leg." },
        { name: "Walking Lunges (Bodyweight)", reps: "12 steps per side", sets: 3, duration: "6 mins", description: "Forward stepping lunges." },
        { name: "Single-Leg Calf Raises", reps: "15 reps per side", sets: 3, duration: "5 mins", description: "Calf raises balancing on one leg." }
      ],
      advanced: [
        { name: "Pistol Squats (Single Leg)", reps: "5-8 reps per side", sets: 3, duration: "7 mins", description: "Full one-legged squats." },
        { name: "Nordic Hamstring Curls (Anchor feet)", reps: "5-8 reps", sets: 3, duration: "6 mins", description: "Lowering body slowly forward from knees." },
        { name: "Jump Squats (Explosive)", reps: "15 reps", sets: 4, duration: "6 mins", description: "Squat down and jump as high as possible." },
        { name: "Deficit Split Squats (Elevated front & back)", reps: "10-12 reps per side", sets: 3, duration: "6 mins", description: "Maximum depth split squats." }
      ]
    }
  },
  cardio_hiit: {
    gym: {
      beginner: [
        { name: "Treadmill Walk (Incline 5%)", reps: "45 mins", sets: 1, duration: "45 mins", description: "Steady state walk at a brisk pace on incline." },
        { name: "Stationary Bike (Moderate)", reps: "45 mins", sets: 1, duration: "45 mins", description: "Cycling at moderate intensity." }
      ],
      intermediate: [
        { name: "Rowing Machine Intervals", reps: "30s work / 30s rest", sets: 20, duration: "25 mins", description: "Intense sprints on rowing machine." },
        { name: "Stairmaster Cardio", reps: "45 mins", sets: 1, duration: "45 mins", description: "Climbing stairs at a steady high pace." }
      ],
      advanced: [
        { name: "Assault Bike Sprints", reps: "20s max sprint / 40s easy", sets: 15, duration: "15 mins", description: "High-intensity air bike intervals." },
        { name: "Treadmill Running Sprints", reps: "1 min sprint / 1 min walk", sets: 10, duration: "20 mins", description: "Fast sprint intervals on treadmill." }
      ]
    },
    home: {
      beginner: [
        { name: "Brisk Outdoor Walk", reps: "45 mins", sets: 1, duration: "45 mins", description: "Outdoor walk around the neighborhood." },
        { name: "Jumping Jacks & Shadow Boxing", reps: "40s work / 20s rest", sets: 5, duration: "10 mins", description: "Light cardio circuit." }
      ],
      intermediate: [
        { name: "Outdoor Jogging", reps: "45 mins", sets: 1, duration: "45 mins", description: "Steady outdoor running/jogging." },
        { name: "HIIT Home Circuit (Bodyweight)", reps: "40s on / 20s off", sets: 4, duration: "20 mins", description: "Mountain climbers, burpees, high knees, squats." }
      ],
      advanced: [
        { name: "Outdoor Hill Sprints", reps: "15s sprint / 45s walk back", sets: 12, duration: "20 mins", description: "Uphill maximal effort sprints." },
        { name: "Spartan Home HIIT Circuit", reps: "45s work / 15s rest", sets: 5, duration: "25 mins", description: "Burpee tuck jumps, plyo pushups, mountain climbers, jump lunges." }
      ]
    }
  },
  mobility_stretching: {
    gym: {
      beginner: [
        { name: "Static Stretching", reps: "Hold 30s each", sets: 1, duration: "15 mins", description: "Hamstring, quad, chest, and shoulder static stretches." },
        { name: "Foam Rolling (Lower body)", reps: "Roll 1 min per muscle", sets: 1, duration: "10 mins", description: "Myofascial release on calves, IT band, and quads." }
      ],
      intermediate: [
        { name: "Dynamic Warm-up & Foam Roll", reps: "Full body", sets: 1, duration: "20 mins", description: "World's greatest stretch, arm circles, leg swings, foam rolling." }
      ],
      advanced: [
        { name: "Active Mobility Routine", reps: "CARS & PNF stretching", sets: 1, duration: "25 mins", description: "Controlled articular rotations for shoulders/hips and PNF stretching." }
      ]
    },
    home: {
      beginner: [
        { name: "Morning Sunnah Yoga/Stretch", reps: "Slow pacing", sets: 1, duration: "15 mins", description: "Relaxing neck, back, and hip openers." },
        { name: "Child's Pose & Cat-Cow Flow", reps: "Hold 30s / Flow 10 reps", sets: 3, duration: "8 mins", description: "Spinal mobility and upper back relaxation." }
      ],
      intermediate: [
        { name: "Full Body Flow", reps: "30s per position", sets: 3, duration: "20 mins", description: "Deep lunges, cobra stretches, downward dog, and hamstring sweeps." }
      ],
      advanced: [
        { name: "Deep Squat Hold & Thoracic Rotation", reps: "5 mins total", sets: 3, duration: "15 mins", description: "Assisting ankle dorsiflexion and deep chest openers." }
      ]
    }
  }
};

// Generate a balanced 45-minute workout
export const generateWorkout = (difficulty = 'intermediate', goal = 'maintenance', env = 'home', focus = 'full_body') => {
  const diff = ['beginner', 'intermediate', 'advanced'].includes(difficulty) ? difficulty : 'intermediate';
  const place = ['home', 'gym'].includes(env) ? env : 'home';
  
  // Custom durations depending on focus.
  // Standard 45m workout structure:
  // Warm-up: 5 mins (Mobility/Stretching)
  // Workout: 35 mins
  // Cool-down: 5 mins
  
  const warmUp = { name: "Dynamic Warm-Up (Cat-Cow, Arm circles, Leg swings)", duration: "5 mins", description: "Prepare the joints for movement and increase heart rate." };
  const coolDown = { name: "Full Body Static Stretching (Hamstrings, Chest, Hip Flexors)", duration: "5 mins", description: "Relax the nervous system and promote recovery." };

  let mainExercises = [];

  if (focus === 'walking' || focus === 'running' || focus === 'cycling') {
    // Single outdoor cardio workout
    const nameStr = focus.charAt(0).toUpperCase() + focus.slice(1);
    mainExercises = [
      { name: `Outdoor ${nameStr}`, reps: "Steady pace", sets: 1, duration: "35 mins", description: `Outdoor ${focus} workout at a target fat burning zone (HR 120-140).` }
    ];
  } else if (focus === 'hiit') {
    // Cardio HIIT circuit
    const pool = exercisesDatabase.cardio_hiit[place][diff] || exercisesDatabase.cardio_hiit.home.intermediate;
    mainExercises = [...pool];
    
    // pad to at least 3 exercises if needed
    if (mainExercises.length < 3 && place === 'home') {
      mainExercises.push({ name: "Jumping Squats", reps: "40s work / 20s rest", sets: 3, duration: "8 mins", description: "Explosive squat jumps." });
    }
  } else if (focus === 'push') {
    mainExercises = exercisesDatabase.push[place][diff] || [];
  } else if (focus === 'pull') {
    mainExercises = exercisesDatabase.pull[place][diff] || [];
  } else if (focus === 'legs') {
    mainExercises = exercisesDatabase.legs[place][diff] || [];
  } else if (focus === 'mobility' || focus === 'stretching') {
    mainExercises = exercisesDatabase.mobility_stretching[place][diff] || [];
  } else {
    // Default to Full Body / General Balanced Workout
    const pushPool = exercisesDatabase.push[place][diff] || [];
    const pullPool = exercisesDatabase.pull[place][diff] || [];
    const legsPool = exercisesDatabase.legs[place][diff] || [];
    
    if (pushPool.length > 0) mainExercises.push(pushPool[0]);
    if (pullPool.length > 0) mainExercises.push(pullPool[0]);
    if (legsPool.length > 0) mainExercises.push(legsPool[0]);
    if (pushPool.length > 1) mainExercises.push(pushPool[1]);
    if (legsPool.length > 1) mainExercises.push(legsPool[1]);
  }

  // Calculate workout details based on goals
  // If Fat Loss, we might reduce sets but add cardio or reps
  // If Muscle Gain, we might add a set and focus on mechanical tension
  const customizedExercises = mainExercises.map(ex => {
    let sets = ex.sets;
    let reps = ex.reps;
    
    if (goal === 'muscle_gain' && typeof sets === 'number') {
      sets += 1; // Add volume
    }
    
    return {
      ...ex,
      sets,
      reps,
      category: focus
    };
  });

  return [
    warmUp,
    ...customizedExercises,
    coolDown
  ];
};

// Get alternative exercises for swapping
export const getAlternatives = (exerciseName, currentCategory = 'push', env = 'home', difficulty = 'intermediate') => {
  const place = ['home', 'gym'].includes(env) ? env : 'home';
  const diff = ['beginner', 'intermediate', 'advanced'].includes(difficulty) ? difficulty : 'intermediate';
  
  // Find which pool has the current exercise, or search active category
  let searchPool = [];
  const categories = ['push', 'pull', 'legs', 'cardio_hiit', 'mobility_stretching'];
  
  let detectedCategory = currentCategory;
  
  // Try to find correct category based on exercise name
  for (const cat of categories) {
    const list = exercisesDatabase[cat]?.[place]?.[diff] || [];
    if (list.some(ex => ex.name === exerciseName)) {
      detectedCategory = cat;
      break;
    }
  }

  const list = exercisesDatabase[detectedCategory]?.[place]?.[diff] || [];
  // Return exercises from that same category/environment/diff that are NOT the current exercise
  const alts = list.filter(ex => ex.name !== exerciseName);
  
  // If empty, return a general fallback from the same category
  if (alts.length === 0) {
    const globalPool = exercisesDatabase[detectedCategory]?.[place]?.['intermediate'] || [];
    return globalPool.filter(ex => ex.name !== exerciseName).slice(0, 3);
  }
  
  return alts.slice(0, 3);
};
