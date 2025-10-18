// Integration script to add image generation to existing PDF processor
const { EnhancedPDFProcessor } = require('./enhanced-pdf-processor');
const { HybridImageProcessor } = require('./hybrid-image-processor');

class ImageEnabledPDFProcessor {
  constructor() {
    this.enhancedProcessor = new EnhancedPDFProcessor();
    this.imageProcessor = new HybridImageProcessor();
  }

  async processPDFWithImages(pdfBuffer, subject, grade, board, type = 'coursework', customPrompt = '', chapter = 1, numTests = 5, questionsPerTest = 10) {
    try {
      console.log('🎨 [IMAGE LOG] Starting PDF processing with image generation...');
      
      // Use your existing PDF processing logic
      const PDFProcessor = require('./pdf-processor');
      const pdfProcessor = new PDFProcessor();
      
      // Get the base tests from your existing system
      const baseResult = await pdfProcessor.processPDF(pdfBuffer, subject, grade, board, type, customPrompt, chapter, numTests, questionsPerTest);
      
      if (!baseResult.success) {
        return baseResult;
      }

      // Enhance tests with images
      const enhancedTests = [];
      
      for (let i = 0; i < baseResult.tests.length; i++) {
        const test = baseResult.tests[i];
        console.log(`🎨 [IMAGE LOG] Enhancing test: ${test.title}`);
        
        // Generate a temporary test ID for image generation during upload
        const tempTestId = `temp-${Date.now()}-${i}`;
        
        const enhancedQuestions = await this.enhanceQuestionsWithImages(test.questions, test.title, grade, tempTestId);
        
        enhancedTests.push({
          ...test,
          questions: enhancedQuestions,
          hasImages: enhancedQuestions.some(q => q.hasImage),
          imageCount: enhancedQuestions.filter(q => q.hasImage).length,
          tempTestId: tempTestId // Store temp ID for later reference
        });
      }

      return {
        success: true,
        tests: enhancedTests,
        totalImages: enhancedTests.reduce((sum, test) => sum + test.imageCount, 0),
        message: `Generated ${enhancedTests.length} tests with ${enhancedTests.reduce((sum, test) => sum + test.imageCount, 0)} images`
      };

    } catch (error) {
      console.error('❌ [IMAGE LOG] Image enhancement failed:', error);
      
      // Fallback to regular processing
      const PDFProcessor = require('./pdf-processor');
      const pdfProcessor = new PDFProcessor();
      return await pdfProcessor.processPDF(pdfBuffer, subject, grade, board, type, customPrompt, chapter, numTests, questionsPerTest);
    }
  }

  async enhanceQuestionsWithImages(questions, concept, grade, testId) {
    console.log(`🎨 [IMAGE LOG] Starting image enhancement for ${questions.length} questions`);
    console.log(`🎨 [IMAGE LOG] Concept: ${concept}, Grade: ${grade}, TestId: ${testId}`);
    
    const enhancedQuestions = [];
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionId = `q${i + 1}`;
      
      console.log(`🎨 [IMAGE LOG] Analyzing question ${i + 1}: "${question.question?.substring(0, 100)}..."`);
      
      // Determine if this question needs an image
      const needsImage = this.shouldAddImage(question, concept, grade);
      console.log(`🎨 [IMAGE LOG] Question ${i + 1} needs image: ${needsImage}`);
      
      if (!needsImage) {
        enhancedQuestions.push({
          ...question,
          hasImage: false
        });
        continue;
      }

      try {
        console.log(`🎨 [IMAGE LOG] Generating image for question ${i + 1}...`);
        const imageResult = await this.imageProcessor.generateAndStoreImage(
          question, 
          concept, 
          grade, 
          testId, 
          questionId
        );
        
        if (imageResult.success) {
          enhancedQuestions.push({
            ...question,
            hasImage: true,
            imageId: imageResult.imageId,
            imageType: imageResult.imageType,
            imageDescription: imageResult.imageDescription,
            imagePrompt: imageResult.imagePrompt,
            imageUrl: imageResult.imageUrl,
            imageStatus: imageResult.status
          });
          
          console.log(`✅ [IMAGE LOG] Added image to question ${i + 1} with ID: ${imageResult.imageId}`);
        } else {
          enhancedQuestions.push({
            ...question,
            hasImage: false,
            imageError: imageResult.error
          });
          
          console.error(`❌ [IMAGE LOG] Failed to generate image for question ${i + 1}:`, imageResult.error);
        }
        
      } catch (error) {
        console.error(`❌ [IMAGE LOG] Failed to generate image for question ${i + 1}:`, error);
        
        enhancedQuestions.push({
          ...question,
          hasImage: false,
          imageError: error.message
        });
      }
    }
    
