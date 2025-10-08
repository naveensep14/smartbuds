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

const moduleTests = [
  {
    title: "Module 1 - Fundamental Concepts Assessment",
    description: "Comprehensive test covering fundamental concepts and principles from Module 1 study guide",
    subject: "General Studies",
    grade: "Grade 10",
    board: "CBSE",
    duration: 30,
    questions: [
      {
        id: "1",
        text: "What is the primary purpose of a study guide?",
        options: [
          "To replace textbooks",
          "To organize and summarize key information for learning",
          "To provide answers to all questions",
          "To reduce study time"
        ],
        correctAnswer: 1,
        explanation: "A study guide helps organize and summarize key information to facilitate effective learning."
      },
      {
        id: "2",
        text: "Which of the following is NOT a key component of effective studying?",
        options: [
          "Regular practice",
          "Passive reading only",
          "Active engagement with material",
          "Time management"
        ],
        correctAnswer: 1,
        explanation: "Passive reading alone is not effective; active engagement and practice are essential."
      },
      {
        id: "3",
        text: "What does the acronym 'SQ3R' stand for in study methods?",
        options: [
          "Study, Question, Read, Review, Recite",
          "Survey, Question, Read, Recite, Review",
          "Summarize, Question, Read, Review, Recite",
          "Study, Question, Read, Recite, Review"
        ],
        correctAnswer: 1,
        explanation: "SQ3R stands for Survey, Question, Read, Recite, Review - a proven study method."
      },
      {
        id: "4",
        text: "Which learning style involves learning through visual aids and diagrams?",
        options: [
          "Auditory learning",
          "Kinesthetic learning",
          "Visual learning",
          "Reading/writing learning"
        ],
        correctAnswer: 2,
        explanation: "Visual learning involves processing information through visual aids, diagrams, and images."
      },
      {
        id: "5",
        text: "What is the recommended study session duration for optimal retention?",
        options: [
          "1-2 hours without breaks",
          "25-30 minutes with short breaks",
          "3-4 hours continuously",
          "5-10 minutes only"
        ],
        correctAnswer: 1,
        explanation: "Studies show that 25-30 minute sessions with breaks are optimal for retention."
      },
      {
        id: "6",
        text: "Which technique helps improve memory retention?",
        options: [
          "Cramming the night before",
          "Spaced repetition",
          "Reading once only",
          "Avoiding practice tests"
        ],
        correctAnswer: 1,
        explanation: "Spaced repetition involves reviewing material at increasing intervals to improve retention."
      },
      {
        id: "7",
        text: "What is the purpose of creating mind maps in studying?",
        options: [
          "To make notes look colorful",
          "To organize information visually and show relationships",
          "To reduce study time",
          "To replace textbooks"
        ],
        correctAnswer: 1,
        explanation: "Mind maps help organize information visually and show relationships between concepts."
      },
      {
        id: "8",
        text: "Which of the following is a sign of effective learning?",
        options: [
          "Memorizing without understanding",
          "Being able to explain concepts in your own words",
          "Reading quickly without comprehension",
          "Avoiding difficult topics"
        ],
        correctAnswer: 1,
        explanation: "Being able to explain concepts in your own words indicates true understanding."
      },
      {
        id: "9",
        text: "What is the benefit of studying in groups?",
        options: [
          "It reduces individual responsibility",
          "It allows for discussion, different perspectives, and peer teaching",
          "It guarantees better grades",
          "It eliminates the need for individual study"
        ],
        correctAnswer: 1,
        explanation: "Group study allows for discussion, different perspectives, and peer teaching opportunities."
      },
      {
        id: "10",
        text: "Which of the following is NOT a recommended study environment?",
        options: [
          "Quiet, well-lit room",
          "Distraction-free space",
          "Noisy, crowded area",
          "Comfortable seating"
        ],
        correctAnswer: 2,
        explanation: "A noisy, crowded area is not conducive to effective studying and concentration."
      }
    ]
  },
  {
    title: "Module 1 - Application and Critical Thinking",
    description: "Advanced test focusing on application, analysis, and critical thinking skills from Module 1",
    subject: "General Studies", 
    grade: "Grade 10",
    board: "CBSE",
    duration: 30,
    questions: [
      {
        id: "1",
        text: "If you need to study for a comprehensive exam covering 5 chapters, what would be the most effective approach?",
        options: [
          "Study all chapters in one day",
          "Create a study schedule with spaced review sessions",
          "Focus only on the easiest chapters",
          "Read each chapter once and move on"
        ],
        correctAnswer: 1,
        explanation: "A study schedule with spaced review sessions ensures better retention and understanding."
      },
      {
        id: "2",
        text: "When encountering difficult concepts, what should be your first step?",
        options: [
          "Skip them and move to easier topics",
          "Break them down into smaller, manageable parts",
          "Memorize them without understanding",
          "Ask someone else to study for you"
        ],
        correctAnswer: 1,
        explanation: "Breaking down difficult concepts into smaller parts makes them more manageable and understandable."
      },
      {
        id: "3",
        text: "Which study method would be most effective for preparing for a practical exam?",
        options: [
          "Reading theory only",
          "Combining theory with hands-on practice",
          "Memorizing procedures without understanding",
          "Avoiding practice until the exam day"
        ],
        correctAnswer: 1,
        explanation: "Practical exams require both theoretical knowledge and hands-on practice for success."
      },
      {
        id: "4",
        text: "What is the primary advantage of using flashcards in studying?",
        options: [
          "They eliminate the need for textbooks",
          "They provide active recall practice and spaced repetition",
          "They guarantee perfect grades",
          "They reduce study time to zero"
        ],
        correctAnswer: 1,
        explanation: "Flashcards provide active recall practice and can be used for spaced repetition."
      },
      {
        id: "5",
        text: "If you find yourself struggling to concentrate while studying, what should you do?",
        options: [
          "Continue studying despite distractions",
          "Take a short break and address the distraction",
          "Study for longer hours to compensate",
          "Give up studying entirely"
        ],
        correctAnswer: 1,
        explanation: "Taking breaks and addressing distractions helps maintain focus and study effectiveness."
      },
      {
        id: "6",
        text: "Which approach best demonstrates understanding of a concept?",
        options: [
          "Memorizing definitions word-for-word",
          "Being able to apply the concept to new situations",
          "Reading the material multiple times",
          "Avoiding questions about the topic"
        ],
        correctAnswer: 1,
        explanation: "True understanding is demonstrated by the ability to apply concepts to new situations."
      },
      {
        id: "7",
        text: "What is the most effective way to prepare for different types of exam questions?",
        options: [
          "Study only multiple-choice questions",
          "Practice various question formats and types",
          "Focus only on essay questions",
          "Avoid practice questions entirely"
        ],
        correctAnswer: 1,
        explanation: "Practicing various question formats prepares you for different types of exam questions."
      },
      {
        id: "8",
        text: "Which factor is most important for long-term retention of information?",
        options: [
          "Reading speed",
          "Understanding and meaningful learning",
          "Memorization techniques only",
          "Study location"
        ],
        correctAnswer: 1,
        explanation: "Understanding and meaningful learning lead to better long-term retention than rote memorization."
      },
      {
        id: "9",
        text: "What is the benefit of teaching others what you've learned?",
        options: [
          "It wastes your study time",
          "It reinforces your own understanding and identifies knowledge gaps",
          "It guarantees others will do better than you",
          "It has no educational value"
        ],
        correctAnswer: 1,
        explanation: "Teaching others reinforces your understanding and helps identify areas that need more study."
      },
      {
        id: "10",
        text: "Which study strategy is most effective for retaining information over time?",
        options: [
          "Cramming the night before",
          "Regular review sessions over time",
          "Reading material once only",
          "Avoiding practice tests"
        ],
        correctAnswer: 1,
        explanation: "Regular review sessions over time (spaced repetition) are most effective for long-term retention."
      }
    ]
  }
];

