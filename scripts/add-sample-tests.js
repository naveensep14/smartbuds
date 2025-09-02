const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Please make sure you have:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleTests = [
  {
    title: "Science Quiz - Grade 3",
    description: "Test your knowledge of basic science concepts for 3rd grade students.",
    subject: "Science",
    grade: "Grade 3",
    duration: 10,
    questions: [
      {
        id: "1",
        text: "What is the main source of energy for plants?",
        options: ["Water", "Sunlight", "Soil", "Air"],
        correctAnswer: 1,
        explanation: "Plants use sunlight to make their own food through photosynthesis."
      },
      {
        id: "2",
        text: "Which of these is a living thing?",
        options: ["Rock", "Tree", "Water", "Air"],
        correctAnswer: 1,
        explanation: "Trees are living things that grow, reproduce, and respond to their environment."
      },
      {
        id: "3",
        text: "What do we call the process when water turns into vapor?",
        options: ["Freezing", "Melting", "Evaporation", "Condensation"],
        correctAnswer: 2,
        explanation: "Evaporation is when liquid water turns into water vapor (gas)."
      },
      {
        id: "4",
        text: "Which sense do we use to hear sounds?",
        options: ["Touch", "Sight", "Hearing", "Taste"],
        correctAnswer: 2,
        explanation: "Our ears help us hear sounds around us."
      },
      {
        id: "5",
        text: "What is the hardest part of our body?",
        options: ["Muscle", "Bone", "Teeth", "Skin"],
        correctAnswer: 2,
        explanation: "Tooth enamel is the hardest substance in the human body."
      }
    ]
  },
  {
    title: "Mathematics Test - Grade 3",
    description: "Practice your math skills with this comprehensive 3rd grade mathematics test.",
    subject: "Mathematics",
    grade: "Grade 3",
    duration: 10,
    questions: [
      {
        id: "1",
        text: "What is 7 + 8?",
        options: ["14", "15", "16", "17"],
        correctAnswer: 1,
        explanation: "7 + 8 = 15"
      },
      {
        id: "2",
        text: "How many sides does a triangle have?",
        options: ["2", "3", "4", "5"],
        correctAnswer: 1,
        explanation: "A triangle has exactly 3 sides."
      },
      {
        id: "3",
        text: "What is 5 × 6?",
        options: ["25", "30", "35", "40"],
        correctAnswer: 1,
        explanation: "5 × 6 = 30"
      },
      {
        id: "4",
        text: "Which number comes after 99?",
        options: ["98", "99", "100", "101"],
        correctAnswer: 2,
        explanation: "100 comes after 99."
      },
      {
        id: "5",
        text: "What is half of 20?",
        options: ["5", "10", "15", "20"],
        correctAnswer: 1,
        explanation: "Half of 20 is 10."
      }
    ]
  },
  {
    title: "English Grammar - Grade 3",
    description: "Test your understanding of basic English grammar rules.",
    subject: "English",
    grade: "Grade 3",
    duration: 10,
    questions: [
      {
        id: "1",
        text: "Which word is a noun in the sentence: 'The cat runs fast'?",
        options: ["The", "Cat", "Runs", "Fast"],
        correctAnswer: 1,
        explanation: "'Cat' is a noun - it's a person, place, or thing."
      },
      {
        id: "2",
        text: "What is the past tense of 'run'?",
        options: ["Running", "Runs", "Ran", "Run"],
        correctAnswer: 2,
        explanation: "The past tense of 'run' is 'ran'."
      },
      {
        id: "3",
        text: "Which sentence is correct?",
        options: ["I am going to the store.", "I am going to the store", "i am going to the store.", "I am going to the store?"],
        correctAnswer: 0,
        explanation: "The first sentence has proper capitalization and punctuation."
      },
      {
        id: "4",
        text: "What is the opposite of 'big'?",
        options: ["Large", "Huge", "Small", "Tall"],
        correctAnswer: 2,
        explanation: "The opposite of 'big' is 'small'."
      },
      {
        id: "5",
        text: "Which word rhymes with 'cat'?",
        options: ["Dog", "Hat", "Bird", "Fish"],
        correctAnswer: 1,
        explanation: "'Hat' rhymes with 'cat'."
      }
    ]
  },
  {
    title: "Social Studies - Grade 3",
    description: "Learn about communities, geography, and basic social studies concepts.",
    subject: "Social Studies",
    grade: "Grade 3",
    duration: 10,
    questions: [
      {
        id: "1",
        text: "What is the capital of our country?",
        options: ["New York", "Los Angeles", "Washington D.C.", "Chicago"],
        correctAnswer: 2,
        explanation: "Washington D.C. is the capital of the United States."
      },
      {
        id: "2",
        text: "Which direction is opposite to North?",
        options: ["East", "West", "South", "Up"],
        correctAnswer: 2,
        explanation: "South is opposite to North."
      },
      {
        id: "3",
        text: "What do we call people who live in the same area?",
        options: ["Family", "Friends", "Community", "School"],
        correctAnswer: 2,
        explanation: "A community is a group of people who live in the same area."
      },
      {
        id: "4",
        text: "What is a map used for?",
        options: ["Drawing pictures", "Showing locations", "Writing stories", "Solving math"],
        correctAnswer: 1,
        explanation: "Maps show locations and help us find places."
      },
      {
        id: "5",
        text: "Which is a natural resource?",
        options: ["Car", "Water", "House", "Road"],
        correctAnswer: 1,
        explanation: "Water is a natural resource that comes from nature."
      }
    ]
  }
];

async function addSampleTests() {
  console.log('🚀 Starting to add sample tests to database...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);
  
  try {
    // First, check if tests table exists by trying to get all tests
    const { data: existingTests, error: fetchError } = await supabase
      .from('tests')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error connecting to database:', fetchError.message);
      console.log('\n🔧 Please make sure:');
      console.log('1. Your Supabase project is set up correctly');
      console.log('2. You have created the "tests" table in your Supabase SQL editor');
      console.log('3. Your environment variables are correct');
      return;
    }

    console.log('✅ Database connection successful!');
    console.log(`📊 Found ${existingTests?.length || 0} existing tests`);

    // Add each sample test
    for (const test of sampleTests) {
      console.log(`\n📝 Adding: ${test.title}`);
      
      const { data, error } = await supabase
        .from('tests')
        .insert({
          title: test.title,
          description: test.description,
          subject: test.subject,
          grade: test.grade,
          timelimit: test.duration,
          questions: test.questions
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to add "${test.title}":`, error.message);
      } else {
        console.log(`✅ Successfully added: ${test.title} (ID: ${data.id})`);
      }
    }

    // Verify the tests were added
    const { data: finalTests, error: finalError } = await supabase
      .from('tests')
      .select('*');

    if (finalError) {
      console.error('❌ Error fetching final tests:', finalError.message);
    } else {
      console.log(`\n🎉 Database population complete!`);
      console.log(`📊 Total tests in database: ${finalTests.length}`);
      console.log('\n📋 Tests in database:');
      finalTests.forEach(test => {
        console.log(`  - ${test.title} (${test.subject}, ${test.grade})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

addSampleTests(); 