    const questionsWithImages = enhancedQuestions.filter(q => q.hasImage).length;
    console.log(`🎨 [IMAGE LOG] Enhancement complete: ${questionsWithImages}/${questions.length} questions have images`);
    
    return enhancedQuestions;
  }

  shouldAddImage(question, concept, grade) {
    // Comprehensive keywords across all subjects that benefit from visual representation
    const imageKeywords = {
      'mathematics': [
        'triangle', 'circle', 'square', 'rectangle', 'angle', 'geometry', 'polygon',
        'fraction', 'pie chart', 'bar chart', 'graph', 'measurement', 'ruler',
        'length', 'width', 'height', 'area', 'perimeter', 'coordinate', 'axis',
        'plot', 'diagram', 'shape', 'figure', 'symmetry', 'transformation',
        'probability', 'statistics', 'data', 'chart', 'table'
      ],
      'science': [
        'experiment', 'diagram', 'process', 'cycle', 'structure', 'cell', 'organism',
        'ecosystem', 'food chain', 'water cycle', 'photosynthesis', 'respiration',
        'molecule', 'atom', 'element', 'compound', 'reaction', 'force', 'motion',
        'energy', 'wave', 'light', 'sound', 'magnet', 'electricity', 'circuit',
        'planet', 'solar system', 'moon', 'star', 'galaxy', 'weather', 'climate',
        'rock', 'mineral', 'fossil', 'evolution', 'adaptation', 'habitat'
      ],
      'social studies': [
        'map', 'timeline', 'chart', 'diagram', 'flowchart', 'process', 'cycle',
        'government', 'constitution', 'democracy', 'monarchy', 'republic',
        'economy', 'trade', 'commerce', 'currency', 'market', 'supply', 'demand',
        'culture', 'tradition', 'festival', 'religion', 'language', 'art',
        'architecture', 'monument', 'landmark', 'geography', 'continent', 'country',
        'city', 'population', 'migration', 'war', 'battle', 'revolution', 'independence'
      ],
      'english': [
        'story', 'character', 'setting', 'plot', 'diagram', 'timeline', 'sequence',
        'poem', 'rhyme', 'metaphor', 'simile', 'personification', 'alliteration',
        'grammar', 'sentence', 'structure', 'diagram', 'flowchart', 'process',
        'writing', 'essay', 'paragraph', 'outline', 'mind map', 'concept map',
        'vocabulary', 'word', 'definition', 'synonym', 'antonym', 'context'
      ],
      'general': [
        'process', 'step', 'sequence', 'order', 'timeline', 'flowchart', 'diagram',
        'comparison', 'contrast', 'similarity', 'difference', 'relationship',
        'cause', 'effect', 'consequence', 'result', 'outcome', 'solution',
        'problem', 'challenge', 'obstacle', 'barrier', 'opportunity', 'advantage'
      ]
    };

    const questionText = (question.question || '').toLowerCase();
    const conceptText = (concept || '').toLowerCase();
    
    // Check all subject categories
    for (const [subject, keywords] of Object.entries(imageKeywords)) {
      if (keywords.some(keyword => 
        questionText.includes(keyword) || conceptText.includes(keyword)
      )) {
        return true;
      }
    }
    
    return false;
  }

  async generateQuestionImage(question, concept, grade) {
    try {
      const imagePrompt = this.buildImagePrompt(question, concept, grade);
      
      // For now, we'll create structured image data
      // In the future, you can integrate with Imagen 3 or other image generation services
      
      return {
        success: true,
        imagePrompt: imagePrompt,
        imageDescription: this.generateImageDescription(question, concept, grade),
        imageType: this.determineImageType(question, concept),
        imageUrl: null, // Will be populated when image is actually generated
        fallbackText: this.getFallbackText(question, concept, grade)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallbackText: this.getFallbackText(question, concept, grade)
      };
    }
  }

  buildImagePrompt(question, concept, grade) {
    const questionText = question.question || '';
    
    // Mathematics prompts
    if (questionText.includes('triangle') || questionText.includes('angle') || questionText.includes('geometry')) {
      return `Create a geometric diagram showing ${concept} with clear angles, sides, and measurements. Use a white background with black lines and blue labels. Suitable for ${grade} level.`;
    }
    
    if (questionText.includes('fraction') || questionText.includes('pie') || questionText.includes('chart')) {
      return `Create a visual representation of ${concept} using pie charts, bar charts, or fraction circles. Use bright colors and clear labels. Suitable for ${grade} level.`;
    }
    
    if (questionText.includes('graph') || questionText.includes('coordinate') || questionText.includes('axis')) {
      return `Create a simple graph or chart showing ${concept}. Include clear axes, labels, and data points. Use a clean, educational style.`;
    }
    
    if (questionText.includes('measurement') || questionText.includes('ruler') || questionText.includes('length')) {
      return `Create a measurement diagram showing ${concept} with rulers, measuring tools, and labeled dimensions. Use a clean, technical style.`;
    }
    
    // Science prompts
    if (questionText.includes('experiment') || questionText.includes('process') || questionText.includes('cycle')) {
      return `Create a scientific diagram showing ${concept} process or experiment. Use clear arrows, labels, and scientific notation. Suitable for ${grade} level.`;
    }
    
    if (questionText.includes('cell') || questionText.includes('organism') || questionText.includes('ecosystem')) {
      return `Create a biological diagram showing ${concept} with clear labels and scientific accuracy. Use appropriate colors for different parts.`;
    }
    
    if (questionText.includes('solar system') || questionText.includes('planet') || questionText.includes('space')) {
      return `Create an astronomical diagram showing ${concept} with accurate proportions and clear labels. Use dark background with bright celestial objects.`;
    }
    
    if (questionText.includes('molecule') || questionText.includes('atom') || questionText.includes('compound')) {
      return `Create a chemical diagram showing ${concept} with proper molecular structure and chemical notation. Use standard chemistry colors.`;
    }
    
    // Social Studies prompts
    if (questionText.includes('map') || questionText.includes('geography') || questionText.includes('country')) {
      return `Create a map or geographical diagram showing ${concept} with clear borders, labels, and geographical features. Use standard map colors.`;
    }
    
    if (questionText.includes('timeline') || questionText.includes('history') || questionText.includes('event')) {
      return `Create a timeline diagram showing ${concept} with clear dates, events, and chronological order. Use a clean, historical style.`;
    }
    
    if (questionText.includes('government') || questionText.includes('constitution') || questionText.includes('democracy')) {
      return `Create a political diagram showing ${concept} with clear structure, relationships, and labels. Use professional, educational style.`;
    }
    
    if (questionText.includes('economy') || questionText.includes('trade') || questionText.includes('market')) {
      return `Create an economic diagram showing ${concept} with clear flow, relationships, and economic indicators. Use professional business colors.`;
    }
    
    // English prompts
    if (questionText.includes('story') || questionText.includes('character') || questionText.includes('plot')) {
      return `Create a story diagram showing ${concept} with characters, setting, and plot elements. Use engaging, literary style suitable for ${grade} level.`;
    }
    
    if (questionText.includes('poem') || questionText.includes('rhyme') || questionText.includes('metaphor')) {
      return `Create a literary diagram showing ${concept} with poetic elements, structure, and literary devices. Use artistic, creative style.`;
    }
    
    if (questionText.includes('grammar') || questionText.includes('sentence') || questionText.includes('structure')) {
      return `Create a grammar diagram showing ${concept} with clear sentence structure, parts of speech, and grammatical elements. Use educational colors.`;
    }
    
    if (questionText.includes('vocabulary') || questionText.includes('word') || questionText.includes('definition')) {
      return `Create a vocabulary diagram showing ${concept} with word relationships, definitions, and context. Use clear, educational typography.`;
    }
    
    // General prompts
    if (questionText.includes('process') || questionText.includes('step') || questionText.includes('sequence')) {
      return `Create a process diagram showing ${concept} with clear steps, flow, and sequence. Use arrows and clear labels. Suitable for ${grade} level.`;
    }
    
    if (questionText.includes('comparison') || questionText.includes('contrast') || questionText.includes('difference')) {
      return `Create a comparison diagram showing ${concept} with clear similarities and differences. Use side-by-side layout with clear labels.`;
    }
    
    if (questionText.includes('cause') || questionText.includes('effect') || questionText.includes('consequence')) {
      return `Create a cause-and-effect diagram showing ${concept} with clear relationships and connections. Use arrows and logical flow.`;
    }
    
    // Default fallback
    return `Create an educational diagram for ${concept} suitable for ${grade} level students. Use a clean, simple style with clear labels and appropriate colors for the subject matter.`;
  }

  generateImageDescription(question, concept, grade) {
    const questionText = question.question || '';
    
    // Mathematics descriptions
    if (questionText.includes('triangle') || questionText.includes('geometry')) {
      return `Geometric diagram showing ${concept} with labeled angles, sides, and measurements`;
    }
    
    if (questionText.includes('fraction') || questionText.includes('pie') || questionText.includes('chart')) {
      return `Visual representation of ${concept} using pie charts, bar charts, or fraction circles`;
    }
    
    if (questionText.includes('graph') || questionText.includes('coordinate') || questionText.includes('axis')) {
      return `Graph or chart showing ${concept} with labeled axes and data points`;
    }
    
    if (questionText.includes('measurement') || questionText.includes('ruler') || questionText.includes('length')) {
      return `Measurement diagram showing ${concept} with rulers and labeled dimensions`;
    }
    
    // Science descriptions
    if (questionText.includes('experiment') || questionText.includes('process') || questionText.includes('cycle')) {
      return `Scientific diagram showing ${concept} process or experiment with clear steps`;
    }
    
    if (questionText.includes('cell') || questionText.includes('organism') || questionText.includes('ecosystem')) {
      return `Biological diagram showing ${concept} with clear labels and scientific accuracy`;
    }
    
    if (questionText.includes('solar system') || questionText.includes('planet') || questionText.includes('space')) {
      return `Astronomical diagram showing ${concept} with accurate proportions and clear labels`;
    }
    
    if (questionText.includes('molecule') || questionText.includes('atom') || questionText.includes('compound')) {
      return `Chemical diagram showing ${concept} with proper molecular structure and notation`;
    }
    
    // Social Studies descriptions
    if (questionText.includes('map') || questionText.includes('geography') || questionText.includes('country')) {
      return `Map or geographical diagram showing ${concept} with clear borders and labels`;
    }
    
    if (questionText.includes('timeline') || questionText.includes('history') || questionText.includes('event')) {
      return `Timeline diagram showing ${concept} with clear dates and chronological order`;
    }
    
    if (questionText.includes('government') || questionText.includes('constitution') || questionText.includes('democracy')) {
      return `Political diagram showing ${concept} with clear structure and relationships`;
    }
    
    if (questionText.includes('economy') || questionText.includes('trade') || questionText.includes('market')) {
      return `Economic diagram showing ${concept} with clear flow and relationships`;
    }
    
    // English descriptions
    if (questionText.includes('story') || questionText.includes('character') || questionText.includes('plot')) {
      return `Story diagram showing ${concept} with characters, setting, and plot elements`;
    }
    
    if (questionText.includes('poem') || questionText.includes('rhyme') || questionText.includes('metaphor')) {
      return `Literary diagram showing ${concept} with poetic elements and structure`;
    }
    
    if (questionText.includes('grammar') || questionText.includes('sentence') || questionText.includes('structure')) {
      return `Grammar diagram showing ${concept} with clear sentence structure and parts`;
    }
    
    if (questionText.includes('vocabulary') || questionText.includes('word') || questionText.includes('definition')) {
      return `Vocabulary diagram showing ${concept} with word relationships and context`;
    }
    
    // General descriptions
    if (questionText.includes('process') || questionText.includes('step') || questionText.includes('sequence')) {
      return `Process diagram showing ${concept} with clear steps and sequence`;
    }
    
    if (questionText.includes('comparison') || questionText.includes('contrast') || questionText.includes('difference')) {
      return `Comparison diagram showing ${concept} with clear similarities and differences`;
    }
    
    if (questionText.includes('cause') || questionText.includes('effect') || questionText.includes('consequence')) {
      return `Cause-and-effect diagram showing ${concept} with clear relationships`;
    }
    
    return `Educational diagram for ${concept} suitable for ${grade} level`;
  }

  determineImageType(question, concept) {
    const questionText = question.question || '';
    
    // Mathematics types
    if (questionText.includes('triangle') || questionText.includes('geometry') || questionText.includes('angle')) {
      return 'geometric_diagram';
    }
    
    if (questionText.includes('fraction') || questionText.includes('pie') || questionText.includes('chart')) {
      return 'fraction_visual';
    }
    
    if (questionText.includes('graph') || questionText.includes('coordinate') || questionText.includes('axis')) {
      return 'data_chart';
    }
    
    if (questionText.includes('measurement') || questionText.includes('ruler') || questionText.includes('length')) {
      return 'measurement_diagram';
    }
    
    // Science types
    if (questionText.includes('experiment') || questionText.includes('process') || questionText.includes('cycle')) {
      return 'scientific_process';
    }
    
    if (questionText.includes('cell') || questionText.includes('organism') || questionText.includes('ecosystem')) {
      return 'biological_diagram';
    }
    
    if (questionText.includes('solar system') || questionText.includes('planet') || questionText.includes('space')) {
      return 'astronomical_diagram';
    }
    
    if (questionText.includes('molecule') || questionText.includes('atom') || questionText.includes('compound')) {
      return 'chemical_diagram';
    }
    
    // Social Studies types
    if (questionText.includes('map') || questionText.includes('geography') || questionText.includes('country')) {
      return 'geographical_map';
    }
    
    if (questionText.includes('timeline') || questionText.includes('history') || questionText.includes('event')) {
      return 'historical_timeline';
    }
    
    if (questionText.includes('government') || questionText.includes('constitution') || questionText.includes('democracy')) {
      return 'political_diagram';
    }
    
    if (questionText.includes('economy') || questionText.includes('trade') || questionText.includes('market')) {
      return 'economic_diagram';
    }
    
    // English types
    if (questionText.includes('story') || questionText.includes('character') || questionText.includes('plot')) {
      return 'story_diagram';
    }
    
    if (questionText.includes('poem') || questionText.includes('rhyme') || questionText.includes('metaphor')) {
      return 'literary_diagram';
    }
    
    if (questionText.includes('grammar') || questionText.includes('sentence') || questionText.includes('structure')) {
      return 'grammar_diagram';
    }
    
    if (questionText.includes('vocabulary') || questionText.includes('word') || questionText.includes('definition')) {
      return 'vocabulary_diagram';
    }
    
    // General types
    if (questionText.includes('process') || questionText.includes('step') || questionText.includes('sequence')) {
      return 'process_diagram';
    }
    
    if (questionText.includes('comparison') || questionText.includes('contrast') || questionText.includes('difference')) {
      return 'comparison_diagram';
    }
    
    if (questionText.includes('cause') || questionText.includes('effect') || questionText.includes('consequence')) {
      return 'cause_effect_diagram';
    }
    
    return 'educational_diagram';
  }

  getFallbackText(question, concept, grade) {
    return `[Image: ${concept} diagram for ${grade} level - visual representation would be displayed here]`;
  }
}

module.exports = { ImageEnabledPDFProcessor };