async function addModuleTests() {
  console.log('🚀 Starting to add Module 1 tests to database...');
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

    // Add each module test
    for (const test of moduleTests) {
      console.log(`\n📝 Adding: ${test.title}`);
      
      const { data, error } = await supabase
        .from('tests')
        .insert({
          title: test.title,
          description: test.description,
          subject: test.subject,
          grade: test.grade,
          board: test.board,
          timelimit: test.duration,
          questions: test.questions
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to add "${test.title}":`, error.message);
      } else {
        console.log(`✅ Successfully added: ${test.title} (ID: ${data.id})`);
        console.log(`   - ${test.questions.length} questions`);
        console.log(`   - Duration: ${test.duration} minutes`);
        console.log(`   - Subject: ${test.subject}`);
        console.log(`   - Grade: ${test.grade}`);
        console.log(`   - Board: ${test.board}`);
      }
    }

    // Verify the tests were added
    const { data: finalTests, error: finalError } = await supabase
      .from('tests')
      .select('*');

    if (finalError) {
      console.error('❌ Error fetching final tests:', finalError.message);
    } else {
      console.log(`\n🎉 Module 1 tests added successfully!`);
      console.log(`📊 Total tests in database: ${finalTests.length}`);
      console.log('\n📋 Module 1 Tests Added:');
      moduleTests.forEach(test => {
        console.log(`  - ${test.title} (${test.subject}, ${test.grade})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

addModuleTests();